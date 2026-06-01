export const RBAC_ROLES = {
    ADMIN: 'ADMIN',
    EDITOR: 'EDITOR',
    VIEWER: 'VIEWER',
} as const;

export const AUTH_ROLE_CODES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
} as const;

export const AUTH_ROLE_CODE_VALUES = [
    AUTH_ROLE_CODES.ADMIN,
    AUTH_ROLE_CODES.EDITOR,
    AUTH_ROLE_CODES.VIEWER,
] as const;

export type AuthRoleCode = (typeof AUTH_ROLE_CODE_VALUES)[number];

/**
 * Single Source of Truth — tất cả module codes trong hệ thống.
 * Khi thêm module mới: thêm vào đây + seed lại DB + cập nhật SIDEBAR_ITEMS.
 */
export const MODULE_CODES = {
    DASHBOARD: 'DASHBOARD',
    PRODUCTS: 'PRODUCTS',
    BLOG: 'BLOG',
    PROJECTS: 'PROJECTS',
    RECRUITMENT: 'RECRUITMENT',
    APPLICATIONS: 'APPLICATIONS',
    COMMENTS: 'COMMENTS',
    MEDIA: 'MEDIA',
    CONTACTS: 'CONTACTS',
    USERS: 'USERS',
    ROLES: 'ROLES',
    MODULES: 'MODULES',
    NOTIFICATIONS: 'NOTIFICATIONS',
    LOGS: 'LOGS',
    SETTINGS: 'SETTINGS',
} as const;

export type ModuleCode = (typeof MODULE_CODES)[keyof typeof MODULE_CODES];

// Permission action types
export const PERMISSION_ACTIONS = {
    VIEW: 'VIEW',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
} as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];
export type PermissionCode = `${string}:${PermissionAction}`;

export const PERMISSIONS: Record<string, PermissionCode> = new Proxy({} as Record<string, PermissionCode>, {
    get: (_target, prop: string) => {
        if (typeof prop !== 'string' || prop === '$$typeof' || prop === 'toJSON') {
            return undefined;
        }

        // Split by last underscore: MODULE_ACTION -> [MODULE, ACTION]
        // Example: RECRUITMENT_VIEW -> ["RECRUITMENT", "VIEW"]
        // Important: Action should be one of PERMISSION_ACTIONS
        const lastUnderscoreIndex = prop.lastIndexOf('_');
        if (lastUnderscoreIndex === -1) return prop as PermissionCode;

        const moduleCode = prop.substring(0, lastUnderscoreIndex);
        const action = prop.substring(lastUnderscoreIndex + 1);

        return `${moduleCode}:${action}` as PermissionCode;
    },
});

// Modules that cannot be deleted
export const PROTECTED_MODULES: string[] = [
    MODULE_CODES.DASHBOARD,
    MODULE_CODES.USERS,
    MODULE_CODES.ROLES,
    MODULE_CODES.MODULES,
];

export function buildPermission(module: string, action: PermissionAction): PermissionCode {
    return `${module}:${action}`;
}
