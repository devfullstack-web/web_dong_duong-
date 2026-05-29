'use client';

import { useState, useEffect } from 'react';
import { User, Activity, Info, ShieldAlert, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/shared/data-table';
import * as React from 'react';

interface AuditLog {
    id: string;
    createdAt: string;
    ipAddress: string;
    user: {
        fullName: string;
        username: string;
    } | null;
    action: string;
    module: string;
    description: string;
    targetId: string | null;
    changes: Record<string, unknown> | null;
    userAgent: string;
}

export default function AuditLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Fetch logs using react-query
    const { data: logsData, isLoading } = useQuery<{
        data: AuditLog[];
        meta: { total: number };
    }>({
        queryKey: [
            'admin-audit-logs',
            {
                page,
                limit: pageSize,
                search: debouncedSearch,
                module: moduleFilter,
                action: actionFilter,
            },
        ],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.AUDIT_LOGS, {
                params: {
                    page,
                    limit: pageSize,
                    search: debouncedSearch || undefined,
                    module: moduleFilter !== 'all' ? moduleFilter : undefined,
                    action: actionFilter !== 'all' ? actionFilter : undefined,
                },
            });
            if (res.data.success !== false) {
                return {
                    data: res.data.data || [],
                    meta: res.data.meta || { total: 0 },
                };
            }
            throw new Error('Failed to fetch audit logs');
        },
    });

    const logs = logsData?.data || [];
    const totalItems = logsData?.meta?.total || 0;

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'CREATE':
                return (
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        Tạo mới
                    </Badge>
                );
            case 'UPDATE':
                return (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        Cập nhật
                    </Badge>
                );
            case 'DELETE':
                return (
                    <Badge className="bg-rose-50 text-rose-600 border-rose-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        Xóa
                    </Badge>
                );
            case 'LOGIN':
                return (
                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        Đăng nhập
                    </Badge>
                );
            case 'AUTH_FAILURE':
                return (
                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        Lỗi Auth
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-slate-50 text-slate-500 border-slate-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none w-fit">
                        {action}
                    </Badge>
                );
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'HH:mm - dd/MM/yyyy', { locale: vi });
        } catch {
            return dateStr;
        }
    };

    // Define table columns
    const columns = React.useMemo<ColumnDef<AuditLog>[]>(() => [
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Thời gian / IP" />
            ),
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-300" />
                            {formatDate(log.createdAt)}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5 ml-4">
                            IP: {log.ipAddress}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'user',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Quản trị viên" className="hidden sm:flex" />
            ),
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <div className="flex items-center gap-3 hidden sm:flex">
                        <div className="size-8 bg-slate-100 flex items-center justify-center rounded-none border border-slate-200 shrink-0">
                            <User size={14} className="text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                                {log.user?.fullName || log.user?.username || 'SYSTEM'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 lowercase italic">
                                @{log.user?.username || 'system'}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Hành động" />
            ),
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <div className="flex flex-col gap-1.5">
                        {getActionBadge(log.action)}
                        <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                            <Activity size={10} /> {log.module}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nội dung thay đổi" className="hidden lg:flex" />
            ),
            cell: ({ row }) => (
                <p className="text-xs font-medium text-slate-600 max-w-xs truncate italic hidden lg:block">
                    {row.original.description}
                </p>
            ),
        },
        {
            id: 'actions',
            header: () => (
                <div className="text-right uppercase text-[9px] font-black tracking-widest text-slate-400">
                    Chi tiết
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-100 rounded-none bg-white hover:bg-[#002d6b] hover:text-white transition-all shadow-sm hover:cursor-pointer"
                        onClick={() => setSelectedLog(row.original)}
                    >
                        <Eye size={14} />
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 pl-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 border-[#002d6b] pl-4 leading-none">
                        Nhật ký Hệ thống
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed pl-4">
                        Giám sát và kiểm soát mọi hoạt động tác động đến dữ liệu của quản trị viên.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng số bản ghi:{' '}
                            <span className="text-[#002d6b]">{totalItems}</span>
                        </span>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={logs}
                isLoading={isLoading}
                loadingText="Đang tải nhật ký hệ thống..."
                emptyText="Không có bản ghi nào."
                emptyIcon={<ShieldAlert size={64} className="text-slate-100 mb-6" />}
                toolbarProps={{
                    searchValue: searchQuery,
                    onSearchChange: setSearchQuery,
                    searchPlaceholder: "TÌM THEO MÔ TẢ HOẶC NGƯỜI DÙNG...",
                    filters: (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Phân hệ:
                                </span>
                                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                    <SelectTrigger className="w-36 h-10 rounded-none border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest hover:cursor-pointer">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-slate-100 shadow-xl bg-white">
                                        <SelectItem
                                            value="all"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Tất cả
                                        </SelectItem>
                                        <SelectItem
                                            value="AUTH"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Authentication
                                        </SelectItem>
                                        <SelectItem
                                            value="USERS"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Người dùng
                                        </SelectItem>
                                        <SelectItem
                                            value="ROLES"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Vai trò
                                        </SelectItem>
                                        <SelectItem
                                            value="MODULES"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Modules
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Hành động:
                                </span>
                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger className="w-36 h-10 rounded-none border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest hover:cursor-pointer">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-slate-100 shadow-xl bg-white">
                                        <SelectItem
                                            value="all"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Tất cả
                                        </SelectItem>
                                        <SelectItem
                                            value="CREATE"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Tạo mới
                                        </SelectItem>
                                        <SelectItem
                                            value="UPDATE"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Cập nhật
                                        </SelectItem>
                                        <SelectItem
                                            value="DELETE"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Xóa
                                        </SelectItem>
                                        <SelectItem
                                            value="LOGIN"
                                            className="text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Đăng nhập
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )
                }}
                paginationProps={{
                    currentPage: page,
                    totalItems: totalItems,
                    pageSize: pageSize,
                    onPageChange: setPage,
                    onPageSizeChange: (size) => {
                        setPageSize(size);
                        setPage(1);
                    },
                    itemLabel: "bản ghi"
                }}
            />

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl w-[95vw] rounded-none border-slate-100 p-0 overflow-hidden bg-white">
                    <DialogHeader className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-[#002d6b] flex items-center gap-3">
                            <Info size={20} /> Chi tiết Nhật ký
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide bg-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Thời gian
                                        </label>
                                        <p className="text-sm font-bold text-slate-900">
                                            {format(
                                                new Date(selectedLog.createdAt),
                                                'HH:mm:ss - dd MMMM, yyyy',
                                                { locale: vi },
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Người thực hiện
                                        </label>
                                        <p className="text-sm font-bold text-slate-900">
                                            {selectedLog.user?.fullName} (@
                                            {selectedLog.user?.username})
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Địa chỉ IP
                                        </label>
                                        <p className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 w-max">
                                            {selectedLog.ipAddress}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            Phân hệ / Hành động
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {getActionBadge(selectedLog.action)}
                                            <Badge
                                                variant="outline"
                                                className="text-[8px] font-black px-2 py-0.5 rounded-none"
                                            >
                                                {selectedLog.module}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                                            ID Đối tượng
                                        </label>
                                        <p className="text-[10px] font-mono text-slate-500 truncate">
                                            {selectedLog.targetId || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                                    Mô tả hành động
                                </label>
                                <div className="bg-amber-50/50 border border-amber-100 p-4 text-sm font-medium text-slate-700 italic">
                                    &quot;{selectedLog.description}&quot;
                                </div>
                            </div>

                            {selectedLog.changes && (
                                <div className="pt-6 border-t border-slate-100">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                                        Dữ liệu thay đổi (JSON)
                                    </label>
                                    <div className="bg-slate-900 p-6 rounded-none font-mono text-[11px] overflow-x-auto">
                                        <pre className="text-indigo-300">
                                            {JSON.stringify(selectedLog.changes, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                                    Thông tin thiết bị (User Agent)
                                </label>
                                <p className="text-[10px] text-slate-400 leading-relaxed break-all">
                                    {selectedLog.userAgent}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
