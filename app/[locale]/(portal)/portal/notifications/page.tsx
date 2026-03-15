'use client';

import $api from '@/utils/axios';
import {
    Bell,
    ExternalLink,
    Check,
    CheckCheck,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    LayoutList,
    PieChart as PieChartIcon,
} from 'lucide-react';
import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { API_ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { RadialChartGrid } from '@/components/portal/charts/RadialChartGrid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Notification {
    id: string;
    type: 'comment' | 'contact' | 'application';
    title: string;
    content: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

const notificationLabels = {
    comment: 'Bình luận',
    contact: 'Liên hệ',
    application: 'Ứng tuyển',
};

export default function NotificationsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [page, setPage] = React.useState(1);
    const { user } = useAuth();

    // Query for notifications
    const { data: notificationsData, isLoading } = useQuery<{
        data: Notification[];
        meta: { unreadCount: number; total: number };
    }>({
        queryKey: ['notifications', page],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.NOTIFICATIONS, {
                params: {
                    page,
                    limit: 10,
                },
            });
            return res.data;
        },
    });

    const notifications = notificationsData?.data || [];
    const unreadCount = notificationsData?.meta?.unreadCount || 0;
    const totalItems = notificationsData?.meta?.total || notifications.length;

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.patch(API_ROUTES.NOTIFICATIONS, { id });
        },
        onSuccess: () => {
            toast.success('Đã đánh dấu là đã đọc');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: () => {
            toast.error('Lỗi khi đánh dấu đã đọc');
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await $api.patch(API_ROUTES.NOTIFICATIONS, { all: true });
        },
        onSuccess: () => {
            toast.success('Đã đánh dấu tất cả là đã đọc');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: () => {
            toast.error('Lỗi khi đánh dấu tất cả đã đọc');
        },
    });

    const handleMarkAsRead = async (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = async () => {
        markAllAsReadMutation.mutate();
    };

    const filteredNotifications = React.useMemo(() => {
        let filtered = notifications;

        // Filter by tab
        if (activeTab !== 'all') {
            if (activeTab === 'unread') {
                filtered = filtered.filter((n) => !n.is_read);
            } else {
                filtered = filtered.filter((n) => n.type === activeTab);
            }
        }

        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(
                (n) =>
                    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.content.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        return filtered;
    }, [notifications, activeTab, searchTerm]);

    const stats = React.useMemo(() => {
        return {
            total: notifications.length,
            unread: unreadCount,
            comment: notifications.filter((n) => n.type === 'comment').length,
            contact: notifications.filter((n) => n.type === 'contact').length,
            application: notifications.filter((n) => n.type === 'application').length,
        };
    }, [notifications, unreadCount]);

    // Prepare chart data
    const notificationChartData = [
        {
            browser: 'comment',
            visitors: stats.comment,
            fill: '#3b82f6',
        },
        {
            browser: 'contact',
            visitors: stats.contact,
            fill: '#10b981',
        },
        {
            browser: 'application',
            visitors: stats.application,
            fill: '#a855f7',
        },
    ];

    const notificationStatusData = [
        {
            browser: 'read',
            visitors: stats.total - stats.unread,
            fill: '#10b981',
        },
        {
            browser: 'unread',
            visitors: stats.unread,
            fill: '#f59e0b',
        },
    ];

    return (
        <div className="flex-1 space-y-6 md:space-y-10 py-4 md:py-8 pt-4 md:pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#002d6b] text-white text-[8px] font-black uppercase tracking-widest">
                            Notification Center
                        </span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-amber-500 rounded-full animate-pulse" />{' '}
                            Real-time Monitoring
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 md:border-l-8 border-[#002d6b] pl-4 md:pl-6 leading-none">
                        Trung tâm Thông báo
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Theo dõi hoạt động hệ thống theo thời gian thực. Quản lý thông báo từ bình
                        luận, liên hệ khách hàng và hồ sơ ứng tuyển.
                    </p>
                </div>
                <Button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="h-10 hover:cursor-pointer px-6 md:px-10 w-full md:w-auto bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
                >
                    <CheckCheck size={18} />
                    Đánh dấu tất cả đã đọc
                </Button>
            </div>

            <Tabs defaultValue="list" className="space-y-4 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <TabsList className="h-auto p-1 bg-slate-100/80 rounded-none gap-1 w-full sm:w-auto">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-3 md:px-6 py-2.5 md:py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2 flex-1 sm:flex-initial"
                        >
                            <LayoutList size={14} />{' '}
                            <span className="hidden sm:inline">Danh sách</span> thông báo
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-3 md:px-6 py-2.5 md:py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2 flex-1 sm:flex-initial"
                        >
                            <PieChartIcon size={14} />{' '}
                            <span className="hidden sm:inline">Biểu đồ</span> phân tích
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng thông báo: <span className="text-[#002d6b]">{stats.total}</span>
                        </span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                            Chưa đọc: <span className="text-amber-600">{stats.unread}</span>
                        </span>
                    </div>
                </div>

                <TabsContent value="list" className="space-y-4 md:space-y-6 mt-0 border-none p-0">
                    {/* Filters */}
                    <div className="p-4 md:p-8 bg-slate-50 border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative max-w-md group flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#002d6b] transition-colors" />
                                <input
                                    placeholder="TÌM KIẾM THÔNG BÁO..."
                                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 rounded-none outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-slate-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        Lọc:
                                    </span>
                                </div>
                                <Select value={activeTab} onValueChange={setActiveTab}>
                                    <SelectTrigger className="h-12 w-50 rounded-none border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-slate-100">
                                        <SelectItem
                                            value="all"
                                            className="text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Tất cả ({stats.total})
                                        </SelectItem>
                                        <SelectItem
                                            value="unread"
                                            className="text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Chưa đọc ({stats.unread})
                                        </SelectItem>
                                        <SelectItem
                                            value="comment"
                                            className="text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Bình luận ({stats.comment})
                                        </SelectItem>
                                        <SelectItem
                                            value="contact"
                                            className="text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Liên hệ ({stats.contact})
                                        </SelectItem>
                                        <SelectItem
                                            value="application"
                                            className="text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Ứng tuyển ({stats.application})
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="h-12 w-12 border-4 border-[#002d6b] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Bell size={48} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Không có thông báo nào
                                </p>
                                <p className="text-[9px] font-medium text-slate-300 mt-2">
                                    {activeTab === 'unread'
                                        ? 'Bạn đã xem hết tất cả thông báo'
                                        : 'Chưa có thông báo mới nào'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredNotifications.map((notification) => {
                                    const label = notificationLabels[notification.type];

                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                'p-4 md:p-8 hover:bg-slate-50/30 transition-colors',
                                                !notification.is_read && 'bg-amber-50/20',
                                            )}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-8">
                                                <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex flex-wrap items-center gap-x-3 md:gap-x-6 gap-y-2 md:gap-y-3">
                                                        <Badge className="rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none">
                                                            {label}
                                                        </Badge>

                                                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                            {format(
                                                                new Date(notification.created_at),
                                                                'HH:mm - dd/MM/yyyy',
                                                                { locale: vi },
                                                            )}
                                                        </div>

                                                        {!notification.is_read && (
                                                            <Badge className="rounded-none text-[8px] font-black uppercase tracking-widest px-3 py-1 h-auto bg-[#fbbf24] text-[#002d6b] border-none">
                                                                MỚI
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="space-y-2">
                                                        <h3 className="text-xs md:text-sm font-black text-[#002d6b] uppercase tracking-tight">
                                                            {notification.title}
                                                        </h3>
                                                        <div className="bg-slate-50/50 border-l-4 border-l-[#002d6b] p-3 md:p-6 text-xs md:text-sm text-slate-700 leading-relaxed italic">
                                                            {notification.content}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 pt-1 shrink-0">
                                                    {notification.link && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 md:h-10 rounded-none gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-[#002d6b] hover:text-white hover:border-[#002d6b] transition-all px-3 md:px-4"
                                                            asChild
                                                        >
                                                            <Link href={notification.link}>
                                                                <ExternalLink size={14} />
                                                                <span className="hidden sm:inline">
                                                                    Xem chi tiết
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 md:h-10 rounded-none gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all px-3 md:px-4"
                                                            onClick={() =>
                                                                handleMarkAsRead(notification.id)
                                                            }
                                                        >
                                                            <Check size={14} />
                                                            <span className="hidden sm:inline">
                                                                Đánh dấu đã đọc
                                                            </span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalItems > 10 && (
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Hiển thị {filteredNotifications.length} / {totalItems} thông báo
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <div className="h-10 min-w-15 flex items-center justify-center text-[10px] font-black border border-slate-200 px-4 bg-white uppercase tracking-widest">
                                    TRANG {page}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page * 10 >= totalItems}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent
                    value="analytics"
                    className="space-y-8 mt-0 border-none p-0 animate-in fade-in duration-500"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <RadialChartGrid
                            title="Phân loại thông báo"
                            description="Tỷ lệ thông báo theo từng loại"
                            data={notificationChartData}
                            config={{
                                visitors: { label: 'Thông báo' },
                                comment: { label: 'Bình luận', color: '#3b82f6' },
                                contact: { label: 'Liên hệ', color: '#10b981' },
                                application: { label: 'Ứng tuyển', color: '#a855f7' },
                            }}
                            footerTitle="Phân bố hoạt động"
                            footerDescription="Cập nhật theo thời gian thực"
                            className="lg:col-span-1"
                        />
                        <RadialChartGrid
                            title="Trạng thái xử lý"
                            description="Tỷ lệ thông báo đã đọc vs chưa đọc"
                            data={notificationStatusData}
                            config={{
                                visitors: { label: 'Thông báo' },
                                read: { label: 'Đã đọc', color: '#10b981' },
                                unread: { label: 'Chưa đọc', color: '#f59e0b' },
                            }}
                            footerTitle="Mức độ phản hồi"
                            footerDescription={`${stats.unread} thông báo cần xử lý`}
                            className="lg:col-span-1"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
