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

export default function AddNewsCategoryPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            await $api.post(API_ROUTES.CATEGORIES, { ...data, type: 'news' });
        },
        onSuccess: () => {
            toast.success('Thêm danh mục tin tức thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', 'news'] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            router.push(PORTAL_ROUTES.cms.news.categories.list);
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.news.categories.list}>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Thêm danh mục tin tức
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xs">
                            Tạo danh mục phân loại bài viết mới với chuẩn SEO.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type="news"
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.news.categories.list}
                />
            </div>
        </div>
    );
}
