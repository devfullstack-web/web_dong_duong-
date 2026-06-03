import { NextRequest } from 'next/server';
import { decrypt } from '@/services/auth';
import { ZodSchema, ZodError } from 'zod';
import { apiError } from '@/utils/api-response';
import { db } from '@/db';
import { users, roles, user_roles, role_permissions, permissions } from '@/db/schemas';
import { and, eq, isNull, inArray } from 'drizzle-orm';

export interface UserSession {
    user: {
        id: string;
        email: string;
        fullName?: string | null;
        is_super: boolean;
        roles: string[];
        permissions: string[];
    };
}

export type RouteHandlerContext = {
    params: Promise<Record<string, string>>;
} & Record<string, unknown>;

export async function verifyAuth(request: NextRequest): Promise<UserSession | null> {
    const session = request.cookies.get('session')?.value;

    if (!session) {
        return null;
    }

    try {
        const sessionData = await decrypt(session);
        if (!sessionData?.user?.id) return null;

        // Fetch fresh user data and auth info from database
        const [dbUser] = await db
            .select({
                id: users.id,
                email: users.email,
                full_name: users.full_name,
                is_active: users.is_active,
                is_locked: users.is_locked,
            })
            .from(users)
            .where(
                and(
                    eq(users.id, sessionData.user.id),
                    eq(users.is_active, true),
                    eq(users.is_locked, false),
                    isNull(users.deleted_at),
                ),
            )
            .limit(1);

        if (!dbUser) return null;

        // Fetch user roles
        const dbRoles = await db
            .select({
                id: roles.id,
                code: roles.code,
                is_system: roles.is_system,
            })
            .from(user_roles)
            .innerJoin(roles, eq(user_roles.role_id, roles.id))
            .where(eq(user_roles.user_id, dbUser.id));

        const roleCodes = dbRoles.map((r) => r.code);
        const roleIds = dbRoles.map((r) => r.id);
        const isSystem = dbRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');

        // Fetch user permissions
        let userPermissions: string[] = [];
        if (isSystem) {
            userPermissions = ['*'];
        } else if (roleIds.length > 0) {
            const dbPermissions = await db
                .select({
                    code: permissions.code,
                })
                .from(role_permissions)
                .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
                .where(inArray(role_permissions.role_id, roleIds));
            
            userPermissions = Array.from(new Set(dbPermissions.map((p) => p.code)));
        }

        return {
            user: {
                id: dbUser.id,
                email: dbUser.email,
                fullName: dbUser.full_name,
                is_super: isSystem || userPermissions.includes('*'),
                roles: roleCodes,
                permissions: userPermissions,
            }
        };
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
    if (user.is_super || user.permissions?.includes('*')) return true;

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

export function isAdmin(user: UserSession['user']): boolean {
    return user.is_super || user.roles?.includes('admin') || user.roles?.includes('superadmin') || false;
}

export function isSuperAdmin(user: UserSession['user']): boolean {
    return user.is_super || false;
}

export function withAuth(
    handler: (
        request: NextRequest,
        session: UserSession,
        context: RouteHandlerContext,
    ) => Promise<Response>,
    options?: {
        allowedRoles?: string[];
        requiredPermissions?: string[];
    },
) {
    return async (request: NextRequest, context: RouteHandlerContext) => {
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

        // Superadmin bypass
        if (isSuperAdmin(session.user)) {
            return handler(request, session, context);
        }

        if (options?.requiredPermissions && options.requiredPermissions.length > 0) {
            const hasAll = options.requiredPermissions.every((p) => hasPermission(session.user, p));
            if (!hasAll) {
                return apiError(
                    `Forbidden - Required permissions: ${options.requiredPermissions.join(', ')}`,
                    403,
                );
            }
        }

        return handler(request, session, context);
    };
}

export function withHybridAuth(
    handler: (
        request: NextRequest,
        session: UserSession | null,
        context: RouteHandlerContext,
    ) => Promise<Response>,
    options?: {
        requiredPermissions?: string[];
        publicStatuses?: string[];
    },
) {
    return async (request: NextRequest, context: RouteHandlerContext) => {
        const session = await verifyAuth(request);
        const { searchParams } = new URL(request.url);
        const requestedStatus = searchParams.get('status');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        const referer = request.headers.get('referer') || '';
        const isPortalRequest = referer.includes('/portal');

        if (session) {
            // Superadmin bypass
            if (isSuperAdmin(session.user)) {
                return handler(request, session, context);
            }

            if (options?.requiredPermissions && options.requiredPermissions.length > 0) {
                const hasAll = options.requiredPermissions.every((p) =>
                    hasPermission(session.user, p),
                );

                if (!hasAll) {
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
