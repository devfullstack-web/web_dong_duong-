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

export default function EditNewsCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState<any>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await $api.get(`${API_ROUTES.CATEGORIES}/${categoryId}`);
                setCategory(res.data.data);
            } catch (error) {
                console.error(error);
                toast.error('Không tìm thấy danh mục');
                router.push(PORTAL_ROUTES.cms.news.categories.list);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId, router]);

    const handleFormSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        try {
            await $api.patch(`${API_ROUTES.CATEGORIES}/${categoryId}`, {
                ...data,
                type: 'news',
            });
            toast.success('Cập nhật danh mục thành công');
            router.push(PORTAL_ROUTES.cms.news.categories.list);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật danh mục');
        } finally {
            setIsSubmitting(false);
        }
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
                <Link href={PORTAL_ROUTES.cms.news.categories.list}>
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
                    <Link href={PORTAL_ROUTES.cms.news.categories.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Sửa danh mục tin tức
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Chỉnh sửa thông tin danh mục và cấu hình SEO.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <CategoryForm
                    type="news"
                    isEditing={true}
                    initialData={category}
                    onSubmit={handleFormSubmit}
                    backUrl={PORTAL_ROUTES.cms.news.categories.list}
                />
            </div>
        </div>
    );
}
