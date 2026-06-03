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


// Định nghĩa ngắn gọn danh sách các Modules và Actions
export const SYSTEM_MODULES = [
    'dashboard', 'file', 'user', 'role', 'permission', 'audit_log',
    'news', 'product', 'project', 'recruitment', 'application', 'comment', 'contact', 'setting'
] as const;

export const SYSTEM_ACTIONS = [
    'view', 'create', 'update', 'delete', 'upload', 'assign_permission'
] as const;

// Single Source of Truth mapping permissions ngắn gọn
export enum Permissions {
    ALL = '*',

    DASHBOARD_VIEW = 'dashboard.view',

    FILE_ALL = 'file.*',
    FILE_VIEW = 'file.view',
    FILE_UPLOAD = 'file.upload',
    FILE_DELETE = 'file.delete',

    USER_ALL = 'user.*',
    USER_VIEW = 'user.view',
    USER_CREATE = 'user.create',
    USER_UPDATE = 'user.update',
    USER_DELETE = 'user.delete',

    ROLE_ALL = 'role.*',
    ROLE_VIEW = 'role.view',
    ROLE_CREATE = 'role.create',
    ROLE_UPDATE = 'role.update',
    ROLE_DELETE = 'role.delete',
    ROLE_ASSIGN = 'role.assign_permission',

    PERMISSION_ALL = 'permission.*',
    PERMISSION_VIEW = 'permission.view',

    AUDIT_ALL = 'audit_log.*',
    AUDIT_VIEW = 'audit_log.view',

    // CMS
    NEWS_ALL = 'news.*',
    NEWS_VIEW = 'news.view',
    NEWS_CREATE = 'news.create',
    NEWS_UPDATE = 'news.update',
    NEWS_DELETE = 'news.delete',

    PRODUCTS_ALL = 'product.*',
    PRODUCTS_VIEW = 'product.view',
    PRODUCTS_CREATE = 'product.create',
    PRODUCTS_UPDATE = 'product.update',
    PRODUCTS_DELETE = 'product.delete',

    PROJECTS_ALL = 'project.*',
    PROJECTS_VIEW = 'project.view',
    PROJECTS_CREATE = 'project.create',
    PROJECTS_UPDATE = 'project.update',
    PROJECTS_DELETE = 'project.delete',

    RECRUITMENT_ALL = 'recruitment.*',
    RECRUITMENT_VIEW = 'recruitment.view',
    RECRUITMENT_CREATE = 'recruitment.create',
    RECRUITMENT_UPDATE = 'recruitment.update',
    RECRUITMENT_DELETE = 'recruitment.delete',

    APPLICATIONS_ALL = 'application.*',
    APPLICATIONS_VIEW = 'application.view',
    APPLICATIONS_CREATE = 'application.create',
    APPLICATIONS_UPDATE = 'application.update',
    APPLICATIONS_DELETE = 'application.delete',

    COMMENTS_ALL = 'comment.*',
    COMMENTS_VIEW = 'comment.view',
    COMMENTS_CREATE = 'comment.create',
    COMMENTS_UPDATE = 'comment.update',
    COMMENTS_DELETE = 'comment.delete',

    CONTACTS_ALL = 'contact.*',
    CONTACTS_VIEW = 'contact.view',
    CONTACTS_CREATE = 'contact.create',
    CONTACTS_UPDATE = 'contact.update',
    CONTACTS_DELETE = 'contact.delete',

    SETTINGS_ALL = 'setting.*',
    SETTINGS_VIEW = 'setting.view',
    SETTINGS_UPDATE = 'setting.update',
}

export const PERMISSIONS = {
    ...Permissions,

    // Tương thích ngược alias cũ
    USERS_VIEW: Permissions.USER_VIEW,
    USERS_CREATE: Permissions.USER_CREATE,
    USERS_UPDATE: Permissions.USER_UPDATE,
    USERS_DELETE: Permissions.USER_DELETE,

    ROLES_VIEW: Permissions.ROLE_VIEW,
    ROLES_CREATE: Permissions.ROLE_CREATE,
    ROLES_UPDATE: Permissions.ROLE_UPDATE,
    ROLES_DELETE: Permissions.ROLE_DELETE,
    ROLES_ASSIGN: Permissions.ROLE_ASSIGN,

    BLOG_VIEW: Permissions.NEWS_VIEW,
    BLOG_CREATE: Permissions.NEWS_CREATE,
    BLOG_UPDATE: Permissions.NEWS_UPDATE,
    BLOG_DELETE: Permissions.NEWS_DELETE,

    MEDIA_VIEW: Permissions.FILE_VIEW,
    MEDIA_CREATE: Permissions.FILE_UPLOAD,
    MEDIA_DELETE: Permissions.FILE_DELETE,
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Tự động sinh danh sách permissions chi tiết dựa trên mapping trên
export const ALL_SYSTEM_PERMISSIONS = Array.from(
    new Map(
        Object.entries(PERMISSIONS)
            .filter(([key, code]) => code !== '*')
            .map(([key, code]) => {
                const [module, action] = code.split('.');
                
                // Tạo name thân thiện từ key
                let name = `Quyền ${action} trên module ${module}`;
                if (code === 'dashboard.view') name = 'Xem Dashboard';
                else if (code.startsWith('user.')) name = `${action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'update' ? 'Sửa' : 'Xóa'} người dùng`;
                else if (code.startsWith('role.')) name = `${action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'update' ? 'Sửa' : action === 'assign_permission' ? 'Gán quyền cho' : 'Xóa'} vai trò`;
                else if (code === 'permission.view') name = 'Xem danh sách quyền';
                else if (code === 'audit_log.view') name = 'Xem nhật ký hệ thống';
                else if (code.startsWith('news.')) name = `${action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'update' ? 'Sửa' : 'Xóa'} tin tức`;
                else if (code.startsWith('product.')) name = `${action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'update' ? 'Sửa' : 'Xóa'} sản phẩm`;
                else if (code.startsWith('project.')) name = `${action === 'view' ? 'Xem' : action === 'create' ? 'Tạo' : action === 'update' ? 'Sửa' : 'Xóa'} dự án`;
                
                return [code, {
                    code,
                    name,
                    module,
                    action,
                    description: name
                }];
            })
    ).values()
);

export const PROTECTED_MODULES = ['dashboard', 'user', 'role', 'permission'] as const;

export function buildPermission(module: string, action: string): string {
    return `${module}.${action}`;
}
