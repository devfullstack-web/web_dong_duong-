import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/services/auth-edge';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

import { SITE_ROUTES, ADMIN_ROUTES, API_ROUTES } from '@/constants/routes';

const intlMiddleware = createMiddleware(routing);

// Add paths that don't require authentication
const publicPaths = [
    SITE_ROUTES.LOGIN,
    '/api' + API_ROUTES.AUTH.LOGIN,
    '/api' + API_ROUTES.AUTH.REFRESH,
    '/api' + API_ROUTES.AUTH.LOGOUT,
];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const locale = routing.locales.find(
        (item) => pathname === `/${item}` || pathname.startsWith(`/${item}/`),
    );
    const normalizedPath = locale
        ? pathname.slice(locale.length + 1) || '/'
        : pathname;
    
    // Ignore internal next.js paths and assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/socket.io') ||
        pathname.startsWith('/api') ||
        pathname.includes('favicon.ico') ||
        pathname.includes('.')
    ) {
        // For API routes, we still need our custom proxy logic
        if (pathname.startsWith('/api')) {
             return proxy(request);
        }
        return NextResponse.next();
    }

    // Only run next-intl middleware when the URL is missing a locale prefix.
    // Running it on already-localized routes like /en can cause unnecessary
    // self-proxying in production custom-server mode.
    if (!locale) {
        return intlMiddleware(request);
    }

    return proxy(request, normalizedPath, locale);
}

async function proxy(request: NextRequest, normalizedPath?: string, currentLocale?: string) {
    const { pathname } = request.nextUrl;
    const method = request.method;
    const effectivePath = normalizedPath || pathname;

    // Define locale-prefixed matches
    const isPath = (target: string) => 
        effectivePath === target ||
        effectivePath.startsWith(target + '/');

    // 1. Allow public paths explicitly
    // Since routes might be prefixed with /[locale], we need to check both
    const isPublic = publicPaths.some(path => isPath(path));

    if (isPublic) {
        // If it's the login page and user is already logged in, redirect to portal
        if (isPath(SITE_ROUTES.LOGIN)) {
            const session = request.cookies.get('session')?.value;
            if (session) {
                try {
                    await decrypt(session);
                    // Determine current locale to redirect correctly
                    const targetUrl = currentLocale
                        ? `/${currentLocale}${ADMIN_ROUTES.DASHBOARD}`
                        : ADMIN_ROUTES.DASHBOARD;
                    return NextResponse.redirect(new URL(targetUrl, request.url));
                } catch (e) {
                    // Invalid session, continue to login
                }
            }
        }
        return NextResponse.next();
    }

    // 2. Allow ALL public GET requests for API (Content fetching)
    if (pathname.startsWith('/api/') && method === 'GET') {
        return NextResponse.next();
    }

    // 3. Special case: POST /api/contacts is public (with rate limit already applied)
    if (pathname === '/api' + API_ROUTES.CONTACTS && method === 'POST') {
        return NextResponse.next();
    }

    // 4. Special case: Chat API routes are public (for guest users)
    if (pathname.startsWith('/api/chat/') && ['POST', 'GET', 'PATCH'].includes(method)) {
        return NextResponse.next();
    }

    // 4. Protect /portal and other API methods (POST/PATCH/DELETE)
    const isPortalPath = effectivePath.startsWith(ADMIN_ROUTES.ROOT);
    const isProtectedApi =
        pathname.startsWith('/api/') && ['POST', 'PATCH', 'DELETE', 'PUT'].includes(method);

    if (isPortalPath || isProtectedApi) {
        const session = request.cookies.get('session')?.value;

        if (!session) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized - Authentication required',
                    },
                    { status: 401 },
                );
            }
            // Add locale to redirect url if needed
            const loginUrl = currentLocale
                ? `/${currentLocale}${SITE_ROUTES.LOGIN}`
                : SITE_ROUTES.LOGIN;
            return NextResponse.redirect(new URL(loginUrl, request.url));
        }

        try {
            await decrypt(session);
            // In the new RBAC system, we let the individual route handlers (using withAuth)
            // handle granular permission checks. The global proxy should only ensure:
            // 1. User is authenticated (done above)

            return NextResponse.next();
        } catch (error) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized - Invalid session',
                    },
                    { status: 401 },
                );
            }
            // Add locale to redirect url if needed
            const loginUrl = currentLocale
                ? `/${currentLocale}${SITE_ROUTES.LOGIN}`
                : SITE_ROUTES.LOGIN;
            return NextResponse.redirect(new URL(loginUrl, request.url));
        }
    }

    // Allow everything else (site pages like /, /san-pham, etc.)
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
