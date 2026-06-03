'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { PermissionCode } from '@/constants/rbac';

export type PermissionInput = PermissionCode | string;

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const refreshUser = useAuthStore((state) => state.refreshUser);

    const roles = useMemo(() => user?.roles ?? [], [user?.roles]);
    const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
    const isAuthenticated = Boolean(user);
    const isAdmin = Boolean(user?.is_system) || permissions.includes('*');

    const can = useCallback(
        (permission: PermissionInput) => {
            if (!isAuthenticated || !permission) return false;
            if (isAdmin) return true;
            if (permissions.includes(permission)) return true;
            // Wildcard: 'user.*' matches 'user.view', etc.
            const mod = permission.split('.')[0];
            return permissions.includes(`${mod}.*`);
        },
        [isAuthenticated, isAdmin, permissions],
    );

    const canAny = useCallback(
        (items: PermissionInput[]) => items.some(can),
        [can],
    );

    const hasRole = useCallback(
        (code: string) => roles.includes(code),
        [roles],
    );

    return useMemo(
        () => ({
            user,
            roles,
            permissions,
            isLoading,
            isInitialized,
            isAuthenticated,
            isAdmin,
            refreshUser,
            can,
            canAny,
            hasRole,
        }),
        [
            user, roles, permissions,
            isLoading, isInitialized, isAuthenticated,
            isAdmin,
            refreshUser, can, canAny, hasRole,
        ],
    );
}
