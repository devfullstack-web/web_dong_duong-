import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/services/auth-edge';
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

async function isValidSession(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    try {
        await decrypt(token);
        return true;
    } catch {
        return false;
    }
}

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
    const configuredBaseUrl = process.env.APP_URL;

    if (configuredBaseUrl) {
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

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isStaticAsset(pathname)) return NextResponse.next();
    if (pathname.startsWith('/api')) return handleApi(request);

    const locale = routing.locales.find(
        (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
    );
    const normalizedPath = locale ? pathname.slice(locale.length + 1) || '/' : pathname;

    const authRedirect = await checkPageAuth(request, normalizedPath, locale);
    if (authRedirect) return authRedirect;

    return fixRedirectPort(intlMiddleware(request));
}

async function checkPageAuth(
    request: NextRequest,
    normalizedPath: string,
    locale: string | undefined,
): Promise<NextResponse | null> {
    const session = request.cookies.get('session')?.value;
    const isPublic = PUBLIC_PATHS.some((p) => matchesPath(normalizedPath, p));

    if (isPublic) {
        const onLogin = matchesPath(normalizedPath, SITE_ROUTES.LOGIN);
        if (onLogin && (await isValidSession(session))) {
            return safeRedirect(localized(ADMIN_ROUTES.DASHBOARD, locale), request);
        }
        return null;
    }

    if (!normalizedPath.startsWith(ADMIN_ROUTES.ROOT)) return null;

    if (await isValidSession(session)) return null;
    return safeRedirect(localized(SITE_ROUTES.LOGIN, locale), request);
}

async function handleApi(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const { method } = request;

    if (method === 'GET') return NextResponse.next();
    if (PUBLIC_PATHS.some((p) => matchesPath(pathname, p))) return NextResponse.next();

    if (pathname === `/api${API_ROUTES.CONTACTS}` && method === 'POST') {
        return NextResponse.next();
    }

    if (!WRITE_METHODS.has(method)) return NextResponse.next();

    const session = request.cookies.get('session')?.value;
    if (!session) return apiUnauthorized('Authentication required');
    if (!(await isValidSession(session))) return apiUnauthorized('Invalid session');
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
