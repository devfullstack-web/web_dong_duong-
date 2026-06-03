'use client';

import $api from '@/utils/axios';
import { format } from 'date-fns';
import {
    MoreHorizontal,
    Trash2,
    Mail,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Calendar as CalendarIcon,
    Building,
    Eye,
    FileSpreadsheet,
    X,
} from 'lucide-react';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { API_ROUTES } from '@/constants/routes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/shared/data-table';
import { useTranslations } from 'next-intl';
import * as React from 'react';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    subject: string | null;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived' | 'spam';
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG = {
    new: {
        label: 'Mới',
        color: 'bg-blue-500/10 text-blue-600',
        icon: MessageSquare,
        chartColor: '#3b82f6',
    },
    read: {
        label: 'Đã đọc',
        color: 'bg-amber-500/10 text-amber-600',
        icon: Clock,
        chartColor: '#f59e0b',
    },
    replied: {
        label: 'Đã trả lời',
        color: 'bg-emerald-500/10 text-emerald-600',
        icon: CheckCircle2,
        chartColor: '#10b981',
    },
    archived: {
        label: 'Đã lưu trữ',
        color: 'bg-slate-500/10 text-slate-500',
        icon: Building,
        chartColor: '#64748b',
    },
    spam: {
        label: 'Spam',
        color: 'bg-rose-500/10 text-rose-600',
        icon: AlertCircle,
        chartColor: '#f43f5e',
    },
};

export default function ContactsManagementPage() {
    const queryClient = useQueryClient();
    const t = useTranslations('Portal.Contacts');
    const tc = useTranslations('Portal.Common');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Date Filter state
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Detail Sheet state
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Delete Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Contact | null>(null);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // Fetch contacts using react-query
    const { data: contactsData, isLoading } = useQuery<{
        data: Contact[];
        meta: { total: number };
    }>({
        queryKey: [
            'admin-contacts',
            { page: currentPage, limit: pageSize, search: debouncedSearch, dateRange },
        ],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.CONTACTS, {
                params: {
                    page: currentPage,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    startDate: dateRange?.from?.toISOString(),
                    endDate: dateRange?.to?.toISOString(),
                },
            });
            if (res.data.success !== false) {
                return {
                    data: res.data.data || [],
                    meta: res.data.meta || { total: 0 },
                };
            }
            throw new Error('Failed to fetch contacts');
        },
    });

    const contacts = contactsData?.data || [];
    const totalItems = contactsData?.meta?.total || 0;

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await $api.patch(`${API_ROUTES.CONTACTS}/${id}`, { status });
        },
        onSuccess: () => {
            toast.success(t('updateStatusSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: () => {
            toast.error(tc('general') || 'Failed');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.CONTACTS}/${id}`);
        },
        onSuccess: () => {
            toast.success(t('deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error(tc('general') || 'Failed');
        },
    });

    const handleUpdateStatus = React.useCallback((id: string, status: string) => {
        updateStatusMutation.mutate({ id, status });
    }, [updateStatusMutation]);

    const handleDelete = () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const handleExportExcel = async () => {
        try {
            const res = await $api.get(`${API_ROUTES.CONTACTS}/export`, {
                params: {
                    search: debouncedSearch || undefined,
                    startDate: dateRange?.from?.toISOString(),
                    endDate: dateRange?.to?.toISOString(),
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `lien-he_${format(new Date(), 'dd-MM-yyyy')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('exportSuccess'));
        } catch (error) {
            console.error('Export failed:', error);
            toast.error(t('exportError') || 'Cannot export data');
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'HH:mm, dd/MM/yyyy');
        } catch {
            return dateStr;
        }
    };

    // Define table columns
    const columns = React.useMemo<ColumnDef<Contact>[]>(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('name')} />
            ),
            cell: ({ row }) => {
                const contact = row.original;
                return (
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                            {contact.name}
                        </p>
                        {contact.address && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                                {contact.address}
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'subject',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('subject')} className="hidden lg:flex" />
            ),
            cell: ({ row }) => (
                <span className="text-[10px] font-black text-[#002d6b] uppercase truncate max-w-50 flex items-center gap-2 hidden lg:flex">
                    <Building size={12} /> {row.original.subject || 'N/A'}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('info')} className="hidden md:flex" />
            ),
            cell: ({ row }) => {
                const contact = row.original;
                return (
                    <div className="space-y-1 hidden md:block">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                            <Mail size={12} className="text-slate-300" />
                            {contact.email}
                        </div>
                        {contact.phone && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <Phone size={12} className="text-slate-300" />
                                {contact.phone}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title={t('date')} className="hidden sm:flex" />
            ),
            cell: ({ row }) => (
                <span className="text-[10px] font-bold text-slate-500 italic hidden sm:block">
                    {formatDate(row.original.created_at)}
                </span>
            ),
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
                    {t(`status.${row.original.status}` as never)}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => (
                <div className="text-right uppercase text-[9px] font-black tracking-widest text-slate-400">
                    {tc('actions')}
                </div>
            ),
            cell: ({ row }) => {
                const contact = row.original;
                return (
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 bg-slate-50 hover:bg-[#002d6b] hover:text-white text-slate-400 transition-all rounded-none hover:cursor-pointer"
                                onClick={() => {
                                    setSelectedContact(contact);
                                    setIsSheetOpen(true);
                                }}
                            >
                                <Eye size={14} />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-9 w-9 p-0 rounded-none hover:bg-slate-50 hover:cursor-pointer"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="rounded-none border-slate-100 shadow-sm w-56 p-2 bg-white"
                                >
                                    <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 py-2">
                                        {t('adminStatus')}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                        onClick={() => handleUpdateStatus(contact.id, 'read')}
                                    >
                                        <Clock size={14} className="text-amber-500" /> {t('status.read')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                        onClick={() => handleUpdateStatus(contact.id, 'replied')}
                                    >
                                        <CheckCircle2 size={14} className="text-emerald-500" /> {t('status.replied')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                        onClick={() => handleUpdateStatus(contact.id, 'archived')}
                                    >
                                        <Building size={14} className="text-slate-500" /> {t('status.archived')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                        onClick={() => handleUpdateStatus(contact.id, 'spam')}
                                    >
                                        <AlertCircle size={14} className="text-rose-500" /> {t('status.spam')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-50" />
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 hover:bg-rose-50 px-3 py-2"
                                        onClick={() => {
                                            setItemToDelete(contact);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 size={14} /> {tc('delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            },
        },
    ], [handleUpdateStatus, t, tc]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-slate-900 border-l-4 border-[#002d6b] pl-3 leading-none">
                        {t('title')}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {t('totalContacts')}: <span className="text-[#002d6b]">{totalItems}</span>
                    </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={contacts}
                isLoading={isLoading}
                loadingText={t('loading')}
                emptyText={t('empty')}
                emptyIcon={<MessageSquare size={64} className="text-slate-100 mb-6" />}
                toolbarProps={{
                    searchValue: searchTerm,
                    onSearchChange: setSearchTerm,
                    searchPlaceholder: t('searchPlaceholder'),
                    filters: (
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'h-8 justify-start text-left font-black uppercase tracking-widest text-[9px] rounded-none border-slate-100 bg-white w-48 shrink-0 hover:cursor-pointer',
                                            !dateRange && 'text-slate-400',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, 'dd/MM/yy')} -{' '}
                                                    {format(dateRange.to, 'dd/MM/yy')}
                                                </>
                                            ) : (
                                                format(dateRange.from, 'dd/MM/yy')
                                            )
                                        ) : (
                                            t('filterDate')
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white border border-slate-100 shadow-sm rounded-none" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>

                            {dateRange && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDateRange(undefined)}
                                    className="h-8 w-8 shrink-0 rounded-none text-rose-500 hover:bg-rose-50 hover:cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleExportExcel}
                                className="h-8 px-4 rounded-none bg-green-600 hover:bg-green-600 hover:text-white hover:opacity-80 text-[9px] font-black uppercase tracking-widest text-white shrink-0 gap-2 hover:cursor-pointer"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="hidden sm:inline">{tc('export')}</span>
                            </Button>
                        </div>
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

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-xl p-0 border border-slate-100 overflow-hidden shadow-sm rounded-none bg-white">
                    <SheetHeader className="p-5 md:p-10 bg-[#002d6b] text-white">
                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                            <span className="px-2 py-0.5 bg-[#fbbf24] text-[#002d6b] text-[8px] font-black uppercase tracking-widest">
                                {t('ticket')}
                            </span>
                        </div>
                        <SheetTitle className="text-xl md:text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3 md:gap-4">
                            <MessageSquare className="size-6 md:size-8 text-[#fbbf24] shrink-0" />
                            {selectedContact?.subject || selectedContact?.name}
                        </SheetTitle>
                        <SheetDescription className="text-white/60 font-medium italic text-sm">
                            {t('ticketDesc')}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedContact && (
                        <div className="p-5 md:p-10 space-y-6 md:space-y-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('name')}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 uppercase">
                                        {selectedContact.name}
                                    </p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('date')}
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-500">
                                        {format(
                                            new Date(selectedContact.created_at),
                                            'HH:mm - dd/MM/yyyy'
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('email')}
                                    </span>
                                    <p className="text-sm font-black text-blue-600 lowercase">
                                        {selectedContact.email}
                                    </p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('phone')}
                                    </span>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedContact.phone || t('notProvided')}
                                    </p>
                                </div>
                            </div>

                            {selectedContact.address && (
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('address')}
                                    </span>
                                    <p className="text-sm text-slate-700">
                                        {selectedContact.address}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase text-[#002d6b] tracking-[0.2em] flex items-center gap-2">
                                    {t('messageDetail')}
                                </span>
                                <div className="bg-slate-50 p-8 border border-slate-100 italic text-sm text-slate-600 leading-relaxed border-l-8 border-l-[#fbbf24]">
                                    &quot;{selectedContact.message}&quot;
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 md:pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        {t('currentStatus')}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={cn(
                                                'rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none',
                                                STATUS_CONFIG[
                                                    selectedContact.status as keyof typeof STATUS_CONFIG
                                                ]?.color,
                                            )}
                                        >
                                            {t(`status.${selectedContact.status}` as never)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedContact.status !== 'replied' && (
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer"
                                            onClick={() => {
                                                handleUpdateStatus(selectedContact.id, 'replied');
                                                setIsSheetOpen(false);
                                            }}
                                        >
                                            {t('markAsReplied')}
                                        </Button>
                                    )}
                                    {selectedContact.status !== 'spam' && (
                                        <Button
                                            variant="outline"
                                            className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest hover:cursor-pointer"
                                            onClick={() => {
                                                handleUpdateStatus(selectedContact.id, 'spam');
                                                setIsSheetOpen(false);
                                            }}
                                        >
                                            {t('markAsSpam')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
                itemName={itemToDelete?.name || ''}
                title={t('deleteTitle')}
                description={t('deleteConfirm')}
                itemLabel={t('itemLabelCap')}
            />
        </div>
    );
}
