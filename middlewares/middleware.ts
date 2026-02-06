import { NextRequest } from 'next/server';
import { decrypt } from '@/services/auth';
import { ZodSchema, ZodError } from 'zod';
import { apiError } from '@/utils/api-response';
import { RBAC_ROLES } from '@/constants/rbac';

export interface UserSession {
    user: {
        id: string;
        username: string;
        full_name?: string | null;
        is_super?: boolean;
        roles: string[];
        permissions: string[];
    };
}

export async function verifyAuth(request: NextRequest): Promise<UserSession | null> {
    const session = request.cookies.get('session')?.value;

    if (!session) {
        return null;
    }

    try {
        const sessionData = await decrypt(session);
        return sessionData as UserSession;
    } catch {
        return null;
    }
}

export async function requireAuth(request: NextRequest): Promise<UserSession | Response> {
    const session = await verifyAuth(request);

    if (!session) {
        return apiError('Unauthorized - Authentication required', 401);
    }

    return session;
}

export function hasRole(user: UserSession['user'], allowedRoles: string[]): boolean {
    return user.roles?.some((r) => allowedRoles.includes(r)) || false;
}

export function hasPermission(user: UserSession['user'], permission: string): boolean {
    if (user.is_super) return true;

    return user.permissions?.includes(permission) || false;
}

export async function requirePermission(
    request: NextRequest,
    permission: string,
): Promise<UserSession | Response> {
    const sessionOrError = await requireAuth(request);

    if (sessionOrError instanceof Response) {
        return sessionOrError;
    }

    if (!hasPermission(sessionOrError.user, permission)) {
        return apiError(`Forbidden - Required permission: ${permission}`, 403);
    }

    return sessionOrError;
}

export async function requireRole(
    request: NextRequest,
    allowedRoles: string[],
): Promise<UserSession | Response> {
    const sessionOrError = await requireAuth(request);

    if (sessionOrError instanceof Response) {
        return sessionOrError;
    }

    if (!hasRole(sessionOrError.user, allowedRoles)) {
        return apiError(`Forbidden - Requires one of: ${allowedRoles.join(', ')}`, 403);
    }

    return sessionOrError;
}

export async function validateBody<T>(
    request: Request,
    schema: ZodSchema<T>,
): Promise<T | Response> {
    try {
        const body = await request.json();
        const validated = schema.parse(body);
        return validated;
    } catch (error) {
        if (error instanceof ZodError) {
            return apiError('Validation failed', 400, { errors: error.issues });
        }
        return apiError('Invalid request body', 400);
    }
}

export function validateQuery<T>(
    searchParams: URLSearchParams,
    schema: ZodSchema<T>,
): T | Response {
    try {
        const params = Object.fromEntries(searchParams.entries());
        const validated = schema.parse(params);
        return validated;
    } catch (error) {
        if (error instanceof ZodError) {
            return apiError('Invalid query parameters', 400, { errors: error.issues });
        }
        return apiError('Invalid query parameters', 400);
    }
}

export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '');
}

export function isAdmin(user: UserSession['user']): boolean {
    return user.is_super || user.roles?.includes(RBAC_ROLES.ADMIN) || false;
}

export function isSuperAdmin(user: UserSession['user']): boolean {
    return user.is_super || false;
}

export function canEdit(user: UserSession['user']): boolean {
    if (isAdmin(user)) return true;
    return user.roles?.some((r) => r.toLowerCase() === 'editor') || false;
}

export async function getUserOrError(
    request: NextRequest,
): Promise<{ user: UserSession['user'] } | Response> {
    const session = await requireAuth(request);

    if (session instanceof Response) {
        return session;
    }

    return { user: session.user };
}

export function withAuth(
    handler: (request: NextRequest, session: UserSession, context?: any) => Promise<Response>,
    options?: {
        allowedRoles?: string[];
        requiredPermissions?: string[];
    },
) {
    return async (request: NextRequest, context?: any) => {
        let sessionOrError: UserSession | Response;

        if (options?.allowedRoles) {
            sessionOrError = await requireRole(request, options.allowedRoles);
        } else {
            sessionOrError = await requireAuth(request);
        }

        if (sessionOrError instanceof Response) {
            return sessionOrError;
        }

        const session = sessionOrError as UserSession;

        if (options?.requiredPermissions && options.requiredPermissions.length > 0) {
            const hasAll = options.requiredPermissions.every((p) => hasPermission(session.user, p));
            if (!hasAll && !isAdmin(session.user)) {
                return apiError(
                    `Forbidden - Required permissions: ${options.requiredPermissions.join(', ')}`,
                    403,
                );
            }
        }

        return handler(request, session, context);
    };
}

export function withValidation<T>(
    handler: (request: NextRequest, data: T, context?: unknown) => Promise<Response>,
    schema: ZodSchema<T>,
) {
    return async (request: NextRequest, context?: unknown) => {
        const dataOrError = await validateBody(request, schema);

        if (dataOrError instanceof Response) {
            return dataOrError;
        }

        return handler(request, dataOrError, context);
    };
}
export function withHybridAuth(
    handler: (
        request: NextRequest,
        session: UserSession | null,
        context?: any,
    ) => Promise<Response>,
    options?: {
        requiredPermissions?: string[];
        publicStatuses?: string[];
    },
) {
    return async (request: NextRequest, context?: any) => {
        const session = await verifyAuth(request);
        const { searchParams } = new URL(request.url);
        const requestedStatus = searchParams.get('status');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        const referer = request.headers.get('referer') || '';
        const isPortalRequest = referer.includes('/portal');

        if (session) {
            if (options?.requiredPermissions && options.requiredPermissions.length > 0) {
                const hasAll = options.requiredPermissions.every((p) =>
                    hasPermission(session.user, p),
                );

                if (!hasAll && !isAdmin(session.user)) {
                    if (isPortalRequest) {
                        return apiError(
                            `Forbidden - Required permissions: ${options.requiredPermissions.join(', ')}`,
                            403,
                        );
                    }

                    const isPublicSafe =
                        (requestedStatus && options.publicStatuses?.includes(requestedStatus)) ||
                        (!requestedStatus && !includeDeleted);

                    if (!isPublicSafe) {
                        return apiError(`Forbidden - Access restricted to public content.`, 403);
                    }
                }
            }
        }

        return handler(request, session, context);
    };
}
