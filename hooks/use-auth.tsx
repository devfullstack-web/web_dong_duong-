'use client';

import { usePermissions } from '@/hooks/use-permissions';
import type { AuthUser } from '@/stores/auth-store';

export type { AuthUser };

export function useAuth() {
    const { user, isLoading, refreshUser, can, hasRole, isSuperAdmin, isAdmin } =
        usePermissions();

    return {
        user,
        isLoading,
        hasPermission: can,
        hasRole,
        refreshUser,
        isSuperAdmin,
        isAdmin,
    };
}
