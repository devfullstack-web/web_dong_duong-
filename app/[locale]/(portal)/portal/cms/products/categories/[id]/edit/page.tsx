'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { CategoryForm, CategoryFormData } from '@/components/portal/category-form';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CATEGORY_TYPE } from '@/constants/content';

export default function EditProductCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<CategoryFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            setIsLoading(true);
            try {
                const res = await $api.get(`${API_ROUTES.CATEGORIES}/${categoryId}`);
                setCategory(res.data.data);
            } catch (err: unknown) {
                console.error('Failed to fetch category', err);
                toast.error('Không tìm thấy danh mục hoặc lỗi máy chủ.');
            } finally {
                setIsLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    const updateMutation = useMutation({
        mutationFn: async (data: CategoryFormData) => {
            await $api.patch(`${API_ROUTES.CATEGORIES}/${categoryId}`, data);
        },
        onSuccess: () => {
            toast.success('Cập nhật danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', CATEGORY_TYPE.PRODUCT] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            router.push(PORTAL_ROUTES.cms.products.categories.list);
        },
        onError: (err: unknown) => {
            console.error('Failed to update category', err);
            toast.error(err.response?.data?.error || 'Lỗi khi cập nhật danh mục');
        },
    });

    const handleFormSubmit = async (data: CategoryFormData) => {
        updateMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="mt-4 text-slate-500 font-medium italic animate-pulse">
                    Đang tải dữ liệu danh mục...
                </p>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy danh mục.</p>
                <Link href={PORTAL_ROUTES.cms.products.categories.list}>
                    <Button variant="outline" className="rounded-none">
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.products.categories.list}>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Sửa danh mục sản phẩm
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Chỉnh sửa thông tin danh mục và tối ưu SEO catalog.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <CategoryForm
                    type={CATEGORY_TYPE.PRODUCT}
                    isEditing={true}
                    initialData={category}
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.products.categories.list}
                    editingId={categoryId}
                />
            </div>
        </div>
    );
}
