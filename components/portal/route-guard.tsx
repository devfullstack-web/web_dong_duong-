'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { PERMISSIONS } from '@/constants/rbac';
import { PORTAL_ROUTES } from '@/constants/routes';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RouteGuardProps {
    children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
    const { user, isLoading, isAdmin, canAny } = usePermissions();
    const pathname = usePathname();

    // If loading, show spinner
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    // Determine authorization based on static route mapping
    const isAuthorized = (() => {
        if (isAdmin) return true;
        if (!user) return false;

        // Dashboard is always accessible for logged-in users
        if (pathname === PORTAL_ROUTES.dashboard) return true;

        // Static route-to-permission mapping
        const routePermissions: { path: string; permission: string }[] = [
            { path: PORTAL_ROUTES.cms.news.list, permission: PERMISSIONS.BLOG_VIEW },
            { path: PORTAL_ROUTES.cms.projects.list, permission: PERMISSIONS.PROJECTS_VIEW },
            { path: PORTAL_ROUTES.cms.products.list, permission: PERMISSIONS.PRODUCTS_VIEW },
            { path: PORTAL_ROUTES.cms.jobs.list, permission: PERMISSIONS.RECRUITMENT_VIEW },
            { path: PORTAL_ROUTES.cms.applications.list, permission: PERMISSIONS.APPLICATIONS_VIEW },
            { path: PORTAL_ROUTES.cms.comments.list, permission: PERMISSIONS.COMMENTS_VIEW },
            { path: PORTAL_ROUTES.cms.media, permission: PERMISSIONS.MEDIA_VIEW },
            { path: PORTAL_ROUTES.contacts, permission: PERMISSIONS.CONTACTS_VIEW },
            { path: PORTAL_ROUTES.users.list, permission: PERMISSIONS.USERS_VIEW },
            { path: PORTAL_ROUTES.users.roles.list, permission: PERMISSIONS.ROLES_VIEW },
            { path: PORTAL_ROUTES.settings, permission: PERMISSIONS.ROLES_VIEW },
        ];

        // Find ALL matching routes (longest path first)
        const matchingRoutes = routePermissions
            .filter((r) => pathname.startsWith(r.path))
            .sort((a, b) => b.path.length - a.path.length);

        if (matchingRoutes.length === 0) return true; // Allow routes not in the list

        // Get the longest matching path
        const longestPathLength = matchingRoutes[0].path.length;

        // Check if user has ANY of the permissions for this route
        // (support multiple permission codes for same route)
        const permissionsForRoute = matchingRoutes
            .filter((r) => r.path.length === longestPathLength)
            .map((r) => r.permission);

        return canAny(permissionsForRoute);
    })();

    // If user is not logged in, return null (handled by middleware redirect)
    // This prevents the "Permission Denied" UI from flashing during logout
    if (!user && !isLoading) {
        return null;
    }

    // If not authorized, show inline Permission Denied UI instead of redirecting
    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white border border-slate-200 shadow-sm animate-in fade-in duration-500">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                    <Lock className="size-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3">
                    Quyền truy cập bị từ chối
                </h3>
                <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
                    Tài khoản của bạn không được cấp quyền truy cập vào chuyên mục này. Vui lòng
                    liên hệ quản trị viên hệ thống để yêu cầu quyền truy cập.
                </p>
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-black uppercase tracking-widest text-[10px] px-8 py-6 h-auto"
                    >
                        <Link href={PORTAL_ROUTES.dashboard}>Quay về Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
