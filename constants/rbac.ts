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
    'dashboard', 'asset', 'customer', 'device', 'mapgis', 'file', 'trash', 
    'user', 'role', 'permission', 'audit_log',
    'news', 'product', 'project', 'recruitment', 'application', 'comment', 'contact', 'setting'
] as const;

export const SYSTEM_ACTIONS = [
    'view', 'create', 'update', 'delete', 
    'import', 'export', 'upload', 'download', 
    'restore', 'configure', 'assign_permission'
] as const;

// Single Source of Truth mapping permissions ngắn gọn
export const PERMISSIONS = {
    DASHBOARD_VIEW: 'dashboard.view',
    ASSET_VIEW: 'asset.view',
    ASSET_CREATE: 'asset.create',
    ASSET_UPDATE: 'asset.update',
    ASSET_DELETE: 'asset.delete',
    ASSET_IMPORT: 'asset.import',
    ASSET_EXPORT: 'asset.export',
    CUSTOMER_VIEW: 'customer.view',
    CUSTOMER_CREATE: 'customer.create',
    CUSTOMER_UPDATE: 'customer.update',
    CUSTOMER_DELETE: 'customer.delete',
    DEVICE_VIEW: 'device.view',
    DEVICE_CREATE: 'device.create',
    DEVICE_UPDATE: 'device.update',
    DEVICE_DELETE: 'device.delete',
    DEVICE_CONFIGURE: 'device.configure',
    MAPGIS_VIEW: 'mapgis.view',
    MAPGIS_IMPORT: 'mapgis.import',
    MAPGIS_EXPORT: 'mapgis.export',
    FILE_VIEW: 'file.view',
    FILE_UPLOAD: 'file.upload',
    FILE_DOWNLOAD: 'file.download',
    FILE_DELETE: 'file.delete',
    TRASH_VIEW: 'trash.view',
    TRASH_RESTORE: 'trash.restore',
    TRASH_DELETE: 'trash.delete',
    USERS_VIEW: 'user.view',
    USERS_CREATE: 'user.create',
    USERS_UPDATE: 'user.update',
    USERS_DELETE: 'user.delete',
    ROLES_VIEW: 'role.view',
    ROLES_CREATE: 'role.create',
    ROLES_UPDATE: 'role.update',
    ROLES_DELETE: 'role.delete',
    ROLES_ASSIGN: 'role.assign_permission',
    PERMISSION_VIEW: 'permission.view',
    AUDIT_LOG_VIEW: 'audit_log.view',
    
    // CMS
    NEWS_VIEW: 'news.view',
    NEWS_CREATE: 'news.create',
    NEWS_UPDATE: 'news.update',
    NEWS_DELETE: 'news.delete',
    
    // Alias cho BLOG và MEDIA để tương thích ngược
    BLOG_VIEW: 'news.view',
    BLOG_CREATE: 'news.create',
    BLOG_UPDATE: 'news.update',
    BLOG_DELETE: 'news.delete',
    
    MEDIA_VIEW: 'file.view',
    MEDIA_CREATE: 'file.upload',
    MEDIA_DELETE: 'file.delete',

    PRODUCTS_VIEW: 'product.view',
    PRODUCTS_CREATE: 'product.create',
    PRODUCTS_UPDATE: 'product.update',
    PRODUCTS_DELETE: 'product.delete',
    PROJECTS_VIEW: 'project.view',
    PROJECTS_CREATE: 'project.create',
    PROJECTS_UPDATE: 'project.update',
    PROJECTS_DELETE: 'project.delete',
    RECRUITMENT_VIEW: 'recruitment.view',
    RECRUITMENT_CREATE: 'recruitment.create',
    RECRUITMENT_UPDATE: 'recruitment.update',
    RECRUITMENT_DELETE: 'recruitment.delete',
    APPLICATIONS_VIEW: 'application.view',
    APPLICATIONS_CREATE: 'application.create',
    APPLICATIONS_UPDATE: 'application.update',
    APPLICATIONS_DELETE: 'application.delete',
    COMMENTS_VIEW: 'comment.view',
    COMMENTS_CREATE: 'comment.create',
    COMMENTS_UPDATE: 'comment.update',
    COMMENTS_DELETE: 'comment.delete',
    CONTACTS_VIEW: 'contact.view',
    CONTACTS_CREATE: 'contact.create',
    CONTACTS_UPDATE: 'contact.update',
    CONTACTS_DELETE: 'contact.delete',
    SETTINGS_VIEW: 'setting.view',
    SETTINGS_UPDATE: 'setting.update',
} as const;

export type PermissionCode = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Tự động sinh danh sách permissions chi tiết dựa trên mapping trên
export const ALL_SYSTEM_PERMISSIONS = Object.entries(PERMISSIONS).map(([key, code]) => {
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
    
    return {
        code,
        name,
        module,
        action,
        description: name
    };
});

export const PROTECTED_MODULES = ['dashboard', 'user', 'role', 'permission'] as const;

export function buildPermission(module: string, action: string): string {
    return `${module}.${action}`;
}
