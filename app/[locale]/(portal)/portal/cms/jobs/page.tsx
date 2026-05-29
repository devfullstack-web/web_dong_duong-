'use client';

import $api from '@/utils/axios';
import {
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    Briefcase,
    MapPin,
    Clock as ClockIcon,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
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
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { PERMISSIONS } from '@/constants/rbac';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/shared/data-table';
import { useTranslations } from 'next-intl';
import * as React from 'react';

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
    const { can: hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const t = useTranslations('Portal.Jobs');
    const tc = useTranslations('Portal.Common');
    const tCareers = useTranslations('Careers');
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

    const jobs = jobsData?.data || [];
    const totalItems = jobsData?.meta?.total || 0;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.JOBS}/${id}`);
        },
        onSuccess: () => {
            toast.success(t('deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error(tc('general') || 'Failed');
        },
    });

    const handleDelete = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return dateStr;
        }
    };

    // Define table columns
    const columns = React.useMemo<ColumnDef<JobPosting>[]>(() => [
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('position')} />
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
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
                );
            },
        },
        {
            accessorKey: 'location',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('type')} className="hidden md:flex" />
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 hidden md:block">
                        <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-slate-300" />
                            {job.location || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon size={12} className="text-slate-300" />
                            {tCareers(`employmentTypes.${job.employment_type}` as never) || job.employment_type}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={tc('status')} />
            ),
            cell: ({ row }) => (
                <Badge
                    className={cn(
                        'rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none w-fit',
                        STATUS_CONFIG[row.original.status as keyof typeof STATUS_CONFIG]?.color,
                    )}
                >
                    {t(row.original.status === 'open' ? 'active' : 'inactive')}
                </Badge>
            ),
        },
        {
            accessorKey: 'deadline',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('deadline')} className="hidden sm:flex" />
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="hidden sm:block">
                        {job.deadline ? (
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                <CalendarIcon size={12} className="text-slate-300" />
                                {formatDate(job.deadline)}
                            </div>
                        ) : (
                            <span className="text-[10px] text-slate-300 font-black uppercase">—</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => (
                <div className="text-right uppercase text-[9px] font-black tracking-widest text-slate-400">
                    {tc('actions')}
                </div>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            {hasPermission(PERMISSIONS.RECRUITMENT_UPDATE) && (
                                <Link href={PORTAL_ROUTES.cms.jobs.edit(job.id)}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 bg-slate-50 hover:bg-[#002d6b] hover:text-white text-slate-400 transition-all rounded-none hover:cursor-pointer"
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                </Link>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 p-0 rounded-none hover:bg-slate-50 hover:cursor-pointer"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="rounded-none border-slate-100 shadow-sm w-48 p-1 bg-white"
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
                                            <ExternalLink size={14} className="text-blue-500" /> Xem trực tiếp
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    {hasPermission(PERMISSIONS.RECRUITMENT_DELETE) && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setItemToDelete(job);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 hover:bg-rose-50 px-3 py-2"
                                        >
                                            <Trash2 size={14} /> Xóa tin đăng
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            },
        },
    ], [hasPermission, t, tCareers, tc]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-slate-900 border-l-4 border-[#002d6b] pl-3 leading-none">
                        Quản lý Tuyển dụng
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Danh sách và thông tin các vị trí tuyển dụng.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng tin: <span className="text-[#002d6b]">{totalItems}</span>
                        </span>
                    </div>
                    {hasPermission(PERMISSIONS.RECRUITMENT_CREATE) && (
                        <Link href={PORTAL_ROUTES.cms.jobs.add}>
                            <Button className="h-10 px-4 md:px-6 w-full md:w-auto bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-none text-[10px] font-black uppercase tracking-widest flex items-center gap-3 justify-center">
                                <Plus size={16} /> Thêm tin mới
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={jobs}
                isLoading={isLoading}
                loadingText="Đang tải danh sách tuyển dụng..."
                emptyText="Không có tin tuyển dụng nào."
                emptyIcon={<Briefcase size={64} className="text-slate-100 mb-6" />}
                toolbarProps={{
                    searchValue: searchTerm,
                    onSearchChange: setSearchTerm,
                    searchPlaceholder: "TÌM KIẾM THEO TIÊU ĐỀ, PHÒNG BAN...",
                }}
                paginationProps={{
                    currentPage: currentPage,
                    totalItems: totalItems,
                    pageSize: pageSize,
                    onPageChange: setCurrentPage,
                    onPageSizeChange: (size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    },
                    itemLabel: "tin tuyển dụng"
                }}
            />

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
