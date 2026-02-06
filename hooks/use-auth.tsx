'use client';

import { RBAC_ROLES } from '@/constants/rbac';
import { useAuthStore, AuthUser, SidebarModule } from '@/stores/auth-store';

export type { AuthUser, SidebarModule };

export function useAuth() {
    const { user, isLoading, refreshUser, initialize } = useAuthStore();

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.is_super) return true;
        return user.permissions?.includes(permission) || false;
    };

    const hasRole = (roleCode: string) => {
        if (!user) return false;
        return user.roles?.includes(roleCode) || false;
    };

    // isSuperAdmin checks the new is_super flag
    const isSuperAdmin = user?.is_super || false;

    return {
        user,
        isLoading,
        hasPermission,
        hasRole,
        refreshUser,
        isSuperAdmin,
        isAdmin: isSuperAdmin || user?.roles?.includes(RBAC_ROLES.ADMIN) || false,
    };
}
