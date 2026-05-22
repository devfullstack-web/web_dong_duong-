'use client';

import { Role } from '@/types';
import $api from '@/utils/axios';
import {
    Plus,
    Search,
    MoreHorizontal,
    ShieldCheck,
    Edit2,
    Trash2,
    Loader2,
    Lock,
} from 'lucide-react';
import * as React from 'react';
import Link from 'next/link';
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
import { toast } from 'sonner';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';

export default function RolesManagementPage() {
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<Role | null>(null);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const res = await $api.get(API_ROUTES.ROLES);
            setRoles(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách vai trò');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRoles();
    }, []);

    const handleDeleteClick = (role: Role) => {
        if (role.is_super) {
            toast.error('Không thể xóa vai trò quản trị viên hệ thống');
            return;
        }
        setItemToDelete(role);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            await $api.delete(`${API_ROUTES.ROLES}/${itemToDelete.id}`);
            toast.success('Đã xóa vai trò thành công');
            setRoles(roles.filter((r) => r.id !== itemToDelete.id));
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa vai trò');
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 pl-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 border-[#002d6b] pl-4 leading-none">
                        Quản lý Vai trò
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed pl-4">
                        Định nghĩa các nhóm quyền và gán cho tài khoản quản trị.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng vai trò: <span className="text-[#002d6b]">{filteredRoles.length}</span>
                        </span>
                    </div>
                    <Link href={PORTAL_ROUTES.users.roles.add}>
                        <Button className="h-10 hover:cursor-pointer px-6 w-full md:w-auto bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                            <Plus size={18} /> Tạo vai trò mới
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-none border border-slate-100 overflow-hidden min-h-[500px]">
                {/* Table Filters */}
                <div className="p-4 md:p-5 bg-slate-50 border border-slate-100">
                    <div className="relative max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#002d6b] transition-colors" />
                        <input
                            placeholder="TÌM KIẾM THEO TÊN VAI TRÒ HOẶC MÔ TẢ..."
                            className="w-full h-10 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 rounded-none outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 size={40} className="animate-spin text-brand-primary opacity-20" />
                    </div>
                ) : filteredRoles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="px-4 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 w-64">
                                        Tên vai trò
                                    </th>
                                    <th className="px-4 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                        Mô tả
                                    </th>
                                    <th className="px-4 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRoles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-4 py-3 md:py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-indigo-50 flex items-center justify-center">
                                                    <ShieldCheck
                                                        size={14}
                                                        className="text-indigo-600"
                                                    />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                    {role.name}
                                                </span>
                                                {role.is_super && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-amber-50 text-amber-600 border-amber-100 text-[8px] font-black tracking-widest uppercase rounded-none"
                                                    >
                                                        Hệ thống
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 md:py-3.5">
                                            <span className="text-sm font-medium text-slate-600 line-clamp-1">
                                                {role.description || '---'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 md:py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link href={PORTAL_ROUTES.users.roles.edit(role.id)}>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 border-slate-100 rounded-none bg-white hover:bg-[#002d6b] hover:text-white transition-all"
                                                        title="Cấu hình quyền"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                </Link>
                                                {!role.is_super && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 border-slate-100 rounded-none bg-white text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                                                        onClick={() => handleDeleteClick(role)}
                                                        title="Xóa vai trò"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-24 text-center h-[500px] flex items-center justify-center flex-col">
                        <Lock size={64} className="text-slate-100 mb-6" />
                        <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">
                            Chưa có vai trò nào được định nghĩa.
                        </p>
                    </div>
                )}
            </div>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Xóa vai trò"
                description="Việc xóa vai trò sẽ gỡ bỏ quyền truy cập của tất cả người dùng thuộc vai trò này. Bạn có chắc chắn muốn tiếp tục?"
                itemName={itemToDelete?.name}
            />
        </div>
    );
}
