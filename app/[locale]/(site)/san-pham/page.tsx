'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { LayoutGrid, List, ArrowRight, Shield, Info, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageBanner } from '@/components/site/PageBanner';
import TechSvgBackground from '@/components/ui/TechSvgBackground';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { getLocalizedValue } from '@/types/i18n';
import type { LocalizedText, Locale } from '@/types/i18n';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SitePagination } from '@/components/site/SitePagination';
import { CATEGORY_TYPE, PRODUCT_STATUS } from '@/constants/content';

interface Product {
    id: string;
    name: string;
    name_localized?: LocalizedText | null;
    slug: string;
    category: string;
    category_localized?: LocalizedText | null;
    image_url: string | null;
    tech_summary: string | null;
    tech_summary_localized?: LocalizedText | null;
    price: string;
    status: string;
}

interface Category {
    id: string;
    name: string;
    name_localized?: LocalizedText | null;
    parent_id?: string | null;
    is_visible?: boolean;
    children?: Category[];
}

const ITEMS_PER_PAGE = 12;

export default function ProductArchive() {
    const t = useTranslations('Products');
    const locale = useLocale() as Locale;
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'name-desc'>('default');

    const productParams = useMemo(
        () => ({
            status: PRODUCT_STATUS.ACTIVE,
            search: debouncedSearch || undefined,
            categoryId: selectedCategoryId || undefined,
        }),
        [debouncedSearch, selectedCategoryId],
    );

    const {
        items: products,
        isLoading: productsLoading,
        currentPage,
        setCurrentPage,
        totalPages,
        total,
        handlePageChange,
    } = usePaginatedApiQuery<Product>({
        endpoint: API_ROUTES.PRODUCTS,
        queryKey: ['products', productParams],
        pageSize: ITEMS_PER_PAGE,
        params: productParams,
    });

    // Reset to page 1 when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCategoryId, setCurrentPage]);

    // Fetch categories using react-query
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories', CATEGORY_TYPE.PRODUCT],
        queryFn: async () => {
            const response = await $api.get(
                `${API_ROUTES.CATEGORIES}?type=${CATEGORY_TYPE.PRODUCT}`,
            );
            if (response.data.success) {
                return response.data.data || [];
            }
            throw new Error('Failed to fetch categories');
        },
        staleTime: 5 * 60 * 1000, // Categories don't change often
    });

    const sortedProducts = useMemo(() => {
        const items = [...products];
        if (sortBy === 'name-asc') {
            return items.sort((a, b) => {
                const nameA = getLocalizedValue(a.name_localized, locale) || a.name;
                const nameB = getLocalizedValue(b.name_localized, locale) || b.name;
                return nameA.localeCompare(nameB, locale);
            });
        }
        if (sortBy === 'name-desc') {
            return items.sort((a, b) => {
                const nameA = getLocalizedValue(a.name_localized, locale) || a.name;
                const nameB = getLocalizedValue(b.name_localized, locale) || b.name;
                return nameB.localeCompare(nameA, locale);
            });
        }
        return items;
    }, [products, sortBy, locale]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
    };

    const toggleCategoryExpansion = (categoryId: string) => {
        setExpandedCategoryIds((prevExpanded) =>
            prevExpanded.includes(categoryId)
                ? prevExpanded.filter((id) => id !== categoryId)
                : [...prevExpanded, categoryId],
        );
    };

    const handleAllCategoriesClick = () => {
        handleCategoryChange(null);
        setExpandedCategoryIds([]);
    };

    const handleParentCategoryClick = (category: Category) => {
        const visibleChildren =
            category.children?.filter((child) => child.is_visible !== false) || [];

        handleCategoryChange(category.id);

        if (visibleChildren.length > 0) {
            toggleCategoryExpansion(category.id);
        }
    };

    const handleChildCategoryClick = (parentId: string, childId: string) => {
        handleCategoryChange(childId);
        setExpandedCategoryIds((prevExpanded) =>
            prevExpanded.includes(parentId) ? prevExpanded : [...prevExpanded, parentId],
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Main Content */}
            <section className="relative py-8 overflow-hidden">
                {/* Tech Matrix Vector Grid Background */}
                <TechSvgBackground variant="ecommerce-grid" glowColor="cyan" className="absolute inset-0 z-0" />

                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-16">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="lg:sticky lg:top-32 space-y-6 lg:space-y-8">
                                {/* Search Box */}
                                <div className="space-y-3 pb-6 border-b border-slate-100">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-secondary">
                                        {locale === 'vi' ? 'Tìm kiếm sản phẩm' : locale === 'zh' ? '搜索产品' : 'Search Products'}
                                    </h4>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={
                                                locale === 'vi'
                                                    ? 'Nhập tên sản phẩm...'
                                                    : locale === 'zh'
                                                      ? '输入产品名称...'
                                                      : 'Enter product name...'
                                            }
                                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white text-xs font-medium outline-none transition-all duration-300 rounded-none focus:ring-1 focus:ring-brand-primary"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                            <Search size={14} />
                                        </span>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 lg:space-y-6">
                                    {/* Mobile Collapsible Category Selector Button */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="w-full bg-brand-primary text-white py-3.5 px-5 flex items-center justify-between uppercase tracking-wider text-xs sm:text-sm font-black lg:hidden rounded-none shadow-md"
                                    >
                                        <span className="flex items-center gap-2">
                                            {t('sidebar.categoryTitle')}:{' '}
                                            <span className="text-brand-accent font-black">
                                                {selectedCategoryId === null
                                                    ? t('sidebar.all')
                                                    : categories.find(
                                                            (c) => c.id === selectedCategoryId,
                                                        )
                                                      ? getLocalizedValue(
                                                            categories.find(
                                                                (c) => c.id === selectedCategoryId,
                                                            )?.name_localized,
                                                            locale,
                                                        ) ||
                                                        categories.find(
                                                            (c) => c.id === selectedCategoryId,
                                                        )?.name
                                                      : getLocalizedValue(
                                                            categories
                                                                .flatMap((c) => c.children || [])
                                                                .find(
                                                                    (c) =>
                                                                        c.id === selectedCategoryId,
                                                                )?.name_localized,
                                                            locale,
                                                        ) ||
                                                        categories
                                                            .flatMap((c) => c.children || [])
                                                            .find(
                                                                (c) => c.id === selectedCategoryId,
                                                            )?.name}
                                            </span>
                                        </span>
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                'transition-transform duration-300',
                                                isMobileMenuOpen && 'rotate-180',
                                            )}
                                        />
                                    </button>

                                    {/* Categories Dropdown Container */}
                                    <div
                                        className={cn(
                                            'lg:block transition-all duration-300',
                                            isMobileMenuOpen
                                                ? 'block animate-fadeIn'
                                                : 'hidden lg:block',
                                        )}
                                    >
                                        <h4 className="hidden lg:flex items-center justify-between text-sm font-black uppercase tracking-wider text-brand-secondary border-b border-slate-200 pb-3 mb-4">
                                            <span>{t('sidebar.categoryTitle')}</span>
                                            {selectedCategoryId && (
                                                <button
                                                    onClick={handleAllCategoriesClick}
                                                    className="text-xs sm:text-sm font-bold text-brand-primary lowercase hover:underline hover:cursor-pointer normal-case tracking-wide"
                                                >
                                                    {locale === 'vi' ? '[Bỏ lọc]' : locale === 'zh' ? '[清除筛选]' : '[Clear]'}
                                                </button>
                                            )}
                                        </h4>

                                        <div className="flex flex-col gap-1.5">
                                            {/* "Tất cả" button */}
                                            <button
                                                onClick={() => {
                                                    handleAllCategoriesClick();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={cn(
                                                    'w-full px-3.5 py-2.5 text-left text-sm sm:text-base font-bold uppercase tracking-wider transition-all hover:cursor-pointer border-l-2 flex items-center justify-between',
                                                    selectedCategoryId === null
                                                        ? 'text-brand-primary border-brand-primary bg-slate-50 font-black'
                                                        : 'text-slate-700 hover:text-brand-primary hover:bg-slate-50/50 border-transparent',
                                                )}
                                            >
                                                <span>{t('sidebar.all')}</span>
                                                <span className="text-xs sm:text-sm opacity-80 font-bold">
                                                    ({total})
                                                </span>
                                            </button>

                                            {categories
                                                .filter((cat) => cat.is_visible !== false)
                                                .map((cat) => {
                                                    const visibleChildren =
                                                        cat.children?.filter(
                                                            (child) => child.is_visible !== false,
                                                        ) || [];
                                                    const hasChildren = visibleChildren.length > 0;
                                                    const isExpanded = expandedCategoryIds.includes(
                                                        cat.id,
                                                    );
                                                    const isCurrent = selectedCategoryId === cat.id;

                                                    return (
                                                        <div
                                                            key={cat.id}
                                                            className="flex flex-col gap-0.5"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleParentCategoryClick(cat)
                                                                }
                                                                className={cn(
                                                                    'w-full px-3.5 py-2.5 text-left text-sm sm:text-base font-bold uppercase tracking-wide transition-all hover:cursor-pointer border-l-2 flex items-center justify-between gap-2',
                                                                    isCurrent
                                                                        ? 'text-brand-primary border-brand-primary bg-slate-50 font-black'
                                                                        : 'text-slate-700 hover:text-brand-primary hover:bg-slate-50/50 border-transparent',
                                                                )}
                                                            >
                                                                <span>
                                                                    {getLocalizedValue(
                                                                        cat.name_localized,
                                                                        locale,
                                                                    ) || cat.name}
                                                                </span>
                                                                {hasChildren && (
                                                                    <ChevronDown
                                                                        size={14}
                                                                        className={cn(
                                                                            'shrink-0 transition-transform duration-200 opacity-70',
                                                                            isExpanded &&
                                                                                'rotate-180 opacity-100 text-brand-primary',
                                                                        )}
                                                                    />
                                                                )}
                                                            </button>

                                                            {hasChildren && isExpanded && (
                                                                <div className="flex flex-col gap-1 pl-3 border-l border-slate-200 py-1 ml-3 my-1 animate-fadeIn">
                                                                    {visibleChildren.map(
                                                                        (child) => (
                                                                            <button
                                                                                key={child.id}
                                                                                onClick={() => {
                                                                                    handleChildCategoryClick(
                                                                                        cat.id,
                                                                                        child.id,
                                                                                    );
                                                                                    setIsMobileMenuOpen(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className={cn(
                                                                                    'w-full px-3 py-2 text-left text-xs sm:text-sm font-bold uppercase tracking-wider transition-all hover:cursor-pointer border-l-2',
                                                                                    selectedCategoryId ===
                                                                                        child.id
                                                                                        ? 'text-brand-secondary border-brand-secondary bg-slate-100/50 font-black'
                                                                                        : 'text-slate-600 hover:text-brand-primary hover:bg-slate-50/30 border-transparent',
                                                                                )}
                                                                            >
                                                                                {getLocalizedValue(
                                                                                    child.name_localized,
                                                                                    locale,
                                                                                ) || child.name}
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Grid */}
                        <div className="flex-1 space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider italic">
                                    {t('grid.resultCount', {
                                        start: products.length > 0 ? startIndex + 1 : 0,
                                        end: Math.min(startIndex + ITEMS_PER_PAGE, total),
                                        total: total,
                                    })}
                                </div>
                                <div className="flex items-center gap-4 md:gap-6">
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                                            {locale === 'vi' ? 'Sắp xếp:' : locale === 'zh' ? '排序方式:' : 'Sort by:'}
                                        </span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(
                                                    e.target.value as
                                                        | 'default'
                                                        | 'name-asc'
                                                        | 'name-desc',
                                                )
                                            }
                                            className="bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 outline-none focus:border-brand-primary transition-colors rounded-none hover:cursor-pointer"
                                        >
                                            <option value="default">
                                                {locale === 'vi' ? 'Mặc định' : locale === 'zh' ? '默认排序' : 'Default'}
                                            </option>
                                            <option value="name-asc">
                                                {locale === 'vi' ? 'Tên: A - Z' : locale === 'zh' ? '名称: A - Z' : 'Name: A - Z'}
                                            </option>
                                            <option value="name-desc">
                                                {locale === 'vi' ? 'Tên: Z - A' : locale === 'zh' ? '名称: Z - A' : 'Name: Z - A'}
                                            </option>
                                        </select>
                                    </div>

                                    <div className="flex border border-slate-100 ">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={cn(
                                                'p-2 transition-colors',
                                                viewMode === 'grid'
                                                    ? 'bg-slate-100 text-brand-primary'
                                                    : 'text-slate-300 hover:text-brand-primary',
                                            )}
                                        >
                                            <LayoutGrid
                                                size={16}
                                                className="hover:cursor-pointer"
                                            />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={cn(
                                                'p-2 transition-colors',
                                                viewMode === 'list'
                                                    ? 'bg-slate-100 text-brand-primary'
                                                    : 'text-slate-300 hover:text-brand-primary',
                                            )}
                                        >
                                            <List size={16} className="hover:cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Empty State */}
                            {!productsLoading && products.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-slate-200">
                                    <Info size={32} className="text-slate-300" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                            {locale === 'vi'
                                                ? 'Không tìm thấy sản phẩm'
                                                : locale === 'zh'
                                                  ? '未找到相关产品'
                                                  : 'No products found'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                            {locale === 'vi'
                                                ? 'Vui lòng thử lại với từ khóa khác hoặc bộ lọc khác.'
                                                : locale === 'zh'
                                                  ? '请尝试使用其他关键词或筛选条件。'
                                                  : 'Please try again with a different search query or filter.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Grid View */}
                            {viewMode === 'grid' &&
                                (productsLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="bg-slate-50/50 border border-slate-100 p-4 space-y-4 flex flex-col justify-between h-[320px] rounded-none"
                                            >
                                                <div className="w-full aspect-square bg-slate-200/50 rounded-none" />
                                                <div className="space-y-3 flex-1 flex flex-col justify-between pt-4">
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-1/3 bg-slate-200 rounded-none" />
                                                        <div className="h-4 w-3/4 bg-slate-200 rounded-none" />
                                                        <div className="h-3 w-5/6 bg-slate-200 rounded-none" />
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-200/40 mt-4 rounded-none" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    products.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {sortedProducts.map((product, i) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="group bg-white p-4 space-y-4 flex flex-col justify-between hover:z-10 hover:border-brand-accent transition-all duration-500 h-full border border-slate-100 rounded-none relative pt-6"
                                                >
                                                    {/* Animated top accent bar */}
                                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                                    <div className="relative aspect-square w-full overflow-hidden transition-all duration-500 bg-slate-50/50 rounded-none border border-slate-100/60">
                                                        <Image
                                                            src={
                                                                product.image_url ||
                                                                'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                            }
                                                            alt={
                                                                getLocalizedValue(
                                                                    product.name_localized,
                                                                    locale,
                                                                ) || product.name
                                                            }
                                                            fill
                                                            unoptimized
                                                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                                                        <div className="space-y-1.5">
                                                            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                                                                <Shield size={14} />{' '}
                                                                {getLocalizedValue(
                                                                    product.category_localized,
                                                                    locale,
                                                                ) || product.category}
                                                            </div>
                                                            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-2 uppercase min-h-[2.5rem]">
                                                                {getLocalizedValue(
                                                                    product.name_localized,
                                                                    locale,
                                                                ) || product.name}
                                                            </h3>

                                                            {/* Price Highlight for Seniors & Shoppers */}
                                                            {product.price && Number(product.price) > 0 ? (
                                                                <div className="text-base sm:text-lg font-black text-[#D49B45] pt-0.5">
                                                                    {new Intl.NumberFormat('vi-VN').format(Number(product.price))} đ
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm sm:text-base font-bold text-amber-700/80 pt-0.5">
                                                                    {locale === 'vi' ? 'Liên hệ báo giá' : locale === 'zh' ? '联系获取底价' : 'Contact for quote'}
                                                                </div>
                                                            )}

                                                            <p className="text-sm sm:text-base text-slate-700 font-medium line-clamp-2 leading-relaxed">
                                                                {getLocalizedValue(
                                                                    product.tech_summary_localized,
                                                                    locale,
                                                                ) ||
                                                                    product.tech_summary ||
                                                                    t('grid.defaultSummary')}
                                                            </p>
                                                        </div>
                                                        <LocalizedLink
                                                            href={`/san-pham/${product.slug}`}
                                                            className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-slate-600 group-hover:text-brand-secondary transition-colors pt-3 border-t border-slate-100 w-full mt-2"
                                                        >
                                                            {t('grid.viewDetail')}{' '}
                                                            <ArrowRight
                                                                size={14}
                                                                className="ml-auto group-hover:translate-x-0.5 transition-transform"
                                                            />
                                                        </LocalizedLink>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )
                                ))}

                            {/* List View */}
                            {viewMode === 'list' &&
                                (productsLoading ? (
                                    <div className="space-y-3 animate-pulse">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                             <div
                                                key={i}
                                                className="bg-slate-50/50 border border-slate-100 p-4 flex flex-col sm:flex-row gap-4 h-[160px] rounded-none"
                                            >
                                                <div className="w-full sm:w-32 aspect-square sm:aspect-auto bg-slate-200/50 shrink-0 rounded-none" />
                                                <div className="flex-1 space-y-3 flex flex-col justify-between">
                                                    <div className="space-y-2">
                                                        <div className="h-2 w-1/4 bg-slate-200 rounded-none" />
                                                        <div className="h-4 w-1/2 bg-slate-200 rounded-none" />
                                                        <div className="h-3 w-2/3 bg-slate-200 rounded-none" />
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-200/40 mt-4 rounded-none" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedProducts.map((product, i) => (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.03 }}
                                                className="group bg-white border border-slate-200 hover:border-amber-400 transition-all duration-300 rounded-xl relative overflow-hidden p-4 sm:p-5 shadow-sm hover:shadow-md"
                                            >
                                                {/* Animated top accent bar */}
                                                <div className="absolute top-0 left-0 w-full h-1 bg-[#E5B869] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                                <LocalizedLink
                                                    href={`/san-pham/${product.slug}`}
                                                    className="flex flex-col sm:flex-row gap-5"
                                                >
                                                    <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-40 shrink-0 overflow-hidden bg-slate-50 rounded-lg border border-slate-200/80">
                                                        <Image
                                                            src={
                                                                product.image_url ||
                                                                'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                            }
                                                            alt={
                                                                getLocalizedValue(
                                                                    product.name_localized,
                                                                    locale,
                                                                ) || product.name
                                                            }
                                                            fill
                                                            unoptimized
                                                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2 flex flex-col justify-between">
                                                        <div className="space-y-1.5">
                                                            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                                                                <Shield size={14} />{' '}
                                                                {getLocalizedValue(
                                                                    product.category_localized,
                                                                    locale,
                                                                ) || product.category}
                                                            </div>
                                                            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase line-clamp-1">
                                                                {getLocalizedValue(
                                                                    product.name_localized,
                                                                    locale,
                                                                ) || product.name}
                                                            </h3>

                                                            {/* Price Highlight */}
                                                            {product.price && Number(product.price) > 0 ? (
                                                                <div className="text-base sm:text-lg font-black text-[#D49B45]">
                                                                    {new Intl.NumberFormat('vi-VN').format(Number(product.price))} đ
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm sm:text-base font-bold text-amber-700/80">
                                                                    {locale === 'vi' ? 'Liên hệ báo giá' : locale === 'zh' ? '联系获取底价' : 'Contact for quote'}
                                                                </div>
                                                            )}

                                                            <p className="text-sm sm:text-base text-slate-600 font-medium line-clamp-2 leading-relaxed">
                                                                {getLocalizedValue(
                                                                    product.tech_summary_localized,
                                                                    locale,
                                                                ) ||
                                                                    product.tech_summary ||
                                                                    t('grid.defaultSummary')}
                                                            </p>
                                                        </div>
                                                        <div className="inline-flex items-center gap-2 text-sm sm:text-base font-black uppercase tracking-wider text-slate-700 group-hover:text-amber-600 transition-colors pt-2 border-t border-slate-100 w-full mt-1">
                                                            {t('grid.viewDetail')}{' '}
                                                            <ArrowRight
                                                                size={14}
                                                                className="ml-auto group-hover:translate-x-1 transition-transform"
                                                            />
                                                        </div>
                                                    </div>
                                                </LocalizedLink>
                                            </motion.div>
                                        ))}
                                    </div>
                                ))}

                            {/* Pagination */}
                            <SitePagination
                                numbered
                                className="pt-12"
                                linkClassName="text-xs font-bold"
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
