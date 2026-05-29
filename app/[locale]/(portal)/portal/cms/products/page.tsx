'use client';

import { Product } from '@/types';
import $api from '@/utils/axios';
import {
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Package,
    Calendar as CalendarIcon,
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
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
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
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { useDebounce } from '@/hooks/use-debounce';
import { PERMISSIONS } from '@/constants/rbac';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocalizedValue } from '@/types/i18n';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/shared/data-table';
import { useTranslations, useLocale } from 'next-intl';
import * as React from 'react';

interface CategoryNode {
    id: string;
    name: string;
    children?: CategoryNode[];
}

function flattenCategories(nodes: CategoryNode[], level = 0): { id: string; name: string; level: number }[] {
    const result: { id: string; name: string; level: number }[] = [];
    for (const node of nodes) {
        result.push({ id: node.id, name: node.name, level });
        if (node.children && node.children.length > 0) {
            result.push(...flattenCategories(node.children, level + 1));
        }
    }
    return result;
}

const PRODUCT_STATUS_FILTERS: Product['status'][] = ['active', 'inactive'];

function getProductDisplayName(product: Product, locale: string) {
    return getLocalizedValue(product.name_localized, locale) || product.name;
}

function getProductCategoryName(product: Product, locale: string) {
    return getLocalizedValue(product.category_localized, locale) || product.category || '';
}

function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    if (!imgSrc || hasError) {
        return (
            <div className="flex items-center justify-center h-full w-full text-slate-300 bg-slate-100">
                <Package size={20} />
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

export default function ProductsManagementPage() {
    const { can: hasPermission } = usePermissions();
    const queryClient = useQueryClient();
    const t = useTranslations('Portal.Products');
    const tc = useTranslations('Portal.Common');
    const locale = useLocale();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Date Filter state
    const [date, setDate] = useState<DateRange | undefined>();

    // Category filter state
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<Product['status'] | ''>('active');

    // Fetch product categories
    const { data: categoriesData } = useQuery<{ data: CategoryNode[] }>({
        queryKey: ['product-categories'],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.CATEGORIES, { params: { type: 'product' } });
            return { data: res.data.data || [] };
        },
    });
    const categoryList = categoriesData?.data || [];
    const flatCategoryList = flattenCategories(categoryList);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId, selectedStatus]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch products using react-query
    const { data: productsData, isLoading } = useQuery<{
        data: Product[];
        meta: { total: number };
    }>({
        queryKey: [
            'admin-products',
            {
                page: currentPage,
                limit: pageSize,
                search: debouncedSearch,
                dateRange: date,
                categoryId: selectedCategoryId,
                status: selectedStatus,
            },
        ],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.PRODUCTS, {
                params: {
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    startDate: date?.from?.toISOString(),
                    endDate: date?.to?.toISOString(),
                    categoryId: selectedCategoryId || undefined,
                    status: selectedStatus || undefined,
                },
            });
            if (res.data.success !== false) {
                return {
                    data: res.data.data || [],
                    meta: res.data.meta || { total: 0 },
                };
            }
            throw new Error('Failed to fetch products');
        },
    });

    const productsList = productsData?.data || [];
    const totalItems = productsData?.meta?.total || 0;

    const handleExportExcel = () => {
        if (!productsList || productsList.length === 0) {
            toast.error('Không có dữ liệu sản phẩm để xuất');
            return;
        }

        const headers = ['Mã sản phẩm (ID)', 'Tên sản phẩm', 'SKU', 'Giá bán (VND)', 'Tồn kho', 'Danh mục', 'Trạng thái'];
        
        const csvRows = [
            headers.join(','),
            ...productsList.map(product => {
                const id = `"${product.id.replace(/"/g, '""')}"`;
                const name = `"${getProductDisplayName(product).replace(/"/g, '""')}"`;
                const sku = `"${product.sku.replace(/"/g, '""')}"`;
                const price = product.price;
                const stock = product.stock;
                const category = `"${getProductCategoryName(product).replace(/"/g, '""')}"`;
                const statusLabel = product.status === 'active' ? t('active') : t('inactive');
                const status = `"${statusLabel}"`;
                
                return [id, name, sku, price, stock, category, status].join(',');
            })
        ];

        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `danh_sach_san_pham_${format(new Date(), 'dd_MM_yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('exportSuccess'));
    };

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.PRODUCTS}/${id}`);
        },
        onSuccess: () => {
            toast.success(t('deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error(tc('general') || 'Failed');
        },
    });

    const handleDeleteClick = (product: Product) => {
        setItemToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const getStatusBadge = React.useCallback((status: Product['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-emerald-100/80 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none flex items-center gap-1.5 w-fit">
                        <CheckCircle2 size={10} /> {t('active')}
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none flex items-center gap-1.5 w-fit">
                        <XCircle size={10} /> {t('inactive')}
                    </Badge>
                );
            default:
                return null;
        }
    }, [t]);

    // Define table columns
    const columns = React.useMemo<ColumnDef<Product>[]>(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('product')} />
            ),
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative h-10 w-14 md:h-11 md:w-16 rounded-none overflow-hidden shrink-0 border border-slate-100 transition-transform group-hover:scale-105 bg-slate-100">
                            <ProductImage src={product.image_url} alt={getProductDisplayName(product, locale)} />
                        </div>
                        <div className="max-w-87.5">
                            <div className="text-sm font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-1 uppercase tracking-tight mb-0.5">
                                {getProductDisplayName(product, locale)}
                            </div>
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                {t('companyName')} Official
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('category')} className="hidden md:flex" />
            ),
             cell: ({ row }) => (
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight hidden md:block">
                    {getProductCategoryName(row.original, locale) || t('uncategorized')}
                </span>
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
                const product = row.original;
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
                                    Tùy chọn sản phẩm
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50" />

                                {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={PORTAL_ROUTES.cms.products.edit(product.id)}
                                            className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-50 group"
                                        >
                                            <Edit2
                                                size={14}
                                                className="text-slate-400 group-hover:text-brand-primary transition-colors"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                                                {tc('edit')}
                                            </span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                                    <>
                                        <DropdownMenuSeparator className="bg-slate-50" />
                                        <DropdownMenuItem
                                            className="rounded-none px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-rose-50 group"
                                            onClick={() => handleDeleteClick(product)}
                                        >
                                            <Trash2
                                                size={14}
                                                className="text-slate-400 group-hover:text-rose-600 transition-colors"
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-tight text-rose-600">
                                                {t('deleteProduct')}
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
    ], [hasPermission, getStatusBadge, t, tc, locale]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-sm">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {hasPermission(PERMISSIONS.CMS_UPDATE) && (
                        <Link href={PORTAL_ROUTES.cms.products.categories.list}>
                            <Button
                                variant="outline"
                                className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 hover:cursor-pointer h-10 border-slate-100 bg-white rounded-none"
                            >
                                {t('categories')}
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="outline"
                        className="text-[10px] font-black uppercase tracking-widest px-4 hover:cursor-pointer h-10 border-slate-100 bg-white rounded-none hidden sm:flex"
                        onClick={handleExportExcel}
                    >
                        {tc('export')}
                    </Button>
                    {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
                        <Link href={PORTAL_ROUTES.cms.products.add}>
                            <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-4 md:px-6 hover:cursor-pointer h-10 transition-all rounded-none">
                                <Plus className="mr-2 size-4" /> {t('addProduct')}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={productsList}
                isLoading={isLoading}
                loadingText={t('loading')}
                emptyText={t('empty')}
                emptyIcon={<Package size={64} className="text-slate-100 mb-6" />}
                toolbarProps={{
                    searchValue: searchTerm,
                    onSearchChange: setSearchTerm,
                    searchPlaceholder: t('searchPlaceholder'),
                    filters: (
                        <>
                            {/* Category Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full sm:w-48 justify-between text-left font-bold text-[10px] uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50 text-[9px] hover:cursor-pointer',
                                            selectedCategoryId ? 'text-brand-primary border-brand-primary/30' : 'text-slate-400',
                                        )}
                                    >
                                        <span className="truncate">
                                            {selectedCategoryId
                                                ? flatCategoryList.find((c) => c.id === selectedCategoryId)?.name
                                                : t('filterCategory')}
                                        </span>
                                        <ChevronDown className="ml-2 h-3 w-3 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 rounded-none border border-slate-100 p-1 max-h-80 overflow-y-auto bg-white">
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer"
                                        onClick={() => setSelectedCategoryId('')}
                                    >
                                        {t('allCategories')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    {categoryList.map((cat) => {
                                        const hasChildren = cat.children && cat.children.length > 0;

                                        if (hasChildren) {
                                            return (
                                                <DropdownMenuSub key={cat.id}>
                                                    <DropdownMenuSubTrigger
                                                        className={cn(
                                                            'text-[10px] font-bold uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer flex justify-between items-center',
                                                            selectedCategoryId === cat.id && 'text-brand-primary bg-brand-primary/5',
                                                        )}
                                                    >
                                                        {cat.name}
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent className="rounded-none border border-slate-100 p-1 bg-white min-w-44 max-h-80 overflow-y-auto">
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    'text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer text-slate-500 hover:text-slate-900',
                                                                    selectedCategoryId === cat.id && 'text-brand-primary bg-brand-primary/5',
                                                                )}
                                                                onClick={() => setSelectedCategoryId(cat.id)}
                                                            >
                                                                {t('allInCategory', { category: cat.name })}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-50" />
                                                            {cat.children.map((subCat) => (
                                                                <DropdownMenuItem
                                                                    key={subCat.id}
                                                                    className={cn(
                                                                        'text-[10px] font-bold uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer',
                                                                        selectedCategoryId === subCat.id && 'text-brand-primary bg-brand-primary/5',
                                                                    )}
                                                                    onClick={() => setSelectedCategoryId(subCat.id)}
                                                                >
                                                                    {subCat.name}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                            );
                                        }

                                        return (
                                            <DropdownMenuItem
                                                key={cat.id}
                                                className={cn(
                                                    'text-[10px] font-bold uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer',
                                                    selectedCategoryId === cat.id && 'text-brand-primary bg-brand-primary/5',
                                                )}
                                                onClick={() => setSelectedCategoryId(cat.id)}
                                            >
                                                {cat.name}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Status Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full sm:w-48 justify-between text-left font-bold text-[10px] uppercase tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50 text-[9px] hover:cursor-pointer',
                                            selectedStatus ? 'text-brand-primary border-brand-primary/30' : 'text-slate-400',
                                        )}
                                    >
                                        <span className="truncate">
                                            {selectedStatus
                                                ? t(selectedStatus as never)
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
                                    {PRODUCT_STATUS_FILTERS.map((status) => (
                                        <DropdownMenuItem
                                            key={status}
                                            className={cn(
                                                'text-[10px] font-bold uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer',
                                                selectedStatus === status && 'text-brand-primary bg-brand-primary/5',
                                            )}
                                            onClick={() => setSelectedStatus(status)}
                                        >
                                            {t(status as never)}
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
                                                'w-full justify-start text-left font-bold text-[10px] uppercase hover:cursor-pointer tracking-widest h-8 border-slate-100 rounded-none bg-slate-50/50 text-[9px]',
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

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title={t('deleteTitle')}
                description={t('deleteConfirm')}
                itemName={itemToDelete?.name}
                itemLabel={t('itemLabelCap')}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
