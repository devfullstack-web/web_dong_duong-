'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import $api from '@/utils/axios';
import {
    Plus,
    Edit2,
    Trash2,
    FolderOpen,
    Folder,
    ArrowLeft,
    Loader2,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    Star,
    Layers,
    Wind,
    Activity,
    Cpu,
    Building2,
    Disc,
    Wrench,
    Package,
    Boxes,
    Flame,
    ShieldCheck,
    Grid,
    LayoutGrid,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LocalizedText } from '@/types/i18n';
import { getLocalizedValue } from '@/types/i18n';
import { CATEGORY_TYPE } from '@/constants/content';
import { useLocale } from 'next-intl';

const ICON_MAP: Record<string, React.ElementType> = {
    LayoutGrid,
    Layers,
    Sparkles,
    Grid,
    Wind,
    Activity,
    Cpu,
    Building2,
    Wrench,
    Disc,
    Package,
    Boxes,
    Flame,
    ShieldCheck,
};

interface CategoryLocalizedExtra extends LocalizedText {
    subtitle?: string;
    subtitle_en?: string;
    subtitle_zh?: string;
    image_url?: string;
    icon?: string;
}

interface Category {
    id: string;
    name: string;
    name_localized?: CategoryLocalizedExtra | null;
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
    const isCore = cat.display_order > 0 && cat.is_visible;
    const imageUrl = cat.name_localized?.image_url;
    const iconName = cat.name_localized?.icon || 'LayoutGrid';
    const IconComp = ICON_MAP[iconName] || LayoutGrid;
    const subtitle = locale === 'en'
        ? (cat.name_localized?.subtitle_en || cat.name_localized?.subtitle)
        : (cat.name_localized?.subtitle || '');

    return (
        <>
            <div
                className={`flex items-center justify-between py-3 px-4 hover:bg-slate-50/50 transition-colors group border-b border-slate-100 ${
                    isCore ? 'bg-amber-50/20' : ''
                }`}
                style={{ paddingLeft: `${24 + level * 28}px` }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                        >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <span className="h-6 w-6 shrink-0" />
                    )}

                    {/* Thumbnail or Folder Icon */}
                    {imageUrl ? (
                        <div className="relative h-10 w-10 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                            <Image
                                src={imageUrl}
                                alt={displayName}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-9 w-9 flex items-center justify-center bg-brand-primary/5 text-brand-primary shrink-0 border border-brand-primary/10">
                            {hasChildren ? <Folder size={16} /> : <FolderOpen size={16} />}
                        </div>
                    )}

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                                {displayName}
                            </span>
                            {isCore && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none shrink-0">
                                    <Star size={10} className="mr-1 fill-amber-500 text-amber-500" />
                                    Chủ lực #{cat.display_order}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                            {subtitle && (
                                <span className="text-slate-600 font-medium italic truncate max-w-xs">
                                    {subtitle}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                                Thứ tự: {cat.display_order}
                            </span>
                            {isCore && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                                    <IconComp size={11} className="text-amber-500" />
                                    Icon: {iconName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Badge
                        variant="secondary"
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none ${
                            cat.is_visible
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                        {cat.is_visible ? (
                            <><Eye size={10} className="mr-1" /> Hiển thị</>
                        ) : (
                            <><EyeOff size={10} className="mr-1" /> Ẩn</>
                        )}
                    </Badge>
                    {cat.count !== undefined && (
                        <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-none hidden sm:inline-flex"
                        >
                            {cat.count} SP
                        </Badge>
                    )}
                    <div className="flex items-center gap-1">
                        <Link href={PORTAL_ROUTES.cms.products.categories.edit(cat.id)}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-none hover:bg-slate-100 hover:text-brand-primary"
                                title="Sửa danh mục"
                            >
                                <Edit2 size={14} className="text-slate-500" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(cat)}
                            className="h-8 w-8 p-0 rounded-none hover:bg-rose-50 hover:text-rose-600"
                            title="Xóa danh mục"
                        >
                            <Trash2 size={14} className="text-rose-500" />
                        </Button>
                    </div>
                </div>
            </div>
            {hasChildren && expanded &&
                cat.children!.map((child) => (
                    <CategoryTreeItem
                        key={child.id}
                        cat={child}
                        level={level + 1}
                        onDelete={onDelete}
                    />
                ))
            }
        </>
    );
}

// Helper to flatten categories
function flattenAllCategories(cats: Category[]): Category[] {
    const list: Category[] = [];
    function traverse(items: Category[]) {
        for (const item of items) {
            list.push(item);
            if (item.children?.length) {
                traverse(item.children);
            }
        }
    }
    traverse(cats);
    return list;
}

export default function ProductCategoriesPage() {
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Category | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'core'>('all');
    const locale = useLocale();

    const { data: categoriesData, isLoading } = useQuery<{ data: Category[] }>({
        queryKey: ['categories', CATEGORY_TYPE.PRODUCT],
        queryFn: async () => {
            const res = await $api.get(`${API_ROUTES.CATEGORIES}?type=${CATEGORY_TYPE.PRODUCT}&all=true`);
            return res.data;
        },
    });

    const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);

    const allFlatCategories = useMemo(() => flattenAllCategories(categories), [categories]);

    // Core categories: display_order > 0 && is_visible
    const coreCategories = useMemo(() => {
        return allFlatCategories
            .filter((c) => c.display_order > 0 && c.is_visible)
            .sort((a, b) => a.display_order - b.display_order);
    }, [allFlatCategories]);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await $api.delete(`${API_ROUTES.CATEGORIES}/${id}`);
        },
        onSuccess: () => {
            toast.success('Đã xóa danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['categories', CATEGORY_TYPE.PRODUCT] });
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
                <div className="flex items-center gap-4">
                    <Link href={PORTAL_ROUTES.cms.products.list}>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 border-slate-200 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Danh mục sản phẩm
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xs md:text-sm">
                            Quản lý cây danh mục sản phẩm catalog và cấu hình &ldquo;Danh mục sản phẩm chủ lực&rdquo; hiển thị ngoài Trang chủ.
                        </p>
                    </div>
                </div>
                <Link href={PORTAL_ROUTES.cms.products.categories.add}>
                    <Button className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest h-10 px-4 md:px-6 transition-all rounded-none">
                        <Plus className="mr-2 size-4" /> Thêm danh mục
                    </Button>
                </Link>
            </div>

            {/* Core Categories Banner Guide */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Star className="size-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Danh mục sản phẩm chủ lực (Trang chủ)
                        </span>
                        <Badge className="bg-amber-500 text-white font-black text-[9px] px-2 py-0.2 rounded-none">
                            {coreCategories.length} danh mục đang hiển thị
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Các danh mục có <strong>Thứ tự hiển thị &gt; 0</strong> và <strong>Trạng thái Hiển thị</strong> sẽ tự động xuất hiện trên khối slider &ldquo;Danh mục sản phẩm chủ lực&rdquo; ngoài Trang chủ. Bạn có thể nhấn icon <strong>Sửa</strong> để thay đổi hình ảnh, icon biểu tượng, tiêu đề phụ và số thứ tự hiển thị.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'core')}>
                        <TabsList className="bg-slate-100 p-1 rounded-none border border-slate-200">
                            <TabsTrigger
                                value="all"
                                className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none data-[state=active]:bg-white data-[state=active]:text-brand-primary"
                            >
                                Tất cả ({allFlatCategories.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="core"
                                className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-none data-[state=active]:bg-amber-500 data-[state=active]:text-white flex items-center gap-1"
                            >
                                <Star size={12} className="fill-current" />
                                Sản phẩm chủ lực ({coreCategories.length})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="bg-white rounded-none border border-slate-100 overflow-hidden min-h-100 shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center h-100">
                        <Loader2 size={32} className="animate-spin text-brand-primary opacity-20" />
                    </div>
                ) : activeTab === 'core' ? (
                    /* Core Categories View (Sorted by display_order) */
                    <div>
                        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 flex justify-between items-center">
                            <span>Danh sách hiển thị theo thứ tự trên slider Trang chủ (từ trái sang phải)</span>
                            <span>{coreCategories.length} mục</span>
                        </div>
                        {coreCategories.length === 0 ? (
                            <div className="p-12 text-center h-100 flex items-center justify-center flex-col">
                                <Star size={48} className="text-amber-200 mb-4" />
                                <p className="text-slate-600 font-bold tracking-tight">
                                    Chưa có danh mục nào được đặt làm Sản phẩm Chủ lực.
                                </p>
                                <p className="text-slate-400 text-xs mt-1">
                                    Hãy sửa một danh mục và bật tùy chọn &ldquo;Đặt làm Sản phẩm Chủ lực trên Trang chủ&rdquo;.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {coreCategories.map((cat, index) => {
                                    const displayName = getLocalizedValue(cat.name_localized, locale) || cat.name;
                                    const subtitle = locale === 'en'
                                        ? (cat.name_localized?.subtitle_en || cat.name_localized?.subtitle)
                                        : (cat.name_localized?.subtitle || '');
                                    const imageUrl = cat.name_localized?.image_url;
                                    const iconName = cat.name_localized?.icon || 'LayoutGrid';
                                    const IconComp = ICON_MAP[iconName] || LayoutGrid;

                                    return (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between p-4 hover:bg-amber-50/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                                                    #{cat.display_order || index + 1}
                                                </div>

                                                {imageUrl ? (
                                                    <div className="relative h-14 w-20 rounded border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                                                        <Image
                                                            src={imageUrl}
                                                            alt={displayName}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-14 w-20 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-[10px] shrink-0">
                                                        Không ảnh
                                                    </div>
                                                )}

                                                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D49B45] shrink-0">
                                                    <IconComp size={18} />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                                                        {displayName}
                                                    </div>
                                                    <div className="text-xs text-slate-600 font-medium truncate mt-0.5">
                                                        {subtitle || 'Chưa có tiêu đề phụ'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        Biểu tượng: {iconName} • Thứ tự slider: #{cat.display_order}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link href={PORTAL_ROUTES.cms.products.categories.edit(cat.id)}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[10px] font-black uppercase tracking-wider h-8 px-3 border-slate-200 hover:bg-slate-50 hover:text-brand-primary rounded-none"
                                                    >
                                                        <Edit2 size={12} className="mr-1.5" /> Sửa thông tin chủ lực
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* All Categories Tree View */
                    <>
                        {categories.map((cat) => (
                            <CategoryTreeItem
                                key={cat.id}
                                cat={cat}
                                level={0}
                                onDelete={handleDeleteClick}
                            />
                        ))}

                        {categories.length === 0 && (
                            <div className="p-12 text-center h-100 flex items-center justify-center flex-col">
                                <FolderOpen size={48} className="text-slate-100 mb-4" />
                                <p className="text-slate-400 font-medium tracking-tight">
                                    Chưa có danh mục sản phẩm nào được tạo.
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
                description="Danh mục sẽ bị xóa. Các sản phẩm thuộc danh mục này sẽ không còn được phân loại."
                itemName={itemToDelete ? (getLocalizedValue(itemToDelete.name_localized, locale) || itemToDelete.name) : ''}
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
