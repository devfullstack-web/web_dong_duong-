'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { PermissionCode } from '@/utils/permissions';

export type PermissionInput = PermissionCode | string;

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const refreshUser = useAuthStore((state) => state.refreshUser);

    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];
    const isAuthenticated = Boolean(user);
    const isSystem = Boolean(user?.is_system) || permissions.includes('*');
    const isAdmin = isSystem || roles.includes('admin');

    const can = useCallback(
        (permission: PermissionInput) => {
            if (!isAuthenticated || !permission) return false;
            if (isSystem) return true;
            return permissions.includes(permission);
        },
        [isAuthenticated, isSystem, permissions],
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
            isSystem,
            isAdmin,
            refreshUser,
            can,
            canAny,
            hasRole,
        }),
        [
            user, roles, permissions,
            isLoading, isInitialized, isAuthenticated,
            isSystem, isAdmin,
            refreshUser, can, canAny, hasRole,
        ],
    );
}
