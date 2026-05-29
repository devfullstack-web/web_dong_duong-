'use client';

import { Project } from '@/types';
import $api from '@/utils/axios';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    ArrowUpDown,
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,

    Layout,
    X,
    ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
import Loading from '@/components/shared/Loading';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { TablePagination } from '@/components/portal/table-pagination';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { PERMISSIONS } from '@/constants/rbac';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PROJECT_STATUS_FILTERS: { value: Project['status']; label: string }[] = [
    { value: 'ongoing', label: 'Đang triển khai' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

function ProjectImage({ src, alt }: { src?: string | null; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    if (!imgSrc || hasError) {
        return (
            <div className="flex items-center justify-center h-full w-full text-slate-300 bg-slate-100">
                <Layout size={20} />
            </div>
        );
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            onError={() => setHasError(true)}
        />
    );
}

export default function ProjectsManagementPage() {
    const { can: hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Project | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Date Filter state
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<Project['status'] | ''>('');

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedStatus]);

    // Fetch projects using react-query
    const { data: projectsData, isLoading } = useQuery<{
        data: Project[];
        meta: { total: number };
    }>({
        queryKey: [
            'admin-projects',
            { page: currentPage, limit: pageSize, search: debouncedSearch, dateRange: date, status: selectedStatus },
        ],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.PROJECTS, {
                params: {
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    startDate: date?.from?.toISOString(),
                    endDate: date?.to?.toISOString(),
                    status: selectedStatus || undefined,
                },
            });
            if (res.data.success !== false) {
                return {
                    data: res.data.data || [],
                    meta: res.data.meta || { total: 0 },
                };
            }
            throw new Error('Failed to fetch projects');
        },
    });

    const projectsList = projectsData?.data || [];
    const totalItems = projectsData?.meta?.total || 0;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.PROJECTS}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa dự án thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error('Lỗi khi xóa dự án');
        },
    });

    const handleDeleteClick = (project: Project) => {
        setItemToDelete(project);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const getStatusBadge = (status: Project['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none flex items-center gap-2">
                        <CheckCircle size={10} /> Đã hoàn thành
                    </Badge>
                );
            case 'ongoing':
                return (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none flex items-center gap-2">
                        <Clock size={10} /> Đang triển khai
                    </Badge>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Quản lý dự án
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-xs">
                        Danh sách các dự án và công trình trọng điểm đã thực hiện.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {hasPermission(PERMISSIONS.CMS_UPDATE) && (
                        <Link href={PORTAL_ROUTES.cms.projects.categories.list}>
                            <Button
                                variant="outline"
                                className="text-[10px] font-black uppercase tracking-widest px-4 md:px-5 hover:cursor-pointer h-10 border-slate-100 bg-white rounded-none"
                            >
                                Danh mục
                            </Button>
                        </Link>
                    )}
                    {hasPermission(PERMISSIONS.PROJECTS_CREATE) && (
                        <Link href={PORTAL_ROUTES.cms.projects.add}>
                            <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-4 md:px-6 hover:cursor-pointer h-10 transition-all rounded-none">
                                <Plus className="mr-2 size-4" /> Thêm dự án mới
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-none border border-slate-100 overflow-hidden min-h-[500px]">
                {/* Table Filters  */}
                <div className="py-2.5 px-4 md:px-5 border-b border-slate-50 flex flex-col xl:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative w-full xl:w-1/2 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            placeholder="TÌM KIẾM THEO TÊN DỰ ÁN, ĐỊA ĐIỂM HOẶC LOẠI HÌNH..."
                            className="w-full pl-12 bg-slate-50 border-none text-[9px] font-bold tracking-widest placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20 h-8 rounded-none outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                        {/* Status Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full sm:w-48 justify-between text-left font-bold text-[9px] uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50',
                                        selectedStatus ? 'text-brand-primary border-brand-primary/30' : 'text-slate-400',
                                    )}
                                >
                                    <span className="truncate">
                                        {selectedStatus
                                            ? PROJECT_STATUS_FILTERS.find((item) => item.value === selectedStatus)?.label
                                            : 'Lọc trạng thái'}
                                    </span>
                                    <ChevronDown className="ml-2 h-3 w-3 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48 rounded-none border border-slate-100 p-1">
                                <DropdownMenuItem
                                    className="text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer"
                                    onClick={() => setSelectedStatus('')}
                                >
                                    Tất cả trạng thái
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                {PROJECT_STATUS_FILTERS.map((status) => (
                                    <DropdownMenuItem
                                        key={status.value}
                                        className={cn(
                                            'text-[10px] font-bold uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer',
                                            selectedStatus === status.value && 'text-brand-primary bg-brand-primary/5',
                                        )}
                                        onClick={() => setSelectedStatus(status.value)}
                                    >
                                        {status.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Date Range Picker */}
                        <div className="grid gap-2 w-full sm:w-75">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-bold text-[9px] hover:cursor-pointer uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50',
                                            !date && 'text-slate-400',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
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
                                            <span>Lọc theo ngày</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 rounded-none border border-slate-100 shadow-sm bg-white"
                                    align="start"
                                >
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        className="rounded-none bg-white"
                                    />
                                    {date && (
                                        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                                                onClick={() => setDate(undefined)}
                                            >
                                                <X className="mr-2 size-3" /> Xóa lọc
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button
                            variant="outline"
                            className="text-[9px] font-black uppercase tracking-widest px-4 h-8 border-slate-100 rounded-none hover:bg-slate-50 w-full sm:w-auto"
                        >
                            <ArrowUpDown className="mr-2 size-4 text-slate-400" /> Sắp xếp
                        </Button>
                    </div>
                </div>

                {/* Table Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loading variant="section" size="lg" text="Đang tải danh sách dự án..." />
                    </div>
                ) : projectsList.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                        Dự án
                                    </th>
                                    <th className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 hidden md:table-cell">
                                        Chủ đầu tư
                                    </th>
                                    <th className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 hidden sm:table-cell">
                                        Thời gian
                                    </th>
                                    <th className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {projectsList.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-4 md:px-5 py-3 md:py-3.5">
                                            <div className="flex items-center gap-3 md:gap-6">
                                                <div className="relative h-10 w-14 md:h-11 md:w-16 rounded-none overflow-hidden shrink-0 border border-slate-100 transition-transform group-hover:scale-105 bg-slate-100">
                                                    <ProjectImage src={project.image_url} alt={project.name} />
                                                </div>
                                                <div className="max-w-[200px] md:max-w-[400px]">
                                                    <div className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight mb-1">
                                                        {project.name}
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] font-bold text-slate-400 border-slate-200 uppercase tracking-widest px-2 py-0 rounded-none"
                                                    >
                                                        {project.category || 'Chưa phân loại'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-3.5 hidden md:table-cell">
                                            <div className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                                {project.client_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-3.5 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1 text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon
                                                        size={14}
                                                        className="text-brand-primary/40"
                                                    />
                                                    <span>{formatDate(project.start_date)}</span>
                                                </div>
                                                {project.status === 'completed' && (
                                                    <span className="text-[9px] text-slate-400">
                                                        Đến: {formatDate(project.end_date)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-3.5">
                                            {getStatusBadge(project.status)}
                                        </td>
                                        <td className="px-4 md:px-5 py-3 md:py-3.5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 hover:bg-white hover:text-brand-primary border border-transparent hover:border-slate-100 rounded-none transition-all"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48 p-1 rounded-none border border-slate-100 bg-white"
                                                >
                                                    <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">
                                                        Tùy chọn dự án
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-50" />
 
                                                    {hasPermission(PERMISSIONS.PROJECTS_UPDATE) && (
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={PORTAL_ROUTES.cms.projects.edit(
                                                                    project.id,
                                                                )}
                                                                className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50 group"
                                                            >
                                                                <Edit2
                                                                    size={16}
                                                                    className="text-slate-400 group-hover:text-brand-primary transition-colors"
                                                                />
                                                                <span className="text-xs font-bold uppercase tracking-tight text-slate-900">
                                                                    Sửa thông tin
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
 
                                                    {hasPermission(PERMISSIONS.PROJECTS_DELETE) && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-slate-50" />
                                                            <DropdownMenuItem
                                                                className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-rose-50 group"
                                                                onClick={() =>
                                                                    handleDeleteClick(project)
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                    className="text-slate-400 group-hover:text-rose-600 transition-colors"
                                                                />
                                                                <span className="text-xs font-bold uppercase tracking-tight text-rose-600">
                                                                    Xóa dự án
                                                                </span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-24 text-center h-[500px] flex items-center justify-center flex-col">
                        <Layout size={64} className="text-slate-100 mb-6" />
                        <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">
                            Không tìm thấy dự án nào phù hợp.
                        </p>
                    </div>
                )}

                {/* Pagination Footer */}
                {!isLoading && totalItems > 0 && (
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        itemLabel="dự án"
                    />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Xóa dự án"
                description="Dự án sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác."
                itemName={itemToDelete?.name}
                itemLabel="Dự án"
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
