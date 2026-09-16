'use client';

import { NewsArticle } from '@/types';
import { getLocalizedValue, type Locale, type LocalizedText } from '@/types/i18n';
import $api from '@/utils/axios';

type LocalizedNewsArticle = NewsArticle & { category_localized?: LocalizedText | null };
import {
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    Calendar as CalendarIcon,
    X,
    CheckCircle,
    Clock,
    ChevronDown,
    Newspaper,
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

import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { PERMISSIONS } from '@/constants/rbac';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/shared/data-table';
import { useTranslations, useLocale } from 'next-intl';
import * as React from 'react';
import { NEWS_STATUS } from '@/constants/content';



function NewsImage({ src, alt }: { src?: string | null; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    if (!imgSrc || hasError) {
        return (
            <div className="flex items-center justify-center h-full w-full text-slate-300 bg-slate-100">
                <Newspaper size={20} />
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

export default function NewsManagementPage() {
    const { can: hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const t = useTranslations('Portal.News');
    const tc = useTranslations('Portal.Common');
    const localeStr = useLocale();
    const newsStatusFilters = React.useMemo(() => [
        { value: NEWS_STATUS.PUBLISHED, label: t('published') },
        { value: NEWS_STATUS.DRAFT, label: t('draft') },
    ], [t]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<NewsArticle | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Date Filter state
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<NewsArticle['status'] | ''>('');

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedStatus]);

    // Fetch news using react-query
    const { data: newsData, isLoading } = useQuery<{
        data: NewsArticle[];
        meta: { total: number };
    }>({
        queryKey: [
            'admin-news',
            { page: currentPage, limit: pageSize, search: debouncedSearch, dateRange: date, status: selectedStatus },
        ],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.NEWS, {
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
            throw new Error('Failed to fetch news');
        },
    });

    const newsList = newsData?.data || [];
    const totalItems = newsData?.meta?.total || 0;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.NEWS}/${id}`);
        },
        onSuccess: () => {
            toast.success(t('deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-news'] });
            queryClient.invalidateQueries({ queryKey: ['news'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error(tc('general') || 'Failed');
        },
    });

    const handleDeleteClick = (news: NewsArticle) => {
        setItemToDelete(news);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const getStatusBadge = React.useCallback((status: NewsArticle['status']) => {
        switch (status) {
            case NEWS_STATUS.PUBLISHED:
                return (
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none flex items-center gap-2">
                        <CheckCircle size={10} /> {t('published')}
                    </Badge>
                );
            case NEWS_STATUS.DRAFT:
                return (
                    <Badge className="bg-slate-50 text-slate-500 border-slate-100 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none flex items-center gap-2">
                        <Clock size={10} /> {t('draft')}
                    </Badge>
                );
            default:
                return null;
        }
    }, [t]);

    const formatDate = React.useCallback((dateStr?: string) => {
        if (!dateStr) return t('notPublished');
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy', {
                locale: localeStr === 'vi' ? vi : localeStr === 'zh' ? zhCN : enUS,
            });
        } catch {
            return dateStr;
        }
    }, [localeStr, t]);

    // Define table columns
    const columns = React.useMemo<ColumnDef<NewsArticle>[]>(() => [
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('article')} />
            ),
            cell: ({ row }) => {
                const news = row.original;
                return (
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="relative h-10 w-14 md:h-11 md:w-16 rounded-none overflow-hidden shrink-0 border border-slate-100 transition-transform group-hover:scale-105 bg-slate-100">
                            <NewsImage src={news.image_url} alt={news.title} />
                        </div>
                        <div className="max-w-[250px] md:max-w-[450px]">
                            <div className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight mb-1">
                                {getLocalizedValue(news.title_localized, localeStr as Locale) || news.title}
                            </div>
                            <Badge
                                variant="outline"
                                className="text-[9px] font-bold text-slate-400 border-slate-200 uppercase tracking-widest px-2 py-0 rounded-none"
                            >
                                {getLocalizedValue((news as LocalizedNewsArticle).category_localized, localeStr as Locale) || news.category || t('uncategorized')}
                            </Badge>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'author',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('author')} className="hidden md:flex" />
            ),
            cell: ({ row }) => {
                const news = row.original;
                return (
                    <div className="flex items-center gap-2 hidden md:flex">
                        <div className="h-6 w-6 rounded-none bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                            {news.author?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                            {news.author || 'Admin'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'published_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('date')} className="hidden sm:flex" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase tracking-tight hidden sm:flex">
                    <CalendarIcon
                        size={14}
                        className="text-brand-primary/40"
                    />
                    <span>{formatDate(row.original.published_at)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={tc('status')} />
            ),
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            id: 'actions',
            header: () => (
                <div className="text-right uppercase text-[10px] font-black tracking-widest text-slate-400">
                    {tc('actions')}
                </div>
            ),
            cell: ({ row }) => {
                const news = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-9 w-9 p-0 hover:bg-white hover:text-brand-primary border border-transparent hover:border-slate-100 rounded-none transition-all hover:cursor-pointer"
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-48 p-1 rounded-none border border-slate-100 bg-white"
                            >
                                <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">
                                    {t('articleOptions')}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50" />

                                {hasPermission(PERMISSIONS.BLOG_UPDATE) && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={PORTAL_ROUTES.cms.news.edit(news.id)}
                                            className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50 group"
                                        >
                                            <Edit2
                                                size={16}
                                                className="text-slate-400 group-hover:text-brand-primary transition-colors"
                                            />
                                            <span className="text-xs font-bold uppercase tracking-tight text-slate-900">
                                                {t('editArticle')}
                                            </span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                {hasPermission(PERMISSIONS.BLOG_DELETE) && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-50" />
                                        <DropdownMenuItem
                                            className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-rose-50 group"
                                            onClick={() => handleDeleteClick(news)}
                                        >
                                            <Trash2
                                                size={16}
                                                className="text-slate-400 group-hover:text-rose-600 transition-colors"
                                            />
                                            <span className="text-xs font-bold uppercase tracking-tight text-rose-600">
                                                {t('deleteArticle')}
                                            </span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ], [hasPermission, formatDate, getStatusBadge, t, tc, localeStr]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-xs">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    {hasPermission(PERMISSIONS.CMS_UPDATE) && (
                        <Link href={PORTAL_ROUTES.cms.news.categories.list}>
                            <Button
                                variant="outline"
                                className="text-[10px] font-black uppercase tracking-widest px-4 md:px-5 hover:cursor-pointer h-10 border-slate-100 bg-white rounded-none"
                            >
                                {t('categories')}
                            </Button>
                        </Link>
                    )}
                    {hasPermission(PERMISSIONS.BLOG_CREATE) && (
                        <Link href={PORTAL_ROUTES.cms.news.add}>
                            <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-4 md:px-6 hover:cursor-pointer h-10 transition-all rounded-none">
                                <Plus className="mr-2 size-4" /> {t('addArticle')}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={newsList}
                isLoading={isLoading}
                loadingText={t('loading')}
                emptyText={t('empty')}
                emptyIcon={<Newspaper size={64} className="text-slate-100 mb-6" />}
                toolbarProps={{
                    searchValue: searchTerm,
                    onSearchChange: setSearchTerm,
                    searchPlaceholder: t('searchPlaceholder'),
                    filters: (
                        <>
                            {/* Status Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full sm:w-48 justify-between text-left font-bold text-[9px] uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50 hover:cursor-pointer',
                                            selectedStatus ? 'text-brand-primary border-brand-primary/30' : 'text-slate-400',
                                        )}
                                    >
                                        <span className="truncate">
                                            {selectedStatus
                                                ? newsStatusFilters.find((item) => item.value === selectedStatus)?.label
                                                : t('filterStatus')}
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 rounded-none border border-slate-100 p-1 bg-white">
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer"
                                        onClick={() => setSelectedStatus('')}
                                    >
                                        {t('allStatuses')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    {newsStatusFilters.map((status) => (
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
                                                'w-full justify-start text-left font-bold text-[9px] uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50 hover:cursor-pointer',
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
                                                <span>{t('filterDate')}</span>
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
                                                    className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                                                    onClick={() => setDate(undefined)}
                                                >
                                                    <X className="mr-2 size-3" /> {t('clearFilter')}
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </>
                    )
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
                    itemLabel: t('itemLabel')
                }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={t('deleteTitle')}
                description={t('deleteConfirm')}
                itemName={itemToDelete?.title}
                itemLabel={t('itemLabelCap')}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
