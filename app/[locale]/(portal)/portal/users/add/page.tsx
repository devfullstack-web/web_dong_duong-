'use client';

import { FormEvent, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import $api from '@/utils/axios';
import { ArrowLeft, UserPlus, Shield, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
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
import { getModuleName } from '@/constants/rbac';

export default function AddUserPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        roleId: '' as string,
    });
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [, setIsLoadingRoles] = useState(true);
    const [selectedRoleDetails, setSelectedRoleDetails] = useState<Record<string, unknown> | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const groupedPermissions = useMemo(() => {
        if (!selectedRoleDetails?.permissions || !Array.isArray(selectedRoleDetails.permissions)) return [];
        
        const perms = selectedRoleDetails.permissions as string[];
        const groups: Record<string, { moduleName: string; actions: string[] }> = {};
        
        perms.forEach((code) => {
            const parts = code.split('.');
            if (parts.length < 2) return;
            const moduleCode = parts[0];
            const action = parts[1];
            
            if (!groups[moduleCode]) {
                groups[moduleCode] = {
                    moduleName: getModuleName(moduleCode),
                    actions: []
                };
            }
            if (!groups[moduleCode].actions.includes(action)) {
                groups[moduleCode].actions.push(action);
            }
        });
        
        return Object.entries(groups).map(([id, g]) => ({
            id,
            moduleName: g.moduleName,
            actions: g.actions
        }));
    }, [selectedRoleDetails]);

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
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name,
                email: formData.email,
                role_ids: [formData.roleId],
            });
            toast.success('Tạo tài khoản thành công');
            router.push(PORTAL_ROUTES.users.list);
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            const axiosErr = error as { response?: { data?: { error?: string } } };
            const message = axiosErr.response?.data?.error || 'Lỗi khi tạo tài khoản';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href={PORTAL_ROUTES.users.list}>
                    <Button
                        variant="outline"
                        className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none border-l-4 border-brand-primary pl-4">
                        Cấp tài khoản mới
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-1.5 text-xs pl-4">
                        Khởi tạo định danh quản trị viên cho hệ thống Sài Gòn Valve.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-3.5 md:p-4 border-l-4 border-l-brand-primary space-y-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/2 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="space-y-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <UserIcon size={12} className="text-brand-primary" /> Tên
                                        người dùng <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="VD: NGUYENVANA"
                                        className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all placeholder:font-normal placeholder:italic"
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
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Lock size={12} className="text-brand-primary" /> Mật khẩu
                                        ban đầu <span className="text-rose-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="h-9 bg-slate-50 border-none text-xs font-bold rounded-none focus:ring-2 focus:ring-brand-primary/10 transition-all pr-10"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({ ...formData, password: e.target.value })
                                            }
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Họ và tên đầy đủ
                                </Label>
                                <Input
                                    placeholder="VD: NGUYỄN VĂN A"
                                    className="h-9 bg-slate-50 border-none text-[11px] font-black tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all"
                                    value={formData.full_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, full_name: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Email liên hệ
                                </Label>
                                <Input
                                    placeholder="example@saigonvalve.vn"
                                    className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-primary/10 rounded-none transition-all"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                             <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Shield size={12} className="text-brand-primary" /> Gán vai
                                        trò <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={handleRoleChange}
                                        value={formData.roleId}
                                    >
                                        <SelectTrigger className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest rounded-none focus:ring-2 focus:ring-brand-primary/10 transition-all">
                                            <SelectValue placeholder="CHỌN VAI TRÒ CHO TÀI KHOẢN" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-slate-100">
                                            {availableRoles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.id}
                                                    className="text-[10px] font-bold uppercase tracking-wider py-2 focus:bg-slate-50"
                                                >
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.roleId && (
                                    <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#002d6b]">
                                            PHÂN QUYỀN TRỰC THUỘC VAI TRÒ
                                        </h4>

                                        <div className="bg-white border-y border-slate-100 overflow-hidden">
                                            <div className="grid grid-cols-2 py-2 bg-slate-50/50 px-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Module
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    Quyền hạn
                                                </span>
                                            </div>

                                            {isLoadingDetails ? (
                                                <div className="py-8 flex justify-center">
                                                    <Loader2
                                                        className="animate-spin text-brand-primary opacity-20"
                                                        size={20}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {groupedPermissions.map((p) => (
                                                        <div
                                                            key={p.id}
                                                            className="grid grid-cols-2 py-3 px-4 items-center group hover:bg-slate-50/30 transition-colors"
                                                        >
                                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                                                                {p.moduleName}
                                                            </span>
                                                            <div className="flex flex-wrap gap-1.5 leading-none">
                                                                {p.actions.map((action) => {
                                                                    const colorClass = 
                                                                        action === 'view' ? 'bg-blue-100/50 text-blue-600' :
                                                                        action === 'create' || action === 'upload' ? 'bg-emerald-100/50 text-emerald-600' :
                                                                        action === 'update' || action === 'assign_permission' ? 'bg-amber-100/50 text-amber-600' :
                                                                        'bg-rose-100/50 text-rose-600';
                                                                    
                                                                    return (
                                                                        <span key={action} className={cn("text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter", colorClass)}>
                                                                            {action === 'assign_permission' ? 'Assign' : action === 'upload' ? 'Upload' : action}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {groupedPermissions.length === 0 && (
                                                        <div className="py-6 text-center text-[10px] font-bold italic text-slate-300">
                                                            Không có quyền
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 p-4 bg-brand-primary/5 border-l-2 border-l-brand-primary mt-4">
                                    <Shield
                                        size={18}
                                        className="text-brand-primary shrink-0 mt-0.5"
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

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full md:w-auto bg-brand-primary hover:bg-[#002d6b] text-[10px] font-black uppercase tracking-[0.2em] px-8 h-10 hover:cursor-pointer transition-all rounded-none hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <UserPlus className="mr-2 size-4" />
                                )}
                                Xác nhận tạo tài khoản
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="p-3.5 md:p-4 bg-slate-50 border border-slate-100 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-l-4 border-l-fbbf24 pl-4 font-outfit uppercase">
                            Hướng dẫn khởi tạo
                        </h3>
                        <ul className="space-y-3">
                            {[
                                'Username nên là viết tắt tên không dấu (VD: LAMNT).',
                                'Mật khẩu nên có tối thiểu 8 ký tự, bao gồm chữ và số.',
                                'Tài khoản mới sẽ có hiệu lực ngay lập tức sau khi tạo.',
                                'Bạn có thể thay đổi vai trò hoặc thông tin bất cứ lúc nào.',
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 items-start group">
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
