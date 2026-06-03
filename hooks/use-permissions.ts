'use client';

import { useCallback, useMemo } from 'react';
import { RBAC_ROLES } from '@/constants/rbac';
import { useAuthStore } from '@/stores/auth-store';
import type { PermissionCode } from '@/utils/permissions';

export type PermissionInput = PermissionCode | string;

const EMPTY_LIST: string[] = [];

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const refreshUser = useAuthStore((state) => state.refreshUser);

    const roles = user?.roles ?? EMPTY_LIST;
    const permissions = user?.permissions ?? EMPTY_LIST;
    const isAuthenticated = Boolean(user);
    const isSuperAdmin = (user?.is_super ?? false) || permissions.includes('*');
    const isAdmin = isSuperAdmin || roles.includes(RBAC_ROLES.ADMIN);

    const can = useCallback(
        (permission: PermissionInput) => {
            if (!isAuthenticated) return false;
            if (isSuperAdmin) return true;
            if (permissions.includes('*')) return true;
            return permissions.includes(permission);
        },
        [isAuthenticated, isSuperAdmin, permissions],
    );

    const canAny = useCallback(
        (items: PermissionInput[]) => items.some((permission) => can(permission)),
        [can],
    );

    const canAll = useCallback(
        (items: PermissionInput[]) => items.every((permission) => can(permission)),
        [can],
    );

    const hasRole = useCallback((roleCode: string) => roles.includes(roleCode), [roles]);

    const hasAnyRole = useCallback(
        (items: string[]) => items.some((roleCode) => hasRole(roleCode)),
        [hasRole],
    );

    const hasAllRoles = useCallback(
        (items: string[]) => items.every((roleCode) => hasRole(roleCode)),
        [hasRole],
    );

    return useMemo(
        () => ({
            user,
            roles,
            permissions,
            isLoading,
            isInitialized,
            isAuthenticated,
            isSuperAdmin,
            isAdmin,
            refreshUser,
            can,
            canAny,
            canAll,
            hasRole,
            hasAnyRole,
            hasAllRoles,
        }),
        [
            user,
            roles,
            permissions,
            isLoading,
            isInitialized,
            isAuthenticated,
            isSuperAdmin,
            isAdmin,
            refreshUser,
            can,
            canAny,
            canAll,
            hasRole,
            hasAnyRole,
            hasAllRoles,
        ],
    );
}
