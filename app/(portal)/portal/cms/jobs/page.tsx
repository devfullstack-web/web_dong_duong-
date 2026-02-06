'use client';

import $api from '@/utils/axios';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Briefcase,
    MapPin,
    Clock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { TablePagination } from '@/components/portal/table-pagination';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { PERMISSIONS } from '@/constants/rbac';
import { cn } from '@/lib/utils';
import { PieChartLabel } from '@/components/portal/charts/PieChartLabel';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutList, PieChart as PieChartIcon } from 'lucide-react';

interface JobPosting {
    id: string;
    title: string;
    slug: string;
    description: string;
    location: string | null;
    employment_type: string;
    salary_range: string | null;
    experience_level: string | null;
    department: string | null;
    status: 'open' | 'closed';
    deadline: string | null;
    created_at: string;
}

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    contract: 'Hợp đồng',
    internship: 'Thực tập',
};

const STATUS_CONFIG = {
    open: {
        label: 'Đang tuyển',
        color: 'bg-emerald-500/10 text-emerald-600',
        chartColor: '#10b981',
        icon: CheckCircle2,
    },
    closed: {
        label: 'Đã đóng',
        color: 'bg-slate-500/10 text-slate-500',
        chartColor: '#64748b',
        icon: AlertCircle,
    },
};

export default function JobsManagementPage() {
    const { hasPermission } = useAuth();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<JobPosting | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Query for jobs list
    const { data: jobsData, isLoading } = useQuery<{
        data: JobPosting[];
        meta: { total: number };
    }>({
        queryKey: ['jobs', currentPage, pageSize, debouncedSearch],
        queryFn: async () => {
            const res = await $api.get(`${API_ROUTES.JOBS}`, {
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

    const jobs = jobsData?.data || [];
    const totalItems = jobsData?.meta?.total || 0;
    const stats = statsData?.data;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.JOBS}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa tin tuyển dụng');
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error('Không thể xóa tin tuyển dụng');
        },
    });

    const handleDelete = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    // Prepare chart data
    const statusChartData = stats?.jobStats
        ? Object.entries(stats.jobStats).map(([status, count]) => {
              const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
                  label: status,
                  chartColor: '#64748b',
              };
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
            jobs: t.jobs || 0,
        })) || [];

    return (
        <div className="flex-1 space-y-6 md:space-y-10 py-4 md:py-8 pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#002d6b] text-white text-[8px] font-black uppercase tracking-widest text-[#fbbf24]">
                            Sài Gòn Valve CMS
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />{' '}
                            Live Recruitment
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 md:border-l-8 border-[#002d6b] pl-3 md:pl-6 leading-none">
                        Quản lý Tuyển dụng
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Hệ thống quản trị tin tuyển dụng và nguồn nhân lực. Theo dõi mật độ đăng
                        tin, phân tích trạng thái tuyển dụng và hiệu quả thu hút nhân tài.
                    </p>
                </div>
                {hasPermission(PERMISSIONS.RECRUITMENT_CREATE) && (
                    <Link href={PORTAL_ROUTES.cms.jobs.add}>
                        <Button className="h-12 md:h-14 px-6 md:px-10 w-full md:w-auto bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 flex items-center gap-3 justify-center">
                            <Plus size={18} /> Thêm tin mới
                        </Button>
                    </Link>
                )}
            </div>

            <Tabs defaultValue="list" className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <TabsList className="h-auto p-1 bg-slate-100/80 rounded-none gap-1 w-full sm:w-auto">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2 flex-1 sm:flex-initial"
                        >
                            <LayoutList size={14} />{' '}
                            <span className="hidden sm:inline">Danh sách</span>{' '}
                            <span className="sm:hidden">DS</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2 flex-1 sm:flex-initial"
                        >
                            <PieChartIcon size={14} />{' '}
                            <span className="hidden sm:inline">Biểu đồ phân tích</span>{' '}
                            <span className="sm:hidden">Biểu đồ</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng tin: <span className="text-[#002d6b]">{totalItems}</span>
                        </span>
                    </div>
                </div>

                <TabsContent value="list" className="space-y-6 mt-0 border-none p-0">
                    <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-slate-50 border border-slate-100">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="TÌM KIẾM THEO TIÊU ĐỀ, PHÒNG BAN..."
                                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="h-12 w-12 border-4 border-[#002d6b] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Briefcase size={48} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Không có tin tuyển dụng nào.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[550px]">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/50">
                                            <th className="text-left p-3 md:p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Vị trí & Phòng ban
                                            </th>
                                            <th className="text-left p-3 md:p-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">
                                                Địa điểm & Loại hình
                                            </th>
                                            <th className="text-left p-3 md:p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Trạng thái
                                            </th>
                                            <th className="text-left p-3 md:p-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                                                Hạn nộp
                                            </th>
                                            <th className="text-right p-3 md:p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {jobs.map((job) => (
                                            <tr
                                                key={job.id}
                                                className="hover:bg-slate-50/30 transition-colors group"
                                            >
                                                <td className="p-3 md:p-6">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                                                            {job.title}
                                                        </p>
                                                        {job.department && (
                                                            <p className="text-[10px] font-black text-[#002d6b] uppercase tracking-wider">
                                                                {job.department}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 md:p-6 text-xs font-bold text-slate-600 hidden md:table-cell">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {job.location || 'Chưa xác định'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {EMPLOYMENT_TYPE_LABELS[
                                                                job.employment_type
                                                            ] || job.employment_type}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 md:p-6">
                                                    <Badge
                                                        className={cn(
                                                            'rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none',
                                                            STATUS_CONFIG[
                                                                job.status as keyof typeof STATUS_CONFIG
                                                            ]?.color,
                                                        )}
                                                    >
                                                        {
                                                            STATUS_CONFIG[
                                                                job.status as keyof typeof STATUS_CONFIG
                                                            ]?.label
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="p-3 md:p-6 whitespace-nowrap hidden sm:table-cell">
                                                    {job.deadline ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                                            <Calendar
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {format(
                                                                new Date(job.deadline),
                                                                'dd/MM/yyyy',
                                                                { locale: vi },
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300 font-black uppercase">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 md:p-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {hasPermission(
                                                            PERMISSIONS.RECRUITMENT_UPDATE,
                                                        ) && (
                                                            <Link
                                                                href={PORTAL_ROUTES.cms.jobs.edit(
                                                                    job.id,
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-9 w-9 bg-slate-50 hover:bg-[#002d6b] hover:text-white text-slate-400 transition-all rounded-none"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </Button>
                                                            </Link>
                                                        )}

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
                                                                className="rounded-none border-slate-100 shadow-xl w-56 p-2"
                                                            >
                                                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 py-2">
                                                                    Quản trị tin
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    asChild
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                                                >
                                                                    <Link
                                                                        href={`/tuyen-dung/${job.slug}`}
                                                                        target="_blank"
                                                                        className="flex items-center gap-3"
                                                                    >
                                                                        <ExternalLink
                                                                            size={14}
                                                                            className="text-blue-500"
                                                                        />{' '}
                                                                        Xem trực tiếp
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                {hasPermission(
                                                                    PERMISSIONS.RECRUITMENT_DELETE,
                                                                ) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setItemToDelete(job);
                                                                            setDeleteDialogOpen(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 hover:bg-rose-50 px-3 py-2"
                                                                    >
                                                                        <Trash2 size={14} /> Xóa tin
                                                                        đăng
                                                                    </DropdownMenuItem>
                                                                )}
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
                    </div>

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
                </TabsContent>

                <TabsContent
                    value="analytics"
                    className="space-y-8 mt-0 border-none p-0 animate-in fade-in duration-500"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                        <PieChartLabel
                            title="Trạng thái tuyển dụng"
                            description="Phân bổ tin tuyển dụng theo trạng thái"
                            data={statusChartData}
                            config={statusConfig}
                            dataKey="count"
                            nameKey="status"
                            footerTitle="Tỷ lệ lấp đầy"
                            footerDescription="Tình trạng tin tuyển dụng đang hoạt động"
                            className="lg:col-span-1"
                        />
                        <AreaChartGradient
                            title="Mật độ đăng tin"
                            description="Số lượng tin tuyển dụng mới qua các tháng"
                            data={trendData}
                            config={{ jobs: { label: 'Tin tuyển dụng', color: '#002d6b' } }}
                            dataKeys={['jobs']}
                            xAxisKey="month"
                            footerTitle="Tăng trưởng nhân sự"
                            footerDescription="Phân tích nhu cầu tuyển dụng 6 tháng qua"
                            className="lg:col-span-2"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
                itemName={itemToDelete?.title || ''}
            />
        </div>
    );
}
