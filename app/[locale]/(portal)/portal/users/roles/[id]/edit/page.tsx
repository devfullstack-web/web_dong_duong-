'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RoleForm } from '@/components/portal/role-form';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { Role } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditRolePage() {
    const params = useParams();
    const roleId = params.id as string;
    const [role, setRole] = React.useState<Role | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await $api.get(`${API_ROUTES.ROLES}/${roleId}`);
                setRole(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải thông tin vai trò');
            } finally {
                setIsLoading(false);
            }
        };

        if (roleId) {
            fetchRole();
        }
    }, [roleId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-40">
                <Loader2 className="animate-spin text-brand-primary opacity-20" size={48} />
            </div>
        );
    }

    if (!role) {
        return (
            <div className="p-20 text-center">
                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">
                    Không tìm thấy vai trò
                </p>
            </div>
        );
    }

    return <RoleForm initialData={role} isEditing />;
}
