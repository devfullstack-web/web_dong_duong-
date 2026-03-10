import { PORTAL_ROUTES } from './routes';

export interface SidebarItem {
    code: string;
    name: string;
    icon: string;
    route: string;
    /** Permission prefix — user cần có `${permission}:VIEW` để thấy menu item.
     *  null = luôn hiển thị (ví dụ Dashboard, Settings) */
    permission: string | null;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        code: 'DASHBOARD',
        name: 'Bảng điều khiển',
        icon: 'LayoutDashboard',
        route: PORTAL_ROUTES.dashboard,
        permission: null, // luôn hiện
    },
    {
        code: 'PRODUCTS',
        name: 'Quản lý Sản phẩm',
        icon: 'Box',
        route: PORTAL_ROUTES.cms.products.list,
        permission: 'PRODUCTS',
    },
    {
        code: 'BLOG',
        name: 'Quản lý Tin tức',
        icon: 'FileText',
        route: PORTAL_ROUTES.cms.news.list,
        permission: 'BLOG',
    },
    {
        code: 'PROJECTS',
        name: 'Quản lý Dự án',
        icon: 'Briefcase',
        route: PORTAL_ROUTES.cms.projects.list,
        permission: 'PROJECTS',
    },
    {
        code: 'RECRUITMENT',
        name: 'Quản lý Tuyển dụng',
        icon: 'UserRoundSearch',
        route: PORTAL_ROUTES.cms.jobs.list,
        permission: 'RECRUITMENT',
    },
    {
        code: 'APPLICATIONS',
        name: 'Danh sách Ứng viên',
        icon: 'ClipboardList',
        route: PORTAL_ROUTES.cms.applications.list,
        permission: 'APPLICATIONS',
    },
    {
        code: 'COMMENTS',
        name: 'Quản lý Bình luận',
        icon: 'MessageSquare',
        route: PORTAL_ROUTES.cms.comments.list,
        permission: 'COMMENTS',
    },
    {
        code: 'CHAT',
        name: 'Hỗ trợ trực tuyến',
        icon: 'MessageCircle',
        route: PORTAL_ROUTES.cms.chat,
        permission: 'CHAT',
    },
    {
        code: 'MEDIA',
        name: 'Thư viện Media',
        icon: 'Images',
        route: PORTAL_ROUTES.cms.media,
        permission: 'MEDIA',
    },
    {
        code: 'CONTACTS',
        name: 'Quản lý Liên hệ',
        icon: 'Mail',
        route: PORTAL_ROUTES.contacts,
        permission: 'CONTACTS',
    },
    {
        code: 'USERS',
        name: 'Quản lý Tài khoản',
        icon: 'ShieldCheck',
        route: PORTAL_ROUTES.users.list,
        permission: 'USERS',
    },
    {
        code: 'ROLES',
        name: 'Phân quyền & Vai trò',
        icon: 'Lock',
        route: PORTAL_ROUTES.users.roles.list,
        permission: 'ROLES',
    },
    {
        code: 'NOTIFICATIONS',
        name: 'Thông báo hệ thống',
        icon: 'Bell',
        route: '/portal/notifications',
        permission: 'NOTIFICATIONS',
    },
    {
        code: 'LOGS',
        name: 'Nhật ký hệ thống',
        icon: 'History',
        route: '/portal/audit-logs',
        permission: 'LOGS',
    },
    {
        code: 'SETTINGS',
        name: 'Cài đặt hệ thống',
        icon: 'Settings',
        route: PORTAL_ROUTES.settings,
        permission: null, // luôn hiện
    },
];
