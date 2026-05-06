import { PORTAL_ROUTES } from './routes';
import { MODULE_CODES, type ModuleCode } from './rbac';

export interface SidebarItem {
    code: ModuleCode;
    name: string;
    icon: string;
    route: string;
    /** Permission prefix — user cần có `${permission}:VIEW` để thấy menu item.
     *  null = luôn hiển thị (ví dụ Dashboard, Settings) */
    permission: string | null;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        code: MODULE_CODES.DASHBOARD,
        name: 'Bảng điều khiển',
        icon: 'LayoutDashboard',
        route: PORTAL_ROUTES.dashboard,
        permission: null, // luôn hiện
    },
    {
        code: MODULE_CODES.PRODUCTS,
        name: 'Quản lý Sản phẩm',
        icon: 'Box',
        route: PORTAL_ROUTES.cms.products.list,
        permission: MODULE_CODES.PRODUCTS,
    },
    {
        code: MODULE_CODES.BLOG,
        name: 'Quản lý Tin tức',
        icon: 'FileText',
        route: PORTAL_ROUTES.cms.news.list,
        permission: MODULE_CODES.BLOG,
    },
    {
        code: MODULE_CODES.PROJECTS,
        name: 'Quản lý Dự án',
        icon: 'Briefcase',
        route: PORTAL_ROUTES.cms.projects.list,
        permission: MODULE_CODES.PROJECTS,
    },
    {
        code: MODULE_CODES.RECRUITMENT,
        name: 'Quản lý Tuyển dụng',
        icon: 'UserRoundSearch',
        route: PORTAL_ROUTES.cms.jobs.list,
        permission: MODULE_CODES.RECRUITMENT,
    },
    {
        code: MODULE_CODES.APPLICATIONS,
        name: 'Danh sách Ứng viên',
        icon: 'ClipboardList',
        route: PORTAL_ROUTES.cms.applications.list,
        permission: MODULE_CODES.APPLICATIONS,
    },
    {
        code: MODULE_CODES.COMMENTS,
        name: 'Quản lý Bình luận',
        icon: 'MessageSquare',
        route: PORTAL_ROUTES.cms.comments.list,
        permission: MODULE_CODES.COMMENTS,
    },
    {
        code: MODULE_CODES.CHAT,
        name: 'Hỗ trợ trực tuyến',
        icon: 'MessageCircle',
        route: PORTAL_ROUTES.cms.chat,
        permission: MODULE_CODES.CHAT,
    },
    {
        code: MODULE_CODES.MEDIA,
        name: 'Thư viện Media',
        icon: 'Images',
        route: PORTAL_ROUTES.cms.media,
        permission: MODULE_CODES.MEDIA,
    },
    {
        code: MODULE_CODES.CONTACTS,
        name: 'Quản lý Liên hệ',
        icon: 'Mail',
        route: PORTAL_ROUTES.contacts,
        permission: MODULE_CODES.CONTACTS,
    },
    {
        code: MODULE_CODES.USERS,
        name: 'Quản lý Tài khoản',
        icon: 'ShieldCheck',
        route: PORTAL_ROUTES.users.list,
        permission: MODULE_CODES.USERS,
    },
    {
        code: MODULE_CODES.ROLES,
        name: 'Phân quyền & Vai trò',
        icon: 'Lock',
        route: PORTAL_ROUTES.users.roles.list,
        permission: MODULE_CODES.ROLES,
    },
    {
        code: MODULE_CODES.NOTIFICATIONS,
        name: 'Thông báo hệ thống',
        icon: 'Bell',
        route: '/portal/notifications',
        permission: MODULE_CODES.NOTIFICATIONS,
    },
    {
        code: MODULE_CODES.LOGS,
        name: 'Nhật ký hệ thống',
        icon: 'History',
        route: '/portal/audit-logs',
        permission: MODULE_CODES.LOGS,
    },
    {
        code: MODULE_CODES.SETTINGS,
        name: 'Cài đặt hệ thống',
        icon: 'Settings',
        route: PORTAL_ROUTES.settings,
        permission: null, // luôn hiện
    },
];
