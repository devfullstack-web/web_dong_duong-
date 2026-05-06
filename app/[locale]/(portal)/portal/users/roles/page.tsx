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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Phân quyền & Vai trò
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-sm">
                        Định nghĩa các nhóm quyền và gán cho tài khoản quản trị.
                    </p>
                </div>
                <Link href={PORTAL_ROUTES.users.roles.add}>
                    <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 hover:cursor-pointer h-auto transition-all rounded-none">
                        <Plus className="mr-2 size-4" /> Tạo vai trò mới
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-none border border-slate-100 overflow-hidden min-h-[500px]">
                {/* Table Filters */}
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center justify-between bg-white">
                    <div className="relative w-full md:w-1/2 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            placeholder="TÌM KIẾM THEO TÊN VAI TRÒ HOẶC MÔ TẢ..."
                            className="w-full pl-12 bg-slate-50 border-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20 h-14 rounded-none outline-none"
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
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 w-64">
                                        Tên vai trò
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                        Mô tả
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">
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
                                        <td className="px-8 py-6">
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
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-medium text-slate-600 line-clamp-1">
                                                {role.description || '---'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-12 w-12 p-0 hover:bg-white hover:text-brand-primary border border-transparent hover:border-slate-100 rounded-none transition-all"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-64 p-2 rounded-none border border-slate-100 bg-white"
                                                >
                                                    <DropdownMenuItem
                                                        asChild
                                                        className="rounded-none px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 group"
                                                    >
                                                        <Link
                                                            href={PORTAL_ROUTES.users.roles.edit(
                                                                role.id,
                                                            )}
                                                            className="flex items-center gap-3 w-full"
                                                        >
                                                            <Edit2
                                                                size={16}
                                                                className="text-slate-400 group-hover:text-brand-primary transition-colors"
                                                            />
                                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                                Cấu hình quyền
                                                            </span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {!role.is_super && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-slate-50" />
                                                            <DropdownMenuItem
                                                                className="rounded-none px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-rose-50 group"
                                                                onClick={() =>
                                                                    handleDeleteClick(role)
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                    className="text-slate-400 group-hover:text-rose-600 transition-colors"
                                                                />
                                                                <span className="text-xs font-bold uppercase tracking-tight text-rose-600">
                                                                    Xóa vai trò
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
