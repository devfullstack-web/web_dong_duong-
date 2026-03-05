export const SITE_ROUTES = {
    HOME: '/',
    ABOUT: '/gioi-thieu',
    PRODUCTS: '/san-pham',
    PROJECTS: '/du-an',
    NEWS: '/tin-tuc',
    CONTACT: '/lien-he',
    RECRUITMENT: '/tuyen-dung',
    SOLUTIONS: {
        WATER_MANAGEMENT: '/giai-phap/quan-ly-nuoc-thong-minh',
        AGRICULTURE: '/giai-phap/nong-nghiep-chinh-xac',
        AQUACULTURE: '/giai-phap/quan-trac-nuoi-trong-thuy-san',
    },
    LOGIN: '/login',
} as const;

export const PORTAL_ROUTES = {
    // Dashboard
    dashboard: '/portal',

    // CMS Routes
    cms: {
        news: {
            list: '/portal/cms/news',
            add: '/portal/cms/news/add',
            edit: (id: string) => `/portal/cms/news/${id}/edit`,
            categories: {
                list: '/portal/cms/news/categories',
                add: '/portal/cms/news/categories/add',
                edit: (id: string) => `/portal/cms/news/categories/${id}/edit`,
            },
        },
        projects: {
            list: '/portal/cms/projects',
            add: '/portal/cms/projects/add',
            edit: (id: string) => `/portal/cms/projects/${id}/edit`,
            categories: {
                list: '/portal/cms/projects/categories',
                add: '/portal/cms/projects/categories/add',
                edit: (id: string) => `/portal/cms/projects/categories/${id}/edit`,
            },
        },
        products: {
            list: '/portal/cms/products',
            add: '/portal/cms/products/add',
            edit: (id: string) => `/portal/cms/products/${id}/edit`,
            categories: {
                list: '/portal/cms/products/categories',
                add: '/portal/cms/products/categories/add',
                edit: (id: string) => `/portal/cms/products/categories/${id}/edit`,
            },
        },
        jobs: {
            list: '/portal/cms/jobs',
            add: '/portal/cms/jobs/add',
            edit: (id: string) => `/portal/cms/jobs/${id}/edit`,
        },
        applications: {
            list: '/portal/cms/applications',
            edit: (id: string) => `/portal/cms/applications/${id}`,
        },
        comments: {
            list: '/portal/cms/comments',
        },
        chat: '/portal/cms/chat',
        media: '/portal/cms/media',
    },

    users: {
        list: '/portal/users',
        add: '/portal/users/add',
        edit: (id: string) => `/portal/users/${id}`,
        roles: {
            list: '/portal/users/roles',
            add: '/portal/users/roles/add',
            edit: (id: string) => `/portal/users/roles/${id}/edit`,
        },
        modules: {
            list: '/portal/users/modules',
            add: '/portal/users/modules/add',
            edit: (id: string) => `/portal/users/modules/${id}/edit`,
        },
    },
    contacts: '/portal/contacts',
    notifications: '/portal/notifications',
    settings: '/portal/settings',
} as const;

export const ADMIN_ROUTES = {
    ROOT: '/portal',
    DASHBOARD: '/portal',
} as const;

export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
    },
    PRODUCTS: '/products',
    NEWS: '/news',
    PROJECTS: '/projects',
    CONTACTS: '/contacts',
    CATEGORIES: '/categories',
    USERS: '/users',
    AUTHORS: '/authors',
    MEDIA: '/media',
    STATS: '/stats',
    JOBS: '/jobs',
    APPLICATIONS: '/applications',
    ROLES: '/roles',
    PERMISSIONS: '/permissions',
    MODULES: '/modules',
    COMMENTS: '/portal/comments',
    NOTIFICATIONS: '/portal/notifications',
    UPLOAD: '/upload',
    CHAT: {
        SESSIONS: '/chat/sessions',
        MESSAGES: '/chat/messages',
    },
    AUDIT_LOGS: '/audit-logs',
    AUDIT_LOGS_CLEANUP: '/audit-logs/cleanup',
} as const;

export type PortalRoute = typeof PORTAL_ROUTES;
