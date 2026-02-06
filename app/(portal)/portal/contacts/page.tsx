'use client';

import $api from '@/utils/axios';
import {
    Search,
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
    LayoutList,
    PieChart as PieChartIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { TablePagination } from '@/components/portal/table-pagination';
import { API_ROUTES } from '@/constants/routes';
import { PieChartLabel } from '@/components/portal/charts/PieChartLabel';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';

interface Contact {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'pending' | 'processed' | 'spam';
    created_at: string;
}

const STATUS_CONFIG = {
    pending: {
        label: 'Cần xử lý',
        color: 'bg-amber-500/10 text-amber-600',
        icon: Clock,
        chartColor: '#f59e0b',
    },
    processed: {
        label: 'Đã xử lý',
        color: 'bg-emerald-500/10 text-emerald-600',
        icon: CheckCircle2,
        chartColor: '#10b981',
    },
    spam: {
        label: 'Spam',
        color: 'bg-rose-500/10 text-rose-600',
        icon: AlertCircle,
        chartColor: '#f43f5e',
    },
};

export default function ContactsManagementPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Date Filter state
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Detail Sheet state
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Delete Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Contact | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const fetchContacts = async (page: number, limit: number, search: string, dr?: DateRange) => {
        setIsLoading(true);
        try {
            const res = await $api.get(API_ROUTES.CONTACTS, {
                params: {
                    page,
                    limit,
                    search: search || undefined,
                    startDate: dr?.from?.toISOString(),
                    endDate: dr?.to?.toISOString(),
                },
            });
            setContacts(res.data.data || []);
            if (res.data.meta) {
                setTotalItems(res.data.meta.total || 0);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Không thể tải danh sách liên hệ');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await $api.get(API_ROUTES.STATS);
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch contact stats', error);
        }
    };

    useEffect(() => {
        fetchContacts(currentPage, pageSize, debouncedSearch, dateRange);
        fetchStats();
    }, [currentPage, pageSize, debouncedSearch, dateRange]);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await $api.patch(`${API_ROUTES.CONTACTS}/${id}`, { status });
            toast.success('Đã cập nhật trạng thái');
            fetchContacts(currentPage, pageSize, debouncedSearch, dateRange);
            fetchStats();
        } catch {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await $api.delete(`${API_ROUTES.CONTACTS}/${itemToDelete.id}`);
            toast.success('Đã xóa liên hệ');
            fetchContacts(currentPage, pageSize, debouncedSearch, dateRange);
            fetchStats();
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch {
            toast.error('Xóa liên hệ thất bại');
        } finally {
            setIsDeleting(false);
        }
    };

    // Prepare chart data
    const statusChartData = stats?.contactStats
        ? Object.entries(stats.contactStats).map(([status, count]) => {
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
            contacts: t.contacts || 0,
        })) || [];

    return (
        <div className="flex-1 space-y-10 py-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#002d6b] text-white text-[8px] font-black uppercase tracking-widest">
                            Sài Gòn Valve CMS
                        </span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-amber-500 rounded-full animate-pulse" />{' '}
                            Channel Monitoring
                        </span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-8 border-[#002d6b] pl-6 leading-none">
                        Quản lý Liên hệ
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Hệ thống tiếp nhận và xử lý thông tin khách hàng. Theo dõi lưu lượng liên hệ
                        đa kênh, phân tích trạng thái xử lý và xu hướng phản hồi trong thời gian
                        thực.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="h-auto p-1 bg-slate-100/80 rounded-none gap-1">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <LayoutList size={14} /> Danh sách liên hệ
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <PieChartIcon size={14} /> Biểu đồ phân tích
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng liên hệ: <span className="text-[#002d6b]">{totalItems}</span>
                        </span>
                    </div>
                </div>

                <TabsContent value="list" className="space-y-6 mt-0 border-none p-0">
                    <div className="flex flex-col md:flex-row gap-4 p-6 bg-slate-50 border border-slate-100">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="TÌM THEO TÊN, EMAIL, SỐ ĐIỆN THOẠI, CHỦ ĐỀ..."
                                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'h-12 justify-start text-left font-black uppercase tracking-widest text-[10px] rounded-none border-slate-100 bg-white min-w-60',
                                        !dateRange && 'text-slate-400',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                                                {format(dateRange.to, 'dd/MM/yyyy')}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'dd/MM/yyyy')
                                        )
                                    ) : (
                                        'Lọc theo khoảng ngày'
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
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
                                onClick={() => setDateRange(undefined)}
                                className="h-12 px-4 rounded-none text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest"
                            >
                                Xóa lọc
                            </Button>
                        )}
                    </div>

                    <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="h-12 w-12 border-4 border-[#002d6b] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <MessageSquare size={48} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Không có yêu cầu liên hệ nào.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/50">
                                            <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Khách hàng
                                            </th>
                                            <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Chủ đề
                                            </th>
                                            <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Thông tin liên hệ
                                            </th>
                                            <th className="text-left p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Ngày gửi
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
                                        {contacts.map((contact) => (
                                            <tr
                                                key={contact.id}
                                                className="hover:bg-slate-50/30 transition-colors group"
                                            >
                                                <td className="p-6">
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                        {contact.full_name}
                                                    </p>
                                                </td>
                                                <td className="p-6 max-w-50">
                                                    <p className="text-[10px] font-black text-[#002d6b] uppercase truncate flex items-center gap-2">
                                                        <Building size={12} /> {contact.subject}
                                                    </p>
                                                </td>
                                                <td className="p-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                            <Mail
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {contact.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                            <Phone
                                                                size={12}
                                                                className="text-slate-300"
                                                            />
                                                            {contact.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 whitespace-nowrap">
                                                    <span className="text-[10px] font-bold text-slate-500 italic">
                                                        {format(
                                                            new Date(contact.created_at),
                                                            'HH:mm, dd/MM/yyyy',
                                                            { locale: vi },
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <Badge
                                                        className={cn(
                                                            'rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none',
                                                            STATUS_CONFIG[
                                                                contact.status as keyof typeof STATUS_CONFIG
                                                            ]?.color,
                                                        )}
                                                    >
                                                        {
                                                            STATUS_CONFIG[
                                                                contact.status as keyof typeof STATUS_CONFIG
                                                            ]?.label
                                                        }
                                                    </Badge>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 bg-slate-50 hover:bg-[#002d6b] hover:text-white text-slate-400 transition-all rounded-none"
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
                                                                    Quản trị trạng thái
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                                                    onClick={() =>
                                                                        handleUpdateStatus(
                                                                            contact.id,
                                                                            'processed',
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle2
                                                                        size={14}
                                                                        className="text-emerald-500"
                                                                    />{' '}
                                                                    Đã xử lý
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                                                    onClick={() =>
                                                                        handleUpdateStatus(
                                                                            contact.id,
                                                                            'pending',
                                                                        )
                                                                    }
                                                                >
                                                                    <Clock
                                                                        size={14}
                                                                        className="text-amber-500"
                                                                    />{' '}
                                                                    Chờ xử lý
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2"
                                                                    onClick={() =>
                                                                        handleUpdateStatus(
                                                                            contact.id,
                                                                            'spam',
                                                                        )
                                                                    }
                                                                >
                                                                    <AlertCircle
                                                                        size={14}
                                                                        className="text-rose-500"
                                                                    />{' '}
                                                                    Spam
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 hover:bg-rose-50 px-3 py-2"
                                                                    onClick={() => {
                                                                        setItemToDelete(contact);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} /> Xóa vĩnh
                                                                    viễn
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <PieChartLabel
                            title="Trạng thái xử lý"
                            description="Phân bổ liên hệ theo quy trình vận hành"
                            data={statusChartData}
                            config={statusConfig}
                            dataKey="count"
                            nameKey="status"
                            footerTitle="Hiệu quả phản hồi"
                            footerDescription="Dựa trên tỷ lệ liên hệ đã giải quyết"
                            className="lg:col-span-1"
                        />
                        <AreaChartGradient
                            title="Lưu lượng liên hệ"
                            description="Số lượng yêu cầu nhận được qua các tháng"
                            data={trendData}
                            config={{ contacts: { label: 'Liên hệ', color: '#fbbf24' } }}
                            dataKeys={['contacts']}
                            xAxisKey="month"
                            footerTitle="Động thái thị trường"
                            footerDescription="Phân tích tăng trưởng liên hệ 6 tháng qua"
                            className="lg:col-span-2"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl p-0 border-none overflow-hidden shadow-2xl rounded-none">
                    <SheetHeader className="p-10 bg-[#002d6b] text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-0.5 bg-[#fbbf24] text-[#002d6b] text-[8px] font-black uppercase tracking-widest">
                                Inquiry Ticket
                            </span>
                        </div>
                        <SheetTitle className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                            <MessageSquare size={32} className="text-[#fbbf24]" />
                            {selectedContact?.subject}
                        </SheetTitle>
                        <SheetDescription className="text-white/60 font-medium italic text-sm">
                            Thông tin liên hệ chi tiết được hệ thống ghi nhận từ Cổng thông tin
                            khách hàng.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedContact && (
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Khách hàng
                                    </span>
                                    <p className="text-sm font-black text-slate-900 uppercase">
                                        {selectedContact.full_name}
                                    </p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Ngày gửi
                                    </span>
                                    <p className="text-[10px] font-bold text-slate-500">
                                        {format(
                                            new Date(selectedContact.created_at),
                                            'HH:mm - dd/MM/yyyy',
                                            { locale: vi },
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Email liên hệ
                                    </span>
                                    <p className="text-sm font-black text-blue-600 lowercase">
                                        {selectedContact.email}
                                    </p>
                                </div>
                                <div className="space-y-1.5 text-right">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Số điện thoại
                                    </span>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedContact.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase text-[#002d6b] tracking-[0.2em] flex items-center gap-2">
                                    Nội dung yêu cầu chi tiết:
                                </span>
                                <div className="bg-slate-50 p-8 border border-slate-100 italic text-sm text-slate-600 leading-relaxed border-l-8 border-l-[#fbbf24]">
                                    "{selectedContact.message}"
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-slate-100 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Trạng thái hiện tại
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={cn(
                                                'rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none shadow-sm',
                                                STATUS_CONFIG[
                                                    selectedContact.status as keyof typeof STATUS_CONFIG
                                                ]?.color,
                                            )}
                                        >
                                            {
                                                STATUS_CONFIG[
                                                    selectedContact.status as keyof typeof STATUS_CONFIG
                                                ]?.label
                                            }
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedContact.status !== 'processed' && (
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
                                            onClick={() => {
                                                handleUpdateStatus(selectedContact.id, 'processed');
                                                setIsSheetOpen(false);
                                            }}
                                        >
                                            Phê duyệt xử lý
                                        </Button>
                                    )}
                                    {selectedContact.status !== 'spam' && (
                                        <Button
                                            variant="outline"
                                            className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => {
                                                handleUpdateStatus(selectedContact.id, 'spam');
                                                setIsSheetOpen(false);
                                            }}
                                        >
                                            Đánh dấu Spam
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
                loading={isDeleting}
                itemName={itemToDelete?.full_name || ''}
            />
        </div>
    );
}
