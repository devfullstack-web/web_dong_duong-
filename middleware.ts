import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, encrypt } from '@/services/auth-edge';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

import { SITE_ROUTES, ADMIN_ROUTES, API_ROUTES } from '@/constants/routes';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
    SITE_ROUTES.LOGIN,
    `/api${API_ROUTES.AUTH.LOGIN}`,
    `/api${API_ROUTES.AUTH.REFRESH}`,
    `/api${API_ROUTES.AUTH.LOGOUT}`,
];

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const isLocalHostname = (hostname: string) =>
    hostname === 'localhost' || hostname === '127.0.0.1';

const matchesPath = (value: string, target: string) =>
    value === target || value.startsWith(`${target}/`);

const localized = (path: string, locale: string | undefined) =>
    locale ? `/${locale}${path}` : path;

// Reverse proxy may forward upstream ports (e.g. :3000) into the Location
// header. Strip them so the browser doesn't follow back to the internal port.
function fixRedirectPort(response: NextResponse): NextResponse {
    const location = response.headers.get('location');
    if (!location) return response;
    try {
        const url = new URL(location);
        if (isLocalHostname(url.hostname)) return response;
        if (url.port && url.port !== '80' && url.port !== '443') {
            url.port = '';
            return NextResponse.redirect(url.toString(), response.status || 307);
        }
    } catch {}
    return response;
}

function safeRedirect(path: string, request: NextRequest): NextResponse {
    // 1. Ưu tiên lấy host và proto từ request header (Nginx reverse proxy chuyển tiếp qua)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';

    if (host && !isLocalHostname(host.split(':')[0])) {
        try {
            return NextResponse.redirect(new URL(path, `${proto}://${host}`));
        } catch {}
    }

    // 2. Nếu có APP_URL và APP_URL không phải localhost thì mới dùng
    const configuredBaseUrl = process.env.APP_URL;
    if (configuredBaseUrl && !configuredBaseUrl.includes('localhost') && !configuredBaseUrl.includes('127.0.0.1')) {
        try {
            return NextResponse.redirect(new URL(path, configuredBaseUrl));
        } catch {}
    }

    return NextResponse.redirect(new URL(path, request.nextUrl.origin));
}

const apiUnauthorized = (reason: string) =>
    NextResponse.json(
        { success: false, error: `Unauthorized - ${reason}` },
        { status: 401 },
    );

const isStaticAsset = (pathname: string) =>
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico') ||
    (pathname.includes('.') && !pathname.startsWith('/api'));

interface AuthResult {
    user: { id: string; email: string } | null;
    newTokens?: { accessToken: string; refreshToken: string };
}

async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
        try {
            const payload = await decrypt(accessToken);
            if (payload?.user?.id && payload?.user?.email) {
                return { user: payload.user as { id: string; email: string } };
            }
        } catch {
            // Proceed to check refresh token
        }
    }

    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (refreshToken) {
        try {
            const payload = await decrypt(refreshToken);
            if (payload?.user?.id && payload?.user?.email) {
                const userPayload = {
                    id: String(payload.user.id),
                    email: String(payload.user.email),
                };
                const newAccessToken = await encrypt({ user: userPayload }, '15m');
                const newRefreshToken = await encrypt({ user: userPayload }, '7d');
                return {
                    user: userPayload,
                    newTokens: {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    },
                };
            }
        } catch {
            // Both tokens invalid
        }
    }

    return { user: null };
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isStaticAsset(pathname)) return NextResponse.next();

    const authResult = await authenticateRequest(request);

    let response: NextResponse | null = null;

    if (pathname.startsWith('/api')) {
        response = await handleApi(request, authResult);
    } else {
        const locale = routing.locales.find(
            (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
        );
        const normalizedPath = locale ? pathname.slice(locale.length + 1) || '/' : pathname;

        response = await checkPageAuth(request, normalizedPath, locale, authResult);
    }

    if (!response) {
        response = fixRedirectPort(intlMiddleware(request));
    }

    if (authResult.newTokens) {
        const secure = process.env.NODE_ENV === 'production';
        const { accessToken, refreshToken } = authResult.newTokens;

        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60,
            path: '/',
            sameSite: 'lax',
            secure,
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure,
        });
    }

    return response;
}

async function checkPageAuth(
    request: NextRequest,
    normalizedPath: string,
    locale: string | undefined,
    authResult: AuthResult,
): Promise<NextResponse | null> {
    const user = authResult.user;
    const isPublic = PUBLIC_PATHS.some((p) => matchesPath(normalizedPath, p));

    if (isPublic) {
        const onLogin = matchesPath(normalizedPath, SITE_ROUTES.LOGIN);
        if (onLogin && user) {
            return safeRedirect(localized(ADMIN_ROUTES.DASHBOARD, locale), request);
        }
        return null;
    }

    if (!normalizedPath.startsWith(ADMIN_ROUTES.ROOT)) return null;

    if (user) return null;
    return safeRedirect(localized(SITE_ROUTES.LOGIN, locale), request);
}

async function handleApi(request: NextRequest, authResult: AuthResult): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const { method } = request;

    if (method === 'GET') return NextResponse.next();
    if (PUBLIC_PATHS.some((p) => matchesPath(pathname, p))) return NextResponse.next();

    if (pathname === `/api${API_ROUTES.CONTACTS}` && method === 'POST') {
        return NextResponse.next();
    }

    if (!WRITE_METHODS.has(method)) return NextResponse.next();

    if (!authResult.user) {
        return apiUnauthorized('Authentication required');
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
