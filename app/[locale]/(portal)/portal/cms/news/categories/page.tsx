'use client';

import { useState } from 'react';
import Link from 'next/link';
import $api from '@/utils/axios';
import { Plus, Edit2, Trash2, FolderOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Category {
    id: string;
    name: string;
    type: string;
    count?: number; // Optional if we haven't added aggregation yet
}

export default function NewsCategoriesPage() {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Category | null>(null);

    const { data: categoriesData, isLoading } = useQuery<{ data: Category[] }>({
        queryKey: ['categories', 'news'],
        queryFn: async () => {
            const res = await $api.get(`${API_ROUTES.CATEGORIES}?type=news`);
            return res.data;
        },
    });

    const categories = categoriesData?.data || [];

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.CATEGORIES}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', 'news'] });
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        },
        onError: () => {
            toast.error('Lỗi khi xóa danh mục');
        },
    });

    const handleDeleteClick = (cat: Category) => {
        setItemToDelete(cat);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete.id);
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.news.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Danh mục tin tức
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Quản lý danh mục phân loại bài viết tin tức.
                        </p>
                    </div>
                </div>
                <Link href={PORTAL_ROUTES.cms.news.categories.add}>
                    <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-6 h-auto transition-all rounded-none">
                        <Plus className="mr-2 size-4" /> Thêm danh mục
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-none border border-slate-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 size={32} className="animate-spin text-brand-primary opacity-20" />
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-slate-50">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-6 hover:bg-slate-50/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-brand-primary/5 text-brand-primary">
                                            <FolderOpen size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                {cat.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium italic uppercase tracking-wider">
                                                {cat.type}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {cat.count !== undefined && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none"
                                            >
                                                {cat.count} bài viết
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={PORTAL_ROUTES.cms.news.categories.edit(
                                                    cat.id,
                                                )}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-10 w-10 p-0 rounded-none hover:bg-slate-100"
                                                >
                                                    <Edit2 size={16} className="text-slate-400" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(cat)}
                                                className="h-10 w-10 p-0 rounded-none hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} className="text-rose-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {categories.length === 0 && (
                            <div className="p-12 text-center h-[400px] flex items-center justify-center flex-col">
                                <FolderOpen size={48} className="text-slate-100 mb-4" />
                                <p className="text-slate-400 font-medium tracking-tight">
                                    Chưa có danh mục nào được tạo.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Xóa danh mục"
                description="Danh mục sẽ bị xóa. Các bài viết thuộc danh mục này sẽ không còn được phân loại."
                itemName={itemToDelete?.name}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
