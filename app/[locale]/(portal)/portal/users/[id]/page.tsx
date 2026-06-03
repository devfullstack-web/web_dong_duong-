'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import $api from '@/utils/axios';
import {
    ArrowLeft,
    Save,
    Shield,
    Lock,
    User as UserIcon,
    Loader2,
    CheckCircle2,
    Circle,
    Eye,
    EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '', // Optional for edit
        fullName: '',
        email: '',
        roleIds: [] as string[],
    });
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, rolesRes] = await Promise.all([
                    $api.get(`${API_ROUTES.USERS}/${userId}`),
                    $api.get(API_ROUTES.ROLES),
                ]);

                const user = userRes.data.data;
                const roles = rolesRes.data.data;

                setAvailableRoles(roles || []);
                setIsSuperAdmin(!!user.is_super);
                setFormData({
                    username: user.username,
                    password: '',
                    fullName: user.fullName || user.full_name || '',
                    email: user.email || '',
                    roleIds: user.roles?.map((r: { id: string }) => r.id) || [],
                });
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải thông tin tài khoản');
                router.push(PORTAL_ROUTES.users.list);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.username) {
            toast.error('Username không được để trống');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatePayload: Record<string, unknown> = { ...formData };
            if (!updatePayload.password) delete updatePayload.password;

            await $api.patch(`${API_ROUTES.USERS}/${userId}`, updatePayload);
            toast.success('Cập nhật tài khoản thành công');
            router.push(PORTAL_ROUTES.users.list);
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            const axiosErr = error as { response?: { data?: { error?: string } } };
            const message = axiosErr.response?.data?.error || 'Lỗi khi cập nhật tài khoản';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] space-y-4">
                <Loader2 size={40} className="animate-spin text-brand-primary opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Đang đồng bộ dữ liệu...
                </p>
            </div>
        );
    }

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
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none border-l-4 border-fbbf24 pl-4">
                        Chỉnh sửa tài khoản
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-1.5 text-xs pl-4">
                        Cập nhật thông tin định danh và bảo mật cho quản trị viên.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-3.5 md:p-4 border-l-4 border-l-fbbf24 space-y-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fbbf24/5 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>

                        <div className="space-y-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <UserIcon size={12} className="text-[#002d6b]" /> Username{' '}
                                        <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="VD: NGUYENVANA"
                                        className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-fbbf24/20 rounded-none transition-all"
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
                                        <Lock size={12} className="text-[#002d6b]" /> Mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="ĐỂ TRỐNG NẾU KHÔNG ĐỔI"
                                            className="h-9 bg-slate-50 border-none text-xs font-bold rounded-none focus:ring-2 focus:ring-fbbf24/20 transition-all placeholder:text-[9px] placeholder:italic pr-10"
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
                                    Họ và tên hiển thị
                                </Label>
                                <Input
                                    placeholder="VD: NGUYỄN VĂN A"
                                    className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-fbbf24/20 rounded-none transition-all"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fullName: e.target.value })
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
                                    className="h-9 bg-slate-50 border-none text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-fbbf24/20 rounded-none transition-all"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                            {!isSuperAdmin && (
                                <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                                            Gán vai trò (RBAC)
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {availableRoles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className={cn(
                                                        'p-3 border border-slate-100 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50',
                                                        formData.roleIds.includes(role.id)
                                                            ? 'bg-indigo-50/50 border-indigo-200'
                                                            : 'bg-white',
                                                    )}
                                                    onClick={() => {
                                                        const newRoleIds =
                                                            formData.roleIds.includes(role.id)
                                                                ? formData.roleIds.filter(
                                                                      (id) => id !== role.id,
                                                                  )
                                                                : [...formData.roleIds, role.id];
                                                        setFormData({
                                                            ...formData,
                                                            roleIds: newRoleIds,
                                                        });
                                                    }}
                                                >
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                                                            {role.name}
                                                        </p>
                                                        <p className="text-[9px] text-slate-500 font-medium italic line-clamp-1">
                                                            {role.description}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 ms-3">
                                                        {formData.roleIds.includes(role.id) ? (
                                                            <CheckCircle2
                                                                size={16}
                                                                className="text-indigo-600"
                                                            />
                                                        ) : (
                                                            <Circle
                                                                size={16}
                                                                className="text-slate-200"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-fbbf24/5 border-l-2 border-l-fbbf24 mt-4">
                                        <Shield
                                            size={18}
                                            className="text-[#002d6b] shrink-0 mt-0.5"
                                        />
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#002d6b]">
                                                Lưu ý
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                                Phân quyền dựa trên tất cả các vai trò được gán cho
                                                người dùng này.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full md:w-auto bg-[#002d6b] hover:bg-brand-primary text-[10px] font-black uppercase tracking-[0.2em] px-8 h-10 hover:cursor-pointer transition-all rounded-none hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 size-4" />
                                )}
                                Lưu mọi thay đổi
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5 space-y-6">
                    <div className="p-3.5 md:p-4 bg-slate-50 border border-slate-100 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-l-4 border-l-brand-primary pl-4">
                            Thông tin bổ sung
                        </h3>
                        <div className="space-y-2">
                            {[
                                {
                                    label: 'Trạng thái',
                                    value: 'Đang hoạt động',
                                    color: 'text-emerald-600',
                                },
                                {
                                    label: 'Cấp độ',
                                    value: 'Root Administrator',
                                    color: 'text-brand-primary',
                                },
                                {
                                    label: 'Hệ thống',
                                    value: 'Sài Gòn Valve CMS',
                                    color: 'text-slate-400',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 border-b border-slate-200/50 last:border-none"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {item.label}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-[10px] font-black uppercase tracking-widest',
                                            item.color,
                                        )}
                                    >
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-400 italic font-medium leading-relaxed pt-2 border-t border-slate-200/50">
                            * Việc thay đổi mật khẩu sẽ có hiệu lực ngay trong lần đăng nhập kế tiếp
                            của người dùng này.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
