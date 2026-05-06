'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import $api from '@/utils/axios';
import { ArrowLeft, UserPlus, Shield, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { Role } from '@/types';

export default function AddUserPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleId: '' as string,
    });
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [, setIsLoadingRoles] = useState(true);
    const [selectedRoleDetails, setSelectedRoleDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await $api.get(API_ROUTES.ROLES);
                setAvailableRoles(res.data.data || []);
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải danh sách vai trò');
            } finally {
                setIsLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleRoleChange = async (roleId: string) => {
        setFormData({ ...formData, roleId });
        setIsLoadingDetails(true);
        try {
            const res = await $api.get(`${API_ROUTES.ROLES}/${roleId}`);
            setSelectedRoleDetails(res.data.data);
        } catch (error) {
            console.error('Failed to fetch role details:', error);
            toast.error('Không thể lấy chi tiết quyền hạn của vai trò');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.roleId) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.USERS, {
                ...formData,
                roleIds: [formData.roleId],
            });
            toast.success('Tạo tài khoản thành công');
            router.push(PORTAL_ROUTES.users.list);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || 'Lỗi khi tạo tài khoản';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center gap-6">
                <Link href={PORTAL_ROUTES.users.list}>
                    <Button
                        variant="outline"
                        className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Cấp tài khoản mới
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-sm">
                        Khởi tạo định danh quản trị viên cho hệ thống Sài Gòn Valve.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-10 border-l-4 border-l-brand-primary shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.03)] space-y-10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/2 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="space-y-8 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <UserIcon size={12} className="text-brand-primary" /> Tên
                                        người dùng <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="VD: NGUYENVANA"
                                        className="h-12 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all placeholder:font-normal placeholder:italic"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                username: e.target.value.toUpperCase(),
                                            })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Lock size={12} className="text-brand-primary" /> Mật khẩu
                                        ban đầu <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 bg-slate-50 border-none text-xs font-bold rounded-none focus:ring-2 focus:ring-brand-primary/10 transition-all"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Họ và tên đầy đủ
                                </Label>
                                <Input
                                    placeholder="VD: NGUYỄN VĂN A"
                                    className="h-12 bg-slate-50 border-none text-[11px] font-black  tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Email liên hệ
                                    </Label>
                                    <Input
                                        placeholder="example@saigonvalve.vn"
                                        className="h-12 bg-slate-50 border-none text-[11px] font-black  tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Số điện thoại
                                    </Label>
                                    <Input
                                        placeholder="09xx xxx xxx"
                                        className="h-12 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Shield size={12} className="text-brand-primary" /> Gán vai
                                        trò <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={handleRoleChange}
                                        value={formData.roleId}
                                    >
                                        <SelectTrigger className="h-16 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest rounded-none focus:ring-2 focus:ring-brand-primary/10 transition-all">
                                            <SelectValue placeholder="CHỌN VAI TRÒ CHO TÀI KHOẢN" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-slate-100">
                                            {availableRoles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.id}
                                                    className="text-[10px] font-bold uppercase tracking-wider py-3 focus:bg-slate-50"
                                                >
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.roleId && (
                                    <div className="pt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#002d6b]">
                                            PHÂN QUYỀN TRỰC THUỘC VAI TRÒ
                                        </h4>

                                        <div className="bg-white border-y border-slate-100 overflow-hidden">
                                            <div className="grid grid-cols-2 py-3 bg-slate-50/50 px-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Module
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Quyền hạn
                                                </span>
                                            </div>

                                            {isLoadingDetails ? (
                                                <div className="py-12 flex justify-center">
                                                    <Loader2
                                                        className="animate-spin text-brand-primary opacity-20"
                                                        size={24}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {selectedRoleDetails?.permissions?.map(
                                                        (p: any) => (
                                                            <div
                                                                key={p.id}
                                                                className="grid grid-cols-2 py-5 px-4 items-center group hover:bg-slate-50/30 transition-colors"
                                                            >
                                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                                                                    {p.module?.name}
                                                                </span>
                                                                <div className="flex flex-wrap gap-2 leading-none">
                                                                    {p.canView && (
                                                                        <span className="bg-blue-100/50 text-blue-600 text-[8px] font-black px-2 py-1 uppercase tracking-tighter">
                                                                            View
                                                                        </span>
                                                                    )}
                                                                    {p.canCreate && (
                                                                        <span className="bg-emerald-100/50 text-emerald-600 text-[8px] font-black px-2 py-1 uppercase tracking-tighter">
                                                                            Create
                                                                        </span>
                                                                    )}
                                                                    {p.canUpdate && (
                                                                        <span className="bg-amber-100/50 text-amber-600 text-[8px] font-black px-2 py-1 uppercase tracking-tighter">
                                                                            Update
                                                                        </span>
                                                                    )}
                                                                    {p.canDelete && (
                                                                        <span className="bg-rose-100/50 text-rose-600 text-[8px] font-black px-2 py-1 uppercase tracking-tighter">
                                                                            Delete
                                                                        </span>
                                                                    )}
                                                                    {!p.canView &&
                                                                        !p.canCreate &&
                                                                        !p.canUpdate &&
                                                                        !p.canDelete && (
                                                                            <span className="text-[8px] font-bold italic text-slate-300">
                                                                                Không có quyền
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4 p-5 bg-brand-primary/5 border-l-2 border-l-brand-primary mt-6">
                                    <Shield
                                        size={20}
                                        className="text-brand-primary shrink-0 mt-1"
                                    />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                            Lưu ý bảo mật
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                            Người dùng sẽ nhận được tất cả quyền hạn từ vai trò được
                                            gán. Super Admin có toàn quyền truy cập vào tất cả các
                                            module hệ thống.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full md:w-auto bg-brand-primary hover:bg-[#002d6b] text-[10px] font-black uppercase tracking-[0.2em] px-16 py-4 hover:cursor-pointer h-auto shadow-2xl shadow-brand-primary/20 transition-all rounded-none hover:-translate-y-1 active:scale-95"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-3 size-5 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-3 size-5" />
                                )}
                                Xác nhận tạo tài khoản
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="p-8 bg-slate-50 border border-slate-100 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-l-4 border-l-fbbf24 pl-4 font-outfit uppercase">
                            Hướng dẫn khởi tạo
                        </h3>
                        <ul className="space-y-4">
                            {[
                                'Username nên là viết tắt tên không dấu (VD: LAMNT).',
                                'Mật khẩu nên có tối thiểu 8 ký tự, bao gồm chữ và số.',
                                'Tài khoản mới sẽ có hiệu lực ngay lập tức sau khi tạo.',
                                'Bạn có thể thay đổi vai trò hoặc thông tin bất cứ lúc nào.',
                            ].map((text, i) => (
                                <li key={i} className="flex gap-4 items-start group">
                                    <div className="size-1.5 bg-fbbf24 rounded-full mt-1.5 group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                        {text}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
