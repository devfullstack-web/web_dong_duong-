'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { CategoryForm, CategoryFormData } from '@/components/portal/category-form';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATEGORY_TYPE } from '@/constants/content';

export default function EditProjectCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const categoryId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await $api.get(`${API_ROUTES.CATEGORIES}/${categoryId}`);
                setCategory(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error('Không tìm thấy danh mục');
                router.push(PORTAL_ROUTES.cms.projects.categories.list);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId, router]);

    const updateMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            await $api.patch(`${API_ROUTES.CATEGORIES}/${categoryId}`, {
                ...data,
                type: CATEGORY_TYPE.PROJECT,
            });
        },
        onSuccess: () => {
            toast.success('Cập nhật danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', CATEGORY_TYPE.PROJECT] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            router.push(PORTAL_ROUTES.cms.projects.categories.list);
        },
        onError: (error: unknown) => {
            console.error(error);
            toast.error('Lỗi khi cập nhật danh mục');
        },
    });

    const handleFormSubmit = async (data: CategoryFormData) => {
        updateMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-brand-primary opacity-20" />
            </div>
        );
    }
    if (!category && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy danh mục.</p>
                <Link href={PORTAL_ROUTES.cms.projects.categories.list}>
                    <Button variant="outline" className="rounded-none">
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>
        );
    }

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
                            Sửa danh mục dự án
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xs">
                            Chỉnh sửa thông tin danh mục và cấu hình hiển thị.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type={CATEGORY_TYPE.PROJECT}
                    isEditing={true}
                    initialData={category}
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.projects.categories.list}
                    editingId={categoryId}
                />
            </div>
        </div>
    );
}
