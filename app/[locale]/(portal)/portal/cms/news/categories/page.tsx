'use client';

import { useState } from 'react';
import Link from 'next/link';
import $api from '@/utils/axios';
import { Plus, Edit2, Trash2, FolderOpen, Folder, ArrowLeft, ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LocalizedText } from '@/types/i18n';
import { getLocalizedValue } from '@/types/i18n';
import { CATEGORY_TYPE } from '@/constants/content';
import { useLocale, useTranslations } from 'next-intl';
import Loading from '@/components/shared/Loading';

interface Category {
    id: string;
    name: string;
    name_localized?: LocalizedText | null;
    type: string;
    parent_id: string | null;
    display_order: number;
    is_visible: boolean;
    count?: number;
    children?: Category[];
}

function CategoryTreeItem({
    cat,
    level,
    onDelete,
}: {
    cat: Category;
    level: number;
    onDelete: (cat: Category) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = cat.children && cat.children.length > 0;
    const locale = useLocale();
    const displayName = getLocalizedValue(cat.name_localized, locale) || cat.name;

    return (
        <>
            <div
                className="flex items-center justify-between py-2.5 px-4 hover:bg-slate-50/30 transition-colors group border-b border-slate-50"
                style={{ paddingLeft: `${24 + level * 32}px` }}
            >
                <div className="flex items-center gap-3">
                    {hasChildren ? (
                        <button onClick={() => setExpanded(!expanded)} className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <span className="h-6 w-6" />
                    )}
                    <div className="h-8 w-8 flex items-center justify-center bg-brand-primary/5 text-brand-primary">
                        {hasChildren ? <Folder size={16} /> : <FolderOpen size={16} />}
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{displayName}</div>
                        <span className="text-[10px] text-slate-400 font-medium">Thứ tự: {cat.display_order}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none ${cat.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {cat.is_visible ? <><Eye size={10} className="mr-1" /> Hiển thị</> : <><EyeOff size={10} className="mr-1" /> Ẩn</>}
                    </Badge>
                    {cat.count !== undefined && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none">
                            {cat.count} bài viết
                        </Badge>
                    )}
                    <div className="flex items-center gap-1">
                        <Link href={PORTAL_ROUTES.cms.news.categories.edit(cat.id)}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none hover:bg-slate-100">
                                <Edit2 size={14} className="text-slate-400" />
                            </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(cat)} className="h-8 w-8 p-0 rounded-none hover:bg-rose-50">
                            <Trash2 size={14} className="text-rose-500" />
                        </Button>
                    </div>
                </div>
            </div>
            {hasChildren && expanded && cat.children!.map((child) => (
                <CategoryTreeItem key={child.id} cat={child} level={level + 1} onDelete={onDelete} />
            ))}
        </>
    );
}

export default function NewsCategoriesPage() {
    const queryClient = useQueryClient();
    const t = useTranslations('Portal.News');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Category | null>(null);
    const locale = useLocale();

    const { data: categoriesData, isLoading } = useQuery<{ data: Category[] }>({
        queryKey: ['categories', CATEGORY_TYPE.NEWS],
        queryFn: async () => {
            const res = await $api.get(`${API_ROUTES.CATEGORIES}?type=${CATEGORY_TYPE.NEWS}`);
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
            queryClient.invalidateQueries({ queryKey: ['categories', CATEGORY_TYPE.NEWS] });
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.news.list}>
                        <Button variant="outline" className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Danh mục tin tức</h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xs">Quản lý danh mục phân loại bài viết tin tức.</p>
                    </div>
                </div>
                <Link href={PORTAL_ROUTES.cms.news.categories.add}>
                    <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-4 md:px-6 h-10 transition-all rounded-none">
                        <Plus className="mr-2 size-4" /> Thêm danh mục
                    </Button>
                </Link>
            </div>

            <div className="relative bg-white rounded-none border border-slate-100 overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <Loading variant="section" text={t('loadingCategories')} />
                ) : (
                    <>
                        {categories.map((cat) => (
                            <CategoryTreeItem key={cat.id} cat={cat} level={0} onDelete={handleDeleteClick} />
                        ))}
                        {categories.length === 0 && (
                            <div className="p-12 text-center h-[400px] flex items-center justify-center flex-col">
                                <FolderOpen size={48} className="text-slate-100 mb-4" />
                                <p className="text-slate-400 font-medium tracking-tight">Chưa có danh mục nào được tạo.</p>
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
                itemName={itemToDelete ? (getLocalizedValue(itemToDelete.name_localized, locale) || itemToDelete.name) : ''}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
