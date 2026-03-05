'use client';

import { cn } from '@/lib/utils';
import {
    FileText,
    Briefcase,
    Box,
    Users,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    Clock,
    ExternalLink,
    Settings,
    Globe,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
    const { data: statsData, isLoading: loading } = useQuery<{ data: any }>({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.STATS);
            return res.data;
        },
    });

    const stats = statsData?.data;
    const updateTime = format(new Date(), 'hh:mm a', { locale: vi });

    const statsConfig = [
        {
            title: 'Bài viết tin tức',
            value: stats?.counts?.news || 0,
            icon: FileText,
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/5',
            href: PORTAL_ROUTES.cms.news.list,
        },
        {
            title: 'Dự án đã thực hiện',
            value: stats?.counts?.projects || 0,
            icon: Briefcase,
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/5',
            href: PORTAL_ROUTES.cms.projects.list,
        },
        {
            title: 'Sản phẩm catalog',
            value: stats?.counts?.products || 0,
            icon: Box,
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/5',
            href: PORTAL_ROUTES.cms.products.list,
        },
        {
            title: 'Liên hệ mới',
            value: stats?.counts?.contacts || 0,
            icon: Users,
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/5',
            href: PORTAL_ROUTES.contacts,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary opacity-20" />
            </div>
        );
    }
    return (
        <div className="space-y-6 md:space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Tổng quan
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-sm">
                        Chào mừng trở lại. Đây là hoạt động của hệ thống trong 30 ngày qua.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-none border border-slate-100">
                    <Clock size={14} className="text-brand-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        Cập nhật lúc: {updateTime}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {statsConfig.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <div className="bg-white p-4 md:p-8 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-slate-50/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-brand-primary/5 to-transparent rounded-none -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                            <div className="space-y-3 md:space-y-6 relative">
                                <div
                                    className={cn(
                                        'inline-flex p-2.5 md:p-4 rounded-none',
                                        stat.bg,
                                        stat.color,
                                    )}
                                >
                                    <stat.icon className="size-5 md:size-6" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            {stat.title}
                                        </div>
                                        <ArrowUpRight
                                            size={14}
                                            className="text-slate-300 group-hover:text-brand-primary transition-colors"
                                        />
                                    </div>
                                    <div className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">
                                        {stat.value}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tight">
                                        <TrendingUp size={12} /> +12.5%
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                        Tháng này
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 bg-white rounded-none border border-slate-100 overflow-hidden">
                    <div className="p-4 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-8 bg-brand-primary rounded-none"></div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                                Hoạt động CMS mới nhất
                            </h3>
                        </div>
                        <Link
                            href={PORTAL_ROUTES.cms.news.list}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary hover:underline flex items-center gap-2"
                        >
                            Quản lý tất cả <ExternalLink size={12} />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {stats?.recentActivities?.map((item: any, i: number) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 md:p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer gap-3"
                            >
                                <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                                    <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-none bg-slate-50 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-none">
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                                {format(new Date(item.date), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                        <div className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight">
                                            {item.title}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-none border',
                                        item.status === 'published' ||
                                            item.status === 'completed' ||
                                            item.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-50 text-slate-400 border-slate-100',
                                    )}
                                >
                                    {item.status === 'published' ||
                                    item.status === 'completed' ||
                                    item.status === 'active'
                                        ? 'Công khai'
                                        : 'Bản nháp'}
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                            <div className="p-12 text-center text-slate-400 italic text-sm font-medium">
                                Chưa có hoạt động nào gần đây.
                            </div>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50/30 text-center">
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-primary transition-colors">
                            Xem thêm hoạt động cũ hơn
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-none border border-slate-100 p-4 md:p-8 space-y-6 md:space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 rotate-12 opacity-5">
                            <Settings size={120} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4 relative">
                            Lối tắt
                        </h3>
                        <div className="grid grid-cols-1 gap-4 relative">
                            <Link
                                href="/portal/analytics"
                                className="flex items-center gap-4 p-5 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all text-left bg-white shadow-xs group/item"
                            >
                                <div className="h-10 w-10 flex items-center justify-center bg-brand-accent text-brand-primary rounded-none shrink-0 group-hover/item:scale-110 transition-transform">
                                    <BarChart3 size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-black uppercase tracking-tight">
                                        Phân tích chuyên sâu
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Biểu đồ & Thống kê
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href={PORTAL_ROUTES.cms.news.list}
                                className="flex items-center gap-4 p-5 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all text-left bg-white"
                            >
                                <div className="h-10 w-10 flex items-center justify-center bg-brand-primary text-white rounded-none shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-black uppercase tracking-tight">
                                        Đăng tin tức
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Kỹ thuật & Dự án
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href={PORTAL_ROUTES.cms.projects.list}
                                className="flex items-center gap-4 p-5 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all text-left bg-white"
                            >
                                <div className="h-10 w-10 flex items-center justify-center bg-brand-primary text-white rounded-none shrink-0">
                                    <Briefcase size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-black uppercase tracking-tight">
                                        Thêm dự án
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Hồ sơ công trình
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href={PORTAL_ROUTES.cms.products.list}
                                className="flex items-center gap-4 p-5 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all text-left bg-white"
                            >
                                <div className="h-10 w-10 flex items-center justify-center bg-brand-primary text-white rounded-none shrink-0">
                                    <Box size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs font-black uppercase tracking-tight">
                                        Đăng sản phẩm
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Cập nhật Catalog
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-brand-primary to-brand-secondary rounded-none p-5 md:p-8 text-white border border-white/10 relative overflow-hidden group">
                        <div className="absolute -bottom-8 -right-8 h-48 w-48 bg-white/5 rounded-none blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="space-y-6 relative">
                            <div className="h-12 w-12 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md">
                                <Globe size={24} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black uppercase tracking-tight">
                                    Xem Website
                                </h4>
                                <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                                    Kiểm tra hiển thị nội dung vừa cập nhật trực tiếp trên website
                                    chính thức của Sài Gòn Valve.
                                </p>
                            </div>
                            <Link href="/" target="_blank">
                                <button className="w-full py-3 bg-white text-brand-primary font-black text-[10px] uppercase tracking-widest rounded-none hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    Truy cập ngay <ExternalLink size={12} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
