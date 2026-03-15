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

export default function EditProductCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<CategoryFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            setIsLoading(true);
            try {
                const res = await $api.get(`${API_ROUTES.CATEGORIES}/${categoryId}`);
                setCategory(res.data.data);
            } catch (err: any) {
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

    const handleFormSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            await $api.patch(`${API_ROUTES.CATEGORIES}/${categoryId}`, data);
            toast.success('Cập nhật danh mục thành công');
            router.push(PORTAL_ROUTES.cms.products.categories.list);
        } catch (err: any) {
            console.error('Failed to update category', err);
            toast.error(err.response?.data?.error || 'Lỗi khi cập nhật danh mục');
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.products.categories.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Sửa danh mục sản phẩm
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Chỉnh sửa thông tin danh mục và tối ưu SEO catalog.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type="product"
                    isEditing={true}
                    initialData={category}
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.products.categories.list}
                />
            </div>
        </div>
    );
}
