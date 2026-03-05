'use client';

import { useState, useEffect } from 'react';
import { Search, User, Activity, Info, ShieldAlert, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TablePagination } from '@/components/portal/table-pagination';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';

export default function AuditLogsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<any>(null);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // Fetch logs using react-query
    const { data: logsData, isLoading } = useQuery<{
        data: any[];
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
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        Tạo mới
                    </Badge>
                );
            case 'UPDATE':
                return (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        Cập nhật
                    </Badge>
                );
            case 'DELETE':
                return (
                    <Badge className="bg-rose-50 text-rose-600 border-rose-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        Xóa
                    </Badge>
                );
            case 'LOGIN':
                return (
                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        Đăng nhập
                    </Badge>
                );
            case 'AUTH_FAILURE':
                return (
                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        Lỗi Auth
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-slate-50 text-slate-500 border-slate-100 uppercase text-[8px] font-black tracking-widest px-2 py-0.5 rounded-none">
                        {action}
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-4 md:space-y-8 pb-10 md:pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none border-l-4 md:border-l-8 border-[#002d6b] pl-4 md:pl-6">
                        Nhật ký Hệ thống
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-xs ml-4 md:ml-6">
                        Giám sát và kiểm soát mọi hoạt động tác động đến dữ liệu của quản trị viên.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-none overflow-hidden">
                <div className="p-3 md:p-6 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-3 md:gap-4 bg-slate-50/30">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <Input
                            placeholder="TÌM THEO MÔ TẢ HOẶC NGƯỜI DÙNG..."
                            className="pl-11 h-12 bg-white border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Phân hệ:
                            </span>
                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                <SelectTrigger className="w-36 h-10 rounded-none border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-slate-100 shadow-xl">
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
                                <SelectTrigger className="w-36 h-10 rounded-none border-slate-200 bg-white text-[10px] font-bold uppercase tracking-widest">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-slate-100 shadow-xl">
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
                </div>

                <div className="overflow-x-auto min-h-100">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Thời gian / IP
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                                    Quản trị viên
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Hành động
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                                    Nội dung thay đổi
                                </th>
                                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                                    Chi tiết
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td
                                            colSpan={5}
                                            className="px-8 py-6 h-16 bg-slate-50/20"
                                        ></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-20">
                                            <ShieldAlert size={48} />
                                            <p className="text-xs font-black uppercase tracking-widest">
                                                Không có bản ghi nào
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-4 md:px-8 py-4 md:py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                                                    <Clock size={12} className="text-slate-300" />
                                                    {format(
                                                        new Date(log.createdAt),
                                                        'HH:mm - dd/MM/yyyy',
                                                        { locale: vi },
                                                    )}
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-400 mt-0.5 ml-4">
                                                    IP: {log.ipAddress}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-4 md:py-5 hidden sm:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-slate-100 flex items-center justify-center rounded-none border border-slate-200 shrink-0">
                                                    <User size={14} className="text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                                                        {log.user?.fullName ||
                                                            log.user?.username ||
                                                            'SYSTEM'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-400 lowercase italic">
                                                        @{log.user?.username || 'system'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-4 md:py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {getActionBadge(log.action)}
                                                <span className="text-[9px] font-black text-slate-400 flex items-center gap-1">
                                                    <Activity size={10} /> {log.module}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-4 md:py-5 hidden lg:table-cell">
                                            <p className="text-xs font-medium text-slate-600 max-w-xs truncate italic">
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 border-slate-100 rounded-none bg-white hover:bg-[#002d6b] hover:text-white transition-all shadow-sm"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={page}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    itemLabel="bản ghi"
                />
            </div>

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl w-[95vw] rounded-none border-slate-100 p-0 overflow-hidden">
                    <DialogHeader className="p-4 md:p-6 bg-slate-50 border-b border-slate-100">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-[#002d6b] flex items-center gap-3">
                            <Info size={20} /> Chi tiết Nhật ký
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
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
                                    "{selectedLog.description}"
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
