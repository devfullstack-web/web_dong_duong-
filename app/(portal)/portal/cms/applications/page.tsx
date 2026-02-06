'use client';

import $api from '@/utils/axios';
import {
    Search,
    MoreHorizontal,
    Trash2,
    Loader2,
    Users,
    FileDown,
    Mail,
    Phone,
    Eye,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Briefcase,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { TablePagination } from '@/components/portal/table-pagination';
import { API_ROUTES, PORTAL_ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PieChartLabel } from '@/components/portal/charts/PieChartLabel';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';
import { BarChart3, PieChart as PieChartIcon, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobApplication {
    id: string;
    job_id: string;
    job_title: string;
    full_name: string;
    email: string;
    phone: string;
    cv_url: string;
    cover_letter: string | null;
    status: string;
    created_at: string;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: any; chartColor: string }
> = {
    pending: {
        label: 'Chờ duyệt',
        color: 'bg-amber-500/10 text-amber-600',
        icon: Clock,
        chartColor: '#f59e0b',
    },
    reviewed: {
        label: 'Đã xem',
        color: 'bg-blue-500/10 text-blue-600',
        icon: Eye,
        chartColor: '#3b82f6',
    },
    interviewed: {
        label: 'Phỏng vấn',
        color: 'bg-purple-500/10 text-purple-600',
        icon: Users,
        chartColor: '#a855f7',
    },
    rejected: {
        label: 'Từ chối',
        color: 'bg-rose-500/10 text-rose-600',
        icon: XCircle,
        chartColor: '#f43f5e',
    },
    accepted: {
        label: 'Trúng tuyển',
        color: 'bg-emerald-500/10 text-emerald-600',
        icon: CheckCircle2,
        chartColor: '#10b981',
    },
};

export default function ApplicationsManagementPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<JobApplication | null>(null);
    const router = useRouter();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Query for applications list
    const { data: applicationsData, isLoading } = useQuery<{
        data: JobApplication[];
        meta: { total: number };
    }>({
        queryKey: ['applications', currentPage, pageSize, debouncedSearch],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.APPLICATIONS, {
                params: {
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                },
            });
            return res.data;
        },
    });

    // Query for stats
    const { data: statsData } = useQuery<{ data: any }>({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.STATS);
            return res.data;
        },
    });

    const applications = applicationsData?.data || [];
    const totalItems = applicationsData?.meta?.total || 0;
    const stats = statsData?.data;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.APPLICATIONS}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa hồ sơ ứng viên');
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error('Không thể xóa hồ sơ ứng viên');
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await $api.patch(`${API_ROUTES.APPLICATIONS}/${id}`, { status });
        },
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái hồ sơ');
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
        onError: () => {
            toast.error('Không thể cập nhật trạng thái');
        },
    });

    const handleDelete = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || {
            label: status,
            color: 'bg-slate-500/10 text-slate-500',
            icon: AlertCircle,
        };
        const Icon = config.icon;
        return (
            <Badge
                className={cn(
                    'border-none text-[9px] font-black uppercase tracking-widest gap-1.5 py-1',
                    config.color,
                )}
            >
                <Icon size={10} />
                {config.label}
            </Badge>
        );
    };

    // Prepare chart data
    const statusChartData = stats?.applicationStats
        ? Object.entries(stats.applicationStats).map(([status, count]) => {
              const config = STATUS_CONFIG[status] || { label: status, chartColor: '#64748b' };
              return {
                  status,
                  count: Number(count),
                  fill: config.chartColor,
              };
          })
        : [];

    const statusConfig = Object.entries(STATUS_CONFIG).reduce(
        (acc: any, [key, val]) => {
            acc[key] = { label: val.label, color: val.chartColor };
            return acc;
        },
        { count: { label: 'Số lượng' } },
    );

    const trendData =
        stats?.trends?.map((t: any) => ({
            month: t.month.toUpperCase(),
            applications: t.applications || 0,
        })) || [];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase tracking-widest">
                            Recruitment Portal
                        </span>
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-blue-500 rounded-full animate-pulse" />{' '}
                            Live Analysis
                        </span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 border-l-8 border-brand-primary pl-6 leading-none">
                        Quản lý Ứng viên
                    </h1>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Hệ thống quản lý và phân tích hồ sơ ứng tuyển chuyên sâu. Theo dõi tỷ lệ
                        chuyển đổi, trạng thái hồ sơ và xu hướng tuyển dụng trong thời gian thực.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="h-auto p-1 bg-slate-100/80 rounded-none gap-1">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <LayoutList size={14} /> Danh sách hồ sơ
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:text-brand-primary data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <PieChartIcon size={14} /> Biểu đồ phân tích
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng hồ sơ: <span className="text-brand-primary">{totalItems}</span>
                        </span>
                    </div>
                </div>

                <TabsContent value="list" className="space-y-8 mt-0 border-none p-0">
                    {/* Filters & Table */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 p-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="TÌM KIẾM ỨNG VIÊN THEO TÊN, EMAIL, SỐ ĐIỆN THOẠI..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white overflow-hidden shadow-sm">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <Users size={48} className="mb-4 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                        Chưa có ứng viên nào ứng tuyển
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Ứng viên
                                                </th>
                                                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Vị trí ứng tuyển
                                                </th>
                                                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Thông tin liên hệ
                                                </th>
                                                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Ngày nộp
                                                </th>
                                                <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Trạng thái
                                                </th>
                                                <th className="text-right p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {applications.map((app) => (
                                                <tr
                                                    key={app.id}
                                                    className="hover:bg-slate-50/30 transition-colors"
                                                >
                                                    <td className="p-6">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                            {app.full_name}
                                                        </p>
                                                    </td>
                                                    <td className="p-6">
                                                        <p className="text-[10px] font-black text-brand-primary uppercase truncate max-w-[200px] flex items-center gap-2">
                                                            <Briefcase size={12} /> {app.job_title}
                                                        </p>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                                <Mail
                                                                    size={12}
                                                                    className="text-slate-300"
                                                                />
                                                                {app.email}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                                <Phone
                                                                    size={12}
                                                                    className="text-slate-300"
                                                                />
                                                                {app.phone}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-[10px] font-bold text-slate-500 italic">
                                                            {format(
                                                                new Date(app.created_at),
                                                                'HH:mm, dd/MM/yyyy',
                                                                { locale: vi },
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        {getStatusBadge(app.status)}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 bg-slate-50 hover:bg-brand-primary hover:text-white text-slate-400 transition-all rounded-none"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `${PORTAL_ROUTES.cms.applications.list}/${app.id}`,
                                                                    )
                                                                }
                                                            >
                                                                <Eye size={14} />
                                                            </Button>

                                                            <a
                                                                href={app.cv_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Tải CV / Xem hồ sơ"
                                                                className="h-9 w-9 flex items-center justify-center bg-slate-50 hover:bg-brand-primary hover:text-white text-slate-400 transition-all rounded-none"
                                                            >
                                                                <FileDown size={14} />
                                                            </a>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-9 w-9 p-0 rounded-none hover:bg-slate-50"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="rounded-none w-56 p-2 shadow-xl border-slate-100"
                                                                >
                                                                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                                                                        Thao tác hồ sơ
                                                                    </DropdownMenuLabel>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            router.push(
                                                                                `${PORTAL_ROUTES.cms.applications.list}/${app.id}`,
                                                                            )
                                                                        }
                                                                        className="text-[10px] font-black uppercase tracking-tight flex items-center gap-3 px-3 py-2 cursor-pointer"
                                                                    >
                                                                        <Eye
                                                                            size={14}
                                                                            className="text-blue-500"
                                                                        />{' '}
                                                                        Xem chi tiết
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                                                                        Cập nhật trạng thái
                                                                    </DropdownMenuLabel>
                                                                    {Object.entries(
                                                                        STATUS_CONFIG,
                                                                    ).map(([key, config]) => (
                                                                        <DropdownMenuItem
                                                                            key={key}
                                                                            onClick={() =>
                                                                                handleUpdateStatus(
                                                                                    app.id,
                                                                                    key,
                                                                                )
                                                                            }
                                                                            className="text-[10px] font-black uppercase tracking-tight flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50"
                                                                        >
                                                                            <config.icon
                                                                                size={14}
                                                                                className={cn(
                                                                                    config.color.split(
                                                                                        ' ',
                                                                                    )[1],
                                                                                )}
                                                                            />
                                                                            {config.label}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setItemToDelete(app);
                                                                            setDeleteDialogOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        className="text-rose-600 flex items-center gap-3 text-[10px] font-black uppercase tracking-tight px-3 py-2 cursor-pointer hover:bg-rose-50"
                                                                    >
                                                                        <Trash2 size={14} /> Xóa hồ
                                                                        sơ
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {/* Pagination */}
                            <TablePagination
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent
                    value="analytics"
                    className="space-y-8 mt-0 border-none p-0 animate-in fade-in duration-500"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PieChartLabel
                            title="Trạng thái hồ sơ"
                            description="Phân bổ ứng viên theo quy trình tuyển dụng"
                            data={statusChartData}
                            config={statusConfig}
                            dataKey="count"
                            nameKey="status"
                            footerTitle="Tỷ lệ xét duyệt"
                            footerDescription="Dựa trên tổng số hồ sơ đã nhận"
                            className="lg:col-span-1"
                        />
                        <AreaChartGradient
                            title="Xu hướng ứng tuyển"
                            description="Số lượng hồ sơ nhận được qua các tháng"
                            data={trendData}
                            config={{
                                applications: { label: 'Hồ sơ', color: 'var(--brand-primary)' },
                            }}
                            dataKeys={['applications']}
                            xAxisKey="month"
                            footerTitle="Tốc độ thu hút nhân tài"
                            footerDescription="Thống kê hồ sơ mới trong 6 tháng qua"
                            className="lg:col-span-2"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
                itemName={itemToDelete?.full_name || ''}
            />
        </div>
    );
}
