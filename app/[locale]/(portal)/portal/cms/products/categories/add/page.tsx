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

export default function AddProductCategoryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleFormSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.CATEGORIES, {
                ...data,
                type: 'product',
            });
            toast.success('Thêm danh mục sản phẩm thành công');
            router.push(PORTAL_ROUTES.cms.products.categories.list);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi thêm danh mục');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            Thêm danh mục sản phẩm
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Tạo danh mục phân loại sản phẩm mới với chuẩn SEO và hình ảnh đại diện.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type="product"
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.products.categories.list}
                />
            </div>
        </div>
    );
}
