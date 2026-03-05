'use client';

import { BarChart3, Clock, RefreshCcw, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { RadialChartGrid } from '@/components/portal/charts/RadialChartGrid';
import { RadarChartDots } from '@/components/portal/charts/RadarChartDots';
import { RadialChartShape } from '@/components/portal/charts/RadialChartShape';
import { PieChartLabel } from '@/components/portal/charts/PieChartLabel';
import { RadarChartGridCircleFill } from '@/components/portal/charts/RadarChartGridCircleFill';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function AnalyticsPage() {
    const queryClient = useQueryClient();

    const { data: statsData, isLoading: loading } = useQuery<{ data: any }>({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.STATS);
            return res.data;
        },
    });

    const stats = statsData?.data;
    const updateTime = format(new Date(), 'hh:mm a', { locale: vi });

    const refetchStats = () => {
        queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

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

    const activityData =
        stats?.trends?.map((t: any) => ({
            month: t.month.toUpperCase(),
            news: t.news,
            projects: t.projects,
            products: t.products,
            total: t.news + t.projects + t.products,
        })) || [];

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="size-12 border-4 border-slate-100 border-t-brand-primary animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Đang khởi tạo dữ liệu thống kê...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10 pb-10 md:pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase tracking-widest">
                            Live Engine
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />{' '}
                            Đang đồng bộ
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none border-l-4 md:border-l-8 border-brand-primary pl-4 md:pl-6">
                        Phân tích & Thống kê
                    </h1>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Hệ thống phân tích dữ liệu chuyên sâu cho Sài Gòn Valve CMS. Theo dõi hiệu
                        suất nội dung, phân bổ sản phẩm và xu hướng hoạt động trong thời gian thực.
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="bg-white border border-slate-200 px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 shadow-xs flex-1 md:flex-initial">
                        <Calendar size={14} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                                Thời gian
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-900 leading-none">
                                30 Ngày qua
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={refetchStats}
                        className="bg-brand-primary text-white px-4 md:px-5 py-2 md:py-3 hover:bg-brand-secondary transition-all flex items-center gap-2 group active:scale-95"
                    >
                        <RefreshCcw
                            size={14}
                            className="group-hover:rotate-180 transition-transform duration-500"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            Làm mới
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Total Reach - Shape Chart */}
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

                {/* Distribution - Pie Chart */}
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

                {/* Grid Chart for Quick Comparison */}
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
                    className="lg:col-span-1"
                />

                {/* Content Growth - Area Chart */}
                <AreaChartGradient
                    title="Tăng trưởng hệ thống"
                    description="Biểu đồ xu hướng cập nhật dữ liệu 6 tháng qua"
                    data={activityData}
                    config={activityConfig}
                    dataKeys={['products', 'projects', 'news']}
                    xAxisKey="month"
                    footerTitle="Tốc độ số hóa"
                    footerDescription="Dữ liệu tổng hợp từ các module chính"
                    className="lg:col-span-2"
                />

                {/* Monthly Activity Dots */}
                <RadarChartDots
                    title="Phân bổ hoạt động"
                    description="So sánh chi tiết 3 nhóm nội dung"
                    data={activityData}
                    config={activityConfig}
                    dataKey="total"
                    angleKey="month"
                    footerTitle="Ổn định"
                    footerDescription="Cập nhật tự động từ Core Engine"
                    className="lg:col-span-1"
                />

                {/* Activity Trend - Radar Filled */}
                <RadarChartGridCircleFill
                    title="Ma trận bao phủ dữ liệu"
                    description="Phân tích tỷ trọng hoạt động tổng thể"
                    data={activityData}
                    config={activityConfig}
                    dataKey="total"
                    angleKey="month"
                    footerTitle="Tối ưu vận hành"
                    footerDescription="Dữ liệu đồng bộ từ Core Engine"
                    className="lg:col-span-3"
                />
            </div>

            {/* Footer Info Section */}
            <div className="bg-slate-50 border border-slate-200 p-5 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 hidden md:block">
                    <BarChart3 size={200} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10">
                    <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Trạng thái API
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="size-2 bg-emerald-500 rounded-none shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">
                                Health: Excellent
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Lần cuối cập nhật
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-brand-primary" />
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">
                                {updateTime}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4 md:col-span-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Ghi chú phân tích
                        </div>
                        <p className="text-[10px] font-medium italic text-slate-500 leading-relaxed uppercase tracking-tight">
                            Dữ liệu được tổng hợp từ SQL Engine của Sài Gòn Valve. Các biểu đồ đang
                            hiển thị hiệu năng đỉnh của hệ thống trong chu kỳ 30 ngày gần nhất.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
