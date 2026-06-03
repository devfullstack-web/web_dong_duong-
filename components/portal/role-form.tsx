'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import $api from '@/utils/axios';
import { ArrowLeft, Save, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { Role } from '@/types';
import { cn } from '@/lib/utils';

interface SystemPermission {
    code: string;
    name: string;
    module: string;
    action: string;
    description: string;
}

interface RoleFormProps {
    initialData?: Role;
    isEditing?: boolean;
}

export function RoleForm({ initialData, isEditing = false }: RoleFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoadingMatrix, setIsLoadingMatrix] = React.useState(true);
    
    // Flat permission codes state
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
    const [allPermissions, setAllPermissions] = React.useState<SystemPermission[]>([]);

    const [formData, setFormData] = React.useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || '',
    });

    const fetchMatrix = React.useCallback(async () => {
        setIsLoadingMatrix(true);
        try {
            const url = initialData?.id
                ? `${API_ROUTES.PERMISSIONS}?roleId=${initialData.id}`
                : API_ROUTES.PERMISSIONS;
            const res = await $api.get(url);
            setAllPermissions(res.data.data.allPermissions || []);
            setSelectedPermissions(res.data.data.assignedPermissions || []);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách quyền hạn');
        } finally {
            setIsLoadingMatrix(false);
        }
    }, [initialData?.id]);

    React.useEffect(() => {
        fetchMatrix();
    }, [fetchMatrix]);

    // Map module code to friendly name
    const getModuleFriendlyName = (moduleCode: string): string => {
        const mapping: Record<string, string> = {
            dashboard: 'Bảng điều khiển',
            product: 'Quản lý Sản phẩm',
            news: 'Quản lý Tin tức',
            project: 'Quản lý Dự án',
            recruitment: 'Quản lý Tuyển dụng',
            application: 'Danh sách Ứng viên',
            comment: 'Quản lý Bình luận',
            file: 'Thư viện Media',
            contact: 'Quản lý Liên hệ',
            user: 'Quản lý Tài khoản',
            role: 'Phân quyền & Vai trò',
            audit_log: 'Nhật ký hệ thống',
            setting: 'Cài đặt hệ thống',
        };
        return mapping[moduleCode] || moduleCode;
    };

    // Group permissions by module
    const groupedPermissions = React.useMemo(() => {
        const groups: Record<string, { moduleName: string; permissions: SystemPermission[] }> = {};
        
        allPermissions.forEach((p) => {
            const moduleCode = p.module;
            if (!groups[moduleCode]) {
                groups[moduleCode] = {
                    moduleName: getModuleFriendlyName(moduleCode),
                    permissions: []
                };
            }
            groups[moduleCode].permissions.push(p);
        });
        
        return Object.entries(groups).map(([id, g]) => ({
            id,
            moduleName: g.moduleName,
            permissions: g.permissions
        }));
    }, [allPermissions]);

    // Helper to get permission code based on module and action field
    const getPermissionCode = (moduleCode: string, actionField: string): string => {
        const suffix = actionField === 'view' ? '.view' :
                       actionField === 'create' ? (moduleCode === 'file' ? '.upload' : '.create') :
                       actionField === 'update' ? (moduleCode === 'role' ? '.assign_permission' : '.update') :
                       '.delete';
        return `${moduleCode}${suffix}`;
    };

    const togglePermission = (moduleCode: string, actionField: string) => {
        const code = getPermissionCode(moduleCode, actionField);
        setSelectedPermissions((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
        );
    };

    const toggleModuleAll = (moduleCode: string) => {
        const moduleCodes = allPermissions.filter((p) => p.module === moduleCode).map((p) => p.code);
        const allSet = moduleCodes.every((c) => selectedPermissions.includes(c));
        
        setSelectedPermissions((prev) =>
            allSet ? prev.filter((c) => !moduleCodes.includes(c)) : [...new Set([...prev, ...moduleCodes])]
        );
    };

    const toggleColumn = (actionField: string) => {
        const colCodes = groupedPermissions
            .map((g) => getPermissionCode(g.id, actionField))
            .filter((code) => allPermissions.some((p) => p.code === code));
        
        const allSet = colCodes.every((c) => selectedPermissions.includes(c));
        
        setSelectedPermissions((prev) =>
            allSet ? prev.filter((c) => !colCodes.includes(c)) : [...new Set([...prev, ...colCodes])]
        );
    };

    const toggleGlobal = () => {
        const allCodes = allPermissions.map((p) => p.code);
        const allSet = allCodes.every((c) => selectedPermissions.includes(c));
        
        setSelectedPermissions(allSet ? [] : allCodes);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Vui lòng nhập tên vai trò');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                permissions: selectedPermissions,
            };

            if (isEditing && initialData) {
                await $api.patch(`${API_ROUTES.ROLES}/${initialData.id}`, payload);
                toast.success('Cập nhật vai trò thành công');
            } else {
                await $api.post(API_ROUTES.ROLES, payload);
                toast.success('Tạo vai trò mới thành công');
            }

            router.push(PORTAL_ROUTES.users.roles.list);
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { error?: string } } };
            const message = err.response?.data?.error || 'Lỗi khi lưu vai trò';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSuperRole = !!initialData?.is_super;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={PORTAL_ROUTES.users.roles.list}>
                        <Button
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-full hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center"
                        >
                            <ArrowLeft size={18} className="text-slate-600" />
                        </Button>
                    </Link>
                    <div className="space-y-1.5">
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-4 border-[#002d6b] pl-4 leading-none">
                            {isEditing ? 'Cấu hình vai trò' : 'Tạo vai trò mới'}
                        </h2>
                        <p className="text-slate-500 font-medium italic text-xs pl-4 leading-relaxed">
                            {isEditing
                                ? `Chỉnh sửa: ${initialData?.name}`
                                : 'Định nghĩa nhóm quyền hạn mới cho hệ thống.'}
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    className="bg-[#002d6b] hover:bg-[#002d6b]/90 text-[10px] font-black uppercase tracking-[0.2em] px-6 hover:cursor-pointer h-10 shadow-lg transition-all rounded-none hover:-translate-y-0.5 active:scale-95 border-b-4 border-b-brand-secondary flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {isEditing ? 'Lưu thay đổi' : 'Tạo vai trò'}
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-12">
                {/* Left Column: Role Information */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white p-8 border border-slate-100 shadow-sm rounded-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary mb-8 flex items-center gap-2">
                            <Shield size={14} /> Thông tin vai trò
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Tên vai trò <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    placeholder="VD: QUẢN TRỊ VIÊN"
                                    className="h-12 bg-slate-50 border-slate-100 text-sm font-semibold focus:ring-1 focus:ring-brand-primary/20 rounded-none"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value.toUpperCase(),
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Mã code
                                </Label>
                                <Input
                                    placeholder="VD: ADMIN"
                                    className="h-12 bg-slate-50 border-slate-100 text-sm font-mono focus:ring-1 focus:ring-brand-primary/20 rounded-none"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            code: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                                        })
                                    }
                                    disabled={isSubmitting || isEditing}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Mô tả
                                </Label>
                                <Textarea
                                    placeholder="Mô tả chức năng của vai trò này..."
                                    className="h-32 bg-slate-50 border-slate-100 text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20 transition-all resize-none"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Permission Matrix */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white p-8 border border-slate-100 shadow-sm rounded-sm overflow-x-auto">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary mb-8">
                            Ma trận quyền hạn
                        </h3>

                        {isLoadingMatrix ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2
                                    className="animate-spin text-amber-500 opacity-20"
                                    size={32}
                                />
                            </div>
                        ) : (
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-4 w-12 text-center text-slate-400">
                                            <Checkbox
                                                checked={
                                                    isSuperRole ||
                                                    (allPermissions.length > 0 &&
                                                        allPermissions.every((p) =>
                                                            selectedPermissions.includes(p.code)
                                                        ))
                                                }
                                                onCheckedChange={() =>
                                                    !isSuperRole && toggleGlobal()
                                                }
                                                disabled={isSuperRole}
                                                className="mx-auto border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-none"
                                            />
                                        </th>
                                        <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Module
                                        </th>
                                        {[
                                            { label: 'Xem', field: 'view' },
                                            { label: 'Tạo', field: 'create' },
                                            { label: 'Sửa', field: 'update' },
                                            { label: 'Xóa', field: 'delete' },
                                        ].map((col) => {
                                            const colCodes = groupedPermissions
                                                .map((g) => getPermissionCode(g.id, col.field))
                                                .filter((code) => allPermissions.some((p) => p.code === code));
                                            
                                            const isColChecked =
                                                isSuperRole ||
                                                (colCodes.length > 0 &&
                                                    colCodes.every((c) => selectedPermissions.includes(c)));

                                            return (
                                                <th key={col.field} className="pb-4 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Checkbox
                                                            checked={isColChecked}
                                                            onCheckedChange={() =>
                                                                !isSuperRole && toggleColumn(col.field)
                                                            }
                                                            disabled={isSuperRole}
                                                            className="border-slate-300 data-[state=checked]:bg-amber-500  data-[state=checked]:border-amber-500 rounded-none"
                                                        />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                            {col.label}
                                                        </span>
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {groupedPermissions.map((group) => {
                                        const moduleCodes = group.permissions.map((p) => p.code);
                                        const rowAllSet =
                                            moduleCodes.length > 0 &&
                                            moduleCodes.every((c) => selectedPermissions.includes(c));
                                        
                                        return (
                                            <tr
                                                key={group.id}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="py-4 text-center">
                                                    <Checkbox
                                                        checked={isSuperRole || rowAllSet}
                                                        onCheckedChange={() =>
                                                            !isSuperRole &&
                                                            toggleModuleAll(group.id)
                                                        }
                                                        disabled={isSuperRole}
                                                        className="mx-auto border-slate-200 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-none"
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-colors">
                                                            <Shield size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                                                                {group.moduleName}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">
                                                                {group.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {[
                                                    {
                                                        field: 'view',
                                                        color: 'data-[state=checked]:bg-amber-500',
                                                    },
                                                    {
                                                        field: 'create',
                                                        color: 'data-[state=checked]:bg-amber-500',
                                                    },
                                                    {
                                                        field: 'update',
                                                        color: 'data-[state=checked]:bg-amber-500',
                                                    },
                                                    {
                                                        field: 'delete',
                                                        color: 'data-[state=checked]:bg-amber-500',
                                                    },
                                                ].map(({ field, color }) => {
                                                    const code = getPermissionCode(group.id, field);
                                                    const hasThisPermission = allPermissions.some((p) => p.code === code);
                                                    const isChecked = isSuperRole || selectedPermissions.includes(code);

                                                    return (
                                                        <td key={field} className="py-4 text-center">
                                                            {hasThisPermission ? (
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onCheckedChange={() =>
                                                                        !isSuperRole &&
                                                                        togglePermission(group.id, field)
                                                                    }
                                                                    disabled={isSuperRole}
                                                                    className={cn(
                                                                        'size-5 mx-auto border-slate-200 rounded-none transition-all',
                                                                        color,
                                                                        'data-[state=checked]:border-amber-500 shadow-sm',
                                                                    )}
                                                                />
                                                            ) : (
                                                                <span className="text-[9px] text-slate-300 font-semibold italic">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
