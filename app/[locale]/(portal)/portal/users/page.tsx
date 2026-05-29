'use client';

import $api from '@/utils/axios';
import { Role, User } from '@/types';
import {
    Plus,
    Search,
    MoreHorizontal,
    User as UserIcon,
    Edit2,
    Trash2,
    Shield,
    Activity,
    Users,
    Lock,
    LockOpen,
} from 'lucide-react';
import { useState } from 'react';
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
import { DeleteConfirmationDialog, ConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/constants/rbac';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function UsersManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<User | null>(null);
    const [lockDialogOpen, setLockDialogOpen] = useState(false);
    const [itemToLock, setItemToLock] = useState<User | null>(null);
    const { user: currentUser, can: hasPermission } = usePermissions();
    const queryClient = useQueryClient();

    // Fetch users using react-query
    const { data: usersData, isLoading } = useQuery<User[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await $api.get(API_ROUTES.USERS);
            return res.data.data || [];
        },
    });



    const users = usersData || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.USERS}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa tài khoản thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error('Lỗi khi xóa tài khoản');
        },
    });

    // Lock/Unlock mutation
    const lockMutation = useMutation({
        mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) => {
            await $api.patch(`${API_ROUTES.USERS}/${id}`, { isLocked });
        },
        onSuccess: (_data, variables) => {
            toast.success(variables.isLocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setLockDialogOpen(false);
            setItemToLock(null);
        },
        onError: () => {
            toast.error('Lỗi khi thay đổi trạng thái tài khoản');
        },
    });

    const handleLockClick = (user: User) => {
        setItemToLock(user);
        setLockDialogOpen(true);
    };

    const handleLockConfirm = () => {
        if (!itemToLock) return;
        lockMutation.mutate({ id: itemToLock.id, isLocked: !(itemToLock.isLocked ?? itemToLock.is_locked) });
    };

    const handleDeleteClick = (user: User) => {
        setItemToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                false),
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5 pl-4">
                    <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 border-[#002d6b] pl-4 leading-none">
                        Quản lý Tài khoản
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed pl-4">
                        Hệ thống quản trị truy cập và phân quyền người dùng.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng tài khoản:{' '}
                            <span className="text-[#002d6b]">{filteredUsers.length}</span>
                        </span>
                    </div>
                    {hasPermission(PERMISSIONS.USERS_CREATE) && (
                        <Link href={PORTAL_ROUTES.users.add}>
                            <Button className="h-10 hover:cursor-pointer px-6 w-full md:w-auto bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                                <Plus size={18} /> Tạo tài khoản mới
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="space-y-4 md:space-y-6 mt-0">
                    <div className="p-4 md:p-5 bg-slate-50 border border-slate-100">
                        <div className="relative max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-[#002d6b] transition-colors" />
                            <input
                                placeholder="TÌM KIẾM THEO TÊN HOẶC USERNAME..."
                                className="w-full h-10 pl-12 pr-4 bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-primary/20 rounded-none outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 overflow-hidden">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <div className="h-12 w-12 border-4 border-[#002d6b] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/50">
                                            <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Người dùng
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                                                Thông tin chi tiết
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">
                                                Phân quyền
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                                                Ngày gia nhập
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50/30 transition-colors group"
                                            >
                                                <td className="px-4 md:px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 md:size-9 bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                                                            <UserIcon
                                                                size={16}
                                                                className="text-slate-400"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                                                {user.username}
                                                                {(user.isLocked ?? user.is_locked) && (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-500 text-[8px] font-black uppercase tracking-widest">
                                                                        <Lock size={8} /> Đã khóa
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400">
                                                                {user.email ||
                                                                    'Chưa cập nhật email'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 hidden lg:table-cell">
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase italic">
                                                        {user.full_name || user.fullName || '---'}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((r: Role) => (
                                                                <Badge
                                                                    key={r.id}
                                                                    className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none"
                                                                >
                                                                    <Shield
                                                                        size={8}
                                                                        className="mr-1"
                                                                    />{' '}
                                                                    {r.name}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <Badge className="bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none">
                                                                CHƯA PHÂN QUYỀN
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 hidden sm:table-cell">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                                        <Activity
                                                            size={12}
                                                            className="text-slate-300"
                                                        />
                                                        {user.created_at
                                                            ? format(
                                                                  new Date(user.created_at),
                                                                  'dd/MM/yyyy',
                                                                  { locale: vi },
                                                              )
                                                            : user.createdAt
                                                              ? format(
                                                                    new Date(user.createdAt),
                                                                    'dd/MM/yyyy',
                                                                    { locale: vi },
                                                                )
                                                              : '---'}
                                                    </span>
                                                </td>

                                                <td className="px-4 md:px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {hasPermission(
                                                            PERMISSIONS.USERS_UPDATE,
                                                        ) && (
                                                            <Link
                                                                href={PORTAL_ROUTES.users.edit(
                                                                    user.id,
                                                                )}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 bg-slate-50 hover:bg-[#002d6b] hover:text-white text-slate-400 transition-all rounded-none"
                                                                >
                                                                    <Edit2 size={13} />
                                                                </Button>
                                                            </Link>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0 rounded-none hover:bg-slate-50"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="rounded-none border-slate-100 shadow-sm w-48 p-1 bg-white"
                                                            >
                                                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-2.5 py-1.5">
                                                                    Quản trị bảo mật
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-slate-50" />

                                                                {hasPermission(PERMISSIONS.USERS_UPDATE) && (
                                                                    <DropdownMenuItem
                                                                        className={cn(
                                                                            'text-[10px] font-black uppercase tracking-tight cursor-pointer gap-2 px-2.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
                                                                            (user.isLocked ?? user.is_locked)
                                                                                ? 'text-emerald-600 hover:bg-emerald-50 focus:bg-emerald-50 hover:text-emerald-700 focus:text-emerald-700'
                                                                                : 'text-amber-600 hover:bg-amber-50 focus:bg-amber-50 hover:text-amber-700 focus:text-amber-700',
                                                                        )}
                                                                        onClick={() => handleLockClick(user)}
                                                                        disabled={currentUser?.id === user.id || lockMutation.isPending}
                                                                    >
                                                                        {(user.isLocked ?? user.is_locked) ? (
                                                                            <><LockOpen size={13} className="shrink-0 text-emerald-500" /> Mở khóa tài khoản</>
                                                                        ) : (
                                                                            <><Lock size={13} className="shrink-0 text-amber-500" /> Khóa tài khoản</>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {hasPermission(PERMISSIONS.USERS_DELETE) && (
                                                                    <DropdownMenuItem
                                                                        className={cn(
                                                                            'text-[10px] font-black uppercase tracking-tight cursor-pointer gap-2 px-2.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
                                                                            currentUser?.id === user.id
                                                                                ? 'text-slate-400'
                                                                                : 'text-rose-500 hover:bg-rose-50 focus:bg-rose-50 hover:text-rose-600 focus:text-rose-600',
                                                                        )}
                                                                        onClick={() => handleDeleteClick(user)}
                                                                        disabled={currentUser?.id === user.id}
                                                                    >
                                                                        {currentUser?.id === user.id ? (
                                                                            <span className="text-[9px] font-bold normal-case tracking-normal">
                                                                                Không thể xóa tài khoản của chính bạn
                                                                            </span>
                                                                        ) : (
                                                                            <><Trash2 size={13} className="shrink-0 text-rose-500" /> Xóa tài khoản</>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Users size={48} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Không tìm thấy tài khoản phù hợp.
                                </p>
                            </div>
                        )}
                    </div>
            </div>


            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Xác nhận hạ cấp tài khoản?"
                description="Bạn đang chuẩn bị vô hiệu hóa quyền truy cập của tài khoản này vào hệ thống CMS. Hành động này không thể hoàn tác lập tức."
                itemName={itemToDelete?.username}
            />

            <ConfirmationDialog
                open={lockDialogOpen}
                onOpenChange={setLockDialogOpen}
                onConfirm={handleLockConfirm}
                variant="warning"
                icon={itemToLock && (itemToLock.isLocked ?? itemToLock.is_locked) ? LockOpen : Lock}
                title={(itemToLock?.isLocked ?? itemToLock?.is_locked) ? 'Xác nhận mở khóa tài khoản?' : 'Xác nhận khóa tài khoản?'}
                description={(itemToLock?.isLocked ?? itemToLock?.is_locked)
                    ? `Tài khoản "${itemToLock?.username}" sẽ được mở khóa và có thể đăng nhập trở lại vào hệ thống.`
                    : `Tài khoản "${itemToLock?.username}" sẽ bị khóa và không thể đăng nhập vào hệ thống cho đến khi được mở khóa.`
                }
                confirmText={(itemToLock?.isLocked ?? itemToLock?.is_locked) ? 'Mở khóa' : 'Khóa tài khoản'}
                loading={lockMutation.isPending}
            />
        </div>
    );
}
