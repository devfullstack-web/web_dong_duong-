'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { CategoryForm, CategoryFormData } from '@/components/portal/category-form';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddProjectCategoryPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            await $api.post(API_ROUTES.CATEGORIES, { ...data, type: 'project' });
        },
        onSuccess: () => {
            toast.success('Thêm danh mục dự án thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', 'project'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            router.push(PORTAL_ROUTES.cms.projects.categories.list);
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error('Lỗi khi thêm danh mục');
        },
    });

    const handleFormSubmit = async (data: CategoryFormData) => {
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-5 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <Link href={PORTAL_ROUTES.cms.projects.categories.list}>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Thêm danh mục dự án
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xs">
                            Tạo danh mục phân loại dự án mới với chuẩn SEO và phân cấp.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type="project"
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.projects.categories.list}
                />
            </div>
        </div>
    );
}
