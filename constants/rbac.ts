export const PERMISSIONS = {
    ALL: '*',
    DASHBOARD_VIEW: 'dashboard.view',

    // Users
    USERS_ALL: 'user.*',
    USERS_VIEW: 'user.view',
    USERS_CREATE: 'user.create',
    USERS_UPDATE: 'user.update',
    USERS_DELETE: 'user.delete',

    // Roles
    ROLES_ALL: 'role.*',
    ROLES_VIEW: 'role.view',
    ROLES_CREATE: 'role.create',
    ROLES_UPDATE: 'role.update',
    ROLES_DELETE: 'role.delete',
    ROLES_ASSIGN: 'role.assign_permission',

    // News
    BLOG_ALL: 'news.*',
    BLOG_VIEW: 'news.view',
    BLOG_CREATE: 'news.create',
    BLOG_UPDATE: 'news.update',
    BLOG_DELETE: 'news.delete',

    // Media
    MEDIA_ALL: 'file.*',
    MEDIA_VIEW: 'file.view',
    MEDIA_CREATE: 'file.upload',
    MEDIA_DELETE: 'file.delete',

    // Products
    PRODUCTS_ALL: 'product.*',
    PRODUCTS_VIEW: 'product.view',
    PRODUCTS_CREATE: 'product.create',
    PRODUCTS_UPDATE: 'product.update',
    PRODUCTS_DELETE: 'product.delete',

    // Projects
    PROJECTS_ALL: 'project.*',
    PROJECTS_VIEW: 'project.view',
    PROJECTS_CREATE: 'project.create',
    PROJECTS_UPDATE: 'project.update',
    PROJECTS_DELETE: 'project.delete',

    // Recruitment
    RECRUITMENT_ALL: 'recruitment.*',
    RECRUITMENT_VIEW: 'recruitment.view',
    RECRUITMENT_CREATE: 'recruitment.create',
    RECRUITMENT_UPDATE: 'recruitment.update',
    RECRUITMENT_DELETE: 'recruitment.delete',

    // Applications
    APPLICATIONS_ALL: 'application.*',
    APPLICATIONS_VIEW: 'application.view',
    APPLICATIONS_CREATE: 'application.create',
    APPLICATIONS_UPDATE: 'application.update',
    APPLICATIONS_DELETE: 'application.delete',

    // Comments
    COMMENTS_ALL: 'comment.*',
    COMMENTS_VIEW: 'comment.view',
    COMMENTS_CREATE: 'comment.create',
    COMMENTS_UPDATE: 'comment.update',
    COMMENTS_DELETE: 'comment.delete',

    // Contacts
    CONTACTS_ALL: 'contact.*',
    CONTACTS_VIEW: 'contact.view',
    CONTACTS_CREATE: 'contact.create',
    CONTACTS_UPDATE: 'contact.update',
    CONTACTS_DELETE: 'contact.delete',

    // Settings
    SETTINGS_ALL: 'setting.*',
    SETTINGS_UPDATE: 'setting.update',

    // CMS (category management)
    CMS_UPDATE: 'news.update',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Danh sách permissions để sync vào DB
export const ALL_SYSTEM_PERMISSIONS = Array.from(
    new Map(
        Object.entries(PERMISSIONS)
            .filter(([, code]) => code !== '*')
            .map(([, code]) => {
                const [module, action] = code.split('.');
                return [code, { code, module, action, name: `${module}.${action}`, description: `${module}.${action}` }];
            }),
    ).values(),
);
