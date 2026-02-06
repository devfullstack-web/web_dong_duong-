import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/services/auth';

import { SITE_ROUTES, ADMIN_ROUTES, API_ROUTES } from '@/constants/routes';

// Add paths that don't require authentication
const publicPaths = [
    SITE_ROUTES.LOGIN,
    '/api' + API_ROUTES.AUTH.LOGIN,
    '/api' + API_ROUTES.AUTH.REFRESH,
    '/api' + API_ROUTES.AUTH.LOGOUT,
];

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // 1. Allow public paths explicitly
    if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
        // If it's the login page and user is already logged in, redirect to portal
        if (pathname === SITE_ROUTES.LOGIN) {
            const session = request.cookies.get('session')?.value;
            if (session) {
                try {
                    await decrypt(session);
                    return NextResponse.redirect(new URL(ADMIN_ROUTES.DASHBOARD, request.url));
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
    const isPortalPath = pathname.startsWith(ADMIN_ROUTES.ROOT);
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
            return NextResponse.redirect(new URL(SITE_ROUTES.LOGIN, request.url));
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
            return NextResponse.redirect(new URL(SITE_ROUTES.LOGIN, request.url));
        }
    }

    // Allow everything else (site pages like /, /san-pham, etc.)
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
