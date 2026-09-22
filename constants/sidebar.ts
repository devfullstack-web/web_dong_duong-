import { PORTAL_ROUTES } from './routes';

export interface SidebarItem {
    code: string;
    name: string;
    icon: string;
    route: string;
    /** Permission code — user cần có permission này để thấy menu item.
     *  null = luôn hiển thị (ví dụ Dashboard, Settings) */
    permission: string | null;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        code: 'dashboard',
        name: 'Bảng điều khiển',
        icon: 'LayoutDashboard',
        route: PORTAL_ROUTES.dashboard,
        permission: 'dashboard.view',
    },
    {
        code: 'products',
        name: 'Quản lý Sản phẩm',
        icon: 'Box',
        route: PORTAL_ROUTES.cms.products.list,
        permission: 'product.view',
    },
    {
        code: 'product_categories',
        name: 'Danh mục Sản phẩm',
        icon: 'FolderTree',
        route: PORTAL_ROUTES.cms.products.categories.list,
        permission: 'product.view',
    },
    {
        code: 'blog',
        name: 'Quản lý Tin tức',
        icon: 'FileText',
        route: PORTAL_ROUTES.cms.news.list,
        permission: 'news.view',
    },
    {
        code: 'projects',
        name: 'Quản lý Dự án',
        icon: 'Briefcase',
        route: PORTAL_ROUTES.cms.projects.list,
        permission: 'project.view',
    },
    {
        code: 'recruitment',
        name: 'Quản lý Tuyển dụng',
        icon: 'UserRoundSearch',
        route: PORTAL_ROUTES.cms.jobs.list,
        permission: 'recruitment.view',
    },
    {
        code: 'applications',
        name: 'Danh sách Ứng viên',
        icon: 'ClipboardList',
        route: PORTAL_ROUTES.cms.applications.list,
        permission: 'application.view',
    },
    {
        code: 'comments',
        name: 'Quản lý Bình luận',
        icon: 'MessageSquare',
        route: PORTAL_ROUTES.cms.comments.list,
        permission: 'comment.view',
    },
    {
        code: 'media',
        name: 'Thư viện Media',
        icon: 'Images',
        route: PORTAL_ROUTES.cms.media,
        permission: 'file.view',
    },
    {
        code: 'contacts',
        name: 'Quản lý Liên hệ',
        icon: 'Mail',
        route: PORTAL_ROUTES.contacts,
        permission: 'contact.view',
    },
    {
        code: 'users',
        name: 'Quản lý Tài khoản',
        icon: 'ShieldCheck',
        route: PORTAL_ROUTES.users.list,
        permission: 'user.view',
    },
    {
        code: 'roles',
        name: 'Phân quyền & Vai trò',
        icon: 'Lock',
        route: PORTAL_ROUTES.users.roles.list,
        permission: 'role.view',
    },
    {
        code: 'logs',
        name: 'Nhật ký hệ thống',
        icon: 'History',
        route: '/portal/audit-logs',
        permission: 'audit_log.view',
    },
    {
        code: 'settings',
        name: 'Cài đặt hệ thống',
        icon: 'Settings',
        route: PORTAL_ROUTES.settings,
        permission: null, // luôn hiện
    },
];
