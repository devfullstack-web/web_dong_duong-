'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    FileText,
    Briefcase,
    Box,
    Users,
    ArrowUpRight,
    Clock,
    Loader2,
    Calendar as CalendarIcon,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { RadialChartGrid } from '@/components/portal/charts/RadialChartGrid';
import { RadialChartShape } from '@/components/portal/charts/RadialChartShape';
import { PieChartLabel } from '@/components/portal/charts/PieChartLabel';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const [date, setDate] = React.useState<DateRange | undefined>();
    const [contentType, setContentType] = React.useState('all');

    const { data: statsData, isLoading: loading } = useQuery<{ data: Record<string, unknown> }>({
        queryKey: ['stats', { startDate: date?.from, endDate: date?.to }],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.STATS, {
                params: {
                    startDate: date?.from?.toISOString(),
                    endDate: date?.to?.toISOString(),
                },
            });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });

    const stats = statsData?.data;
    const updateTime = format(new Date(), 'hh:mm a', { locale: vi });

    // Data for Charts
    const distributionData = [
        { browser: 'news', visitors: stats?.counts?.news || 0, fill: 'var(--brand-primary)' },
        { browser: 'projects', visitors: stats?.counts?.projects || 0, fill: 'var(--brand-cyan)' },
        {
            browser: 'products',
            visitors: stats?.counts?.products || 0,
            fill: 'var(--brand-accent)',
        },
        { browser: 'contacts', visitors: stats?.counts?.contacts || 0, fill: '#ef4444' },
    ];

    const distributionConfig = {
        visitors: { label: 'Số lượng' },
        news: { label: 'Tin tức', color: 'var(--brand-primary)' },
        projects: { label: 'Dự án', color: 'var(--brand-cyan)' },
        products: { label: 'Sản phẩm', color: 'var(--brand-accent)' },
        contacts: { label: 'Liên hệ', color: '#ef4444' },
    };

    const activityData = React.useMemo(() => {
        return stats?.trends?.map((t: Record<string, unknown>) => ({
            month: t.month.toUpperCase(),
            news: t.news,
            projects: t.projects,
            products: t.products,
            total: t.news + t.projects + t.products,
        })) || [];
    }, [stats?.trends]);

    const activeKeys = React.useMemo(() => {
        if (contentType === 'news') return ['news'];
        if (contentType === 'projects') return ['projects'];
        if (contentType === 'products') return ['products'];
        return ['products', 'projects', 'news'];
    }, [contentType]);

    const activityConfig = {
        news: { label: 'Tin tức', color: 'var(--brand-primary)' },
        projects: { label: 'Dự án', color: 'var(--brand-cyan)' },
        products: { label: 'Sản phẩm', color: 'var(--brand-accent)' },
        total: { label: 'Tổng số', color: 'var(--brand-primary)' },
    };

    const totalContent =
        (stats?.counts?.news || 0) +
        (stats?.counts?.projects || 0) +
        (stats?.counts?.products || 0);
    const totalContentData = [
        { browser: 'total', visitors: totalContent, fill: 'var(--brand-primary)' },
    ];

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

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary opacity-20" />
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 pl-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 border-[#002d6b] pl-4 leading-none">
                        Tổng quan
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs pl-4 leading-relaxed">
                        Chào mừng trở lại. Đây là hoạt động của hệ thống.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Content Type Filter */}
                    <div className="flex items-center bg-slate-50 border border-slate-100 p-0.5 rounded-none">
                        {[
                            { value: 'all', label: 'TẤT CẢ' },
                            { value: 'news', label: 'TIN TỨC' },
                            { value: 'projects', label: 'DỰ ÁN' },
                            { value: 'products', label: 'SẢN PHẨM' },
                        ].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setContentType(item.value)}
                                className={cn(
                                    'px-3 py-1.5 text-[9px] font-black tracking-wider uppercase transition-all rounded-none hover:cursor-pointer',
                                    contentType === item.value
                                        ? 'bg-[#002d6b] text-white'
                                        : 'text-slate-400 hover:text-slate-600 bg-transparent'
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2 w-full sm:w-[260px]">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    type="button"
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-black text-[9px] uppercase tracking-widest h-10 border-slate-100 rounded-none bg-slate-50 hover:bg-slate-100 shadow-none transition-all duration-200 hover:cursor-pointer',
                                        !date && 'text-slate-400',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#002d6b]" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, 'dd/MM/yy')} -{' '}
                                                {format(date.to, 'dd/MM/yy')}
                                            </>
                                        ) : (
                                            format(date.from, 'dd/MM/yy')
                                        )
                                    ) : (
                                        <span>Lọc ngày tháng năm</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-none border border-slate-100 shadow-sm bg-white" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {date && (
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setDate(undefined)}
                                className="h-10 w-10 p-0 rounded-none hover:bg-rose-50 hover:text-rose-600 border border-slate-100 shrink-0 shadow-none hover:cursor-pointer bg-slate-50"
                            >
                                <X size={14} />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-none border border-slate-100 h-10 shrink-0">
                        <Clock size={14} className="text-[#002d6b]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                            Cập nhật lúc: {updateTime}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsConfig.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <div className="bg-white p-4 rounded-none border border-slate-100 hover:border-brand-primary/20 hover:bg-slate-50/30 transition-all group relative overflow-hidden flex items-center gap-4">
                            <div className={cn('p-3 rounded-none shrink-0', stat.bg, stat.color)}>
                                <stat.icon className="size-5" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#002d6b] transition-colors truncate">
                                    {stat.title}
                                </div>
                                <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                                    {stat.value}
                                </div>
                            </div>
                            <ArrowUpRight
                                size={14}
                                className="text-slate-300 group-hover:text-brand-primary transition-colors shrink-0"
                            />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <AreaChartGradient
                    title="Tăng trưởng hệ thống"
                    description="Biểu đồ xu hướng cập nhật dữ liệu 6 tháng qua"
                    data={activityData}
                    config={activityConfig}
                    dataKeys={activeKeys}
                    xAxisKey="month"
                    footerTitle="Tốc độ số hóa"
                    footerDescription="Dữ liệu tổng hợp từ các module chính"
                    className="lg:col-span-2"
                />

                <RadialChartShape
                    title="Tổng quy mô nội dung"
                    description="Toàn bộ dữ liệu News, Projects & Products"
                    data={totalContentData}
                    config={{ visitors: { label: 'Nội dung', color: 'var(--brand-primary)' } }}
                    dataKey="visitors"
                    label="Tài nguyên"
                    footerTitle="Tăng trưởng 7.2%"
                    footerDescription="Dựa trên tốc độ đăng bài 30 ngày qua"
                    className="lg:col-span-1"
                />

                <PieChartLabel
                    title="Tỷ lệ phân bổ tài nguyên"
                    description="So sánh khối lượng giữa các danh mục CMS"
                    data={distributionData}
                    config={distributionConfig}
                    dataKey="visitors"
                    nameKey="browser"
                    footerTitle="Cơ cấu ổn định"
                    footerDescription="Sản phẩm chiếm tỷ trọng cao nhất hiện tại"
                    className="lg:col-span-1"
                />

                <RadialChartGrid
                    title="Chỉ số phản hồi"
                    description="Liên hệ và tương tác khách hàng"
                    data={[
                        {
                            browser: 'contacts',
                            visitors: stats?.counts?.contacts || 0,
                            fill: 'var(--brand-accent)',
                        },
                        {
                            browser: 'pending',
                            visitors: stats?.contactStats?.new || 0,
                            fill: '#ef4444',
                        },
                    ]}
                    config={{
                        visitors: { label: 'Lượt' },
                        contacts: { label: 'Tổng liên hệ', color: 'var(--brand-accent)' },
                        pending: { label: 'Chưa xử lý', color: '#ef4444' },
                    }}
                    footerTitle="Hỗ trợ 24/7"
                    footerDescription="Thời gian phản hồi trung bình: 15 phút"
                    className="lg:col-span-2"
                />
            </div>
        </div>
    );
}
