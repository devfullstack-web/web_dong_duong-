'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { LayoutGrid, List, ArrowRight, Shield, Info, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { PageBanner } from '@/components/site/PageBanner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { getLocalizedValue } from '@/types/i18n';
import type { LocalizedText, Locale } from '@/types/i18n';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Reset to page 1 when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCategoryId]);

    // Fetch products using react-query
    const { data: productsData, isLoading: productsLoading } = useQuery<{
        data: Product[];
        meta: { total: number; totalPages: number };
    }>({
        queryKey: [
            'products',
            { page: currentPage, search: debouncedSearch, categoryId: selectedCategoryId },
        ],
        queryFn: async () => {
            const response = await $api.get(API_ROUTES.PRODUCTS, {
                params: {
                    status: 'active',
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearch || undefined,
                    categoryId: selectedCategoryId || undefined,
                },
            });
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    meta: response.data.meta || { total: 0, totalPages: 1 },
                };
            }
            throw new Error('Failed to fetch products');
        },
    });

    // Fetch categories using react-query
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories', 'product'],
        queryFn: async () => {
            const response = await $api.get(`${API_ROUTES.CATEGORIES}?type=product`);
            if (response.data.success) {
                return response.data.data || [];
            }
            throw new Error('Failed to fetch categories');
        },
        staleTime: 5 * 60 * 1000, // Categories don't change often
    });

    const products = productsData?.data || [];
    const totalPages = productsData?.meta?.totalPages || 1;
    const total = productsData?.meta?.total || 0;

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Main Content */}
            <section className="py-8 ">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-16">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="lg:sticky lg:top-32 space-y-6 lg:space-y-12">
                                <div className="space-y-4 lg:space-y-6">
                                    {/* Mobile Collapsible Category Selector Button */}
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="w-full bg-brand-primary text-white py-3.5 px-5 flex items-center justify-between uppercase tracking-widest text-[10px] font-black lg:hidden rounded-none shadow-md"
                                    >
                                        <span className="flex items-center gap-2">
                                            {t('sidebar.categoryTitle')}:{' '}
                                            <span className="text-brand-accent font-black">
                                                {selectedCategoryId === null 
                                                    ? t('sidebar.all') 
                                                    : (categories.find(c => c.id === selectedCategoryId)
                                                        ? (getLocalizedValue(categories.find(c => c.id === selectedCategoryId)?.name_localized, locale) || categories.find(c => c.id === selectedCategoryId)?.name)
                                                        : (getLocalizedValue(categories.flatMap(c => c.children || []).find(c => c.id === selectedCategoryId)?.name_localized, locale) || categories.flatMap(c => c.children || []).find(c => c.id === selectedCategoryId)?.name)
                                                      )}
                                            </span>
                                        </span>
                                        <ChevronDown size={16} className={cn("transition-transform duration-300", isMobileMenuOpen && "rotate-180")} />
                                    </button>

                                    {/* Categories Dropdown Container */}
                                    <div className={cn(
                                        "lg:block transition-all duration-300", 
                                        isMobileMenuOpen ? "block animate-fadeIn" : "hidden lg:block"
                                    )}>
                                        <h4 className="hidden lg:flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-secondary border-b border-slate-100 pb-4 mb-4">
                                            {t('sidebar.categoryTitle')}
                                        </h4>
                                        
                                        <div className="flex flex-col gap-1.5">
                                            {/* "Tất cả" button */}
                                            <button
                                                onClick={() => {
                                                    handleAllCategoriesClick();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={cn(
                                                    'w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer rounded-none border-l-4',
                                                    selectedCategoryId === null
                                                        ? 'bg-brand-primary text-white border-brand-accent'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-brand-primary border-transparent',
                                                )}
                                            >
                                                {t('sidebar.all')}
                                            </button>
                                            
                                            {categories
                                                .filter((cat) => cat.is_visible !== false)
                                                .map((cat) => {
                                                    const visibleChildren =
                                                        cat.children?.filter(
                                                            (child) => child.is_visible !== false,
                                                        ) || [];
                                                    const hasChildren = visibleChildren.length > 0;
                                                    const isExpanded = expandedCategoryIds.includes(cat.id);

                                                    return (
                                                        <div key={cat.id} className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => handleParentCategoryClick(cat)}
                                                                className={cn(
                                                                    'w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest transition-all hover:cursor-pointer rounded-none border-l-4 flex items-center justify-between gap-2',
                                                                    selectedCategoryId === cat.id
                                                                        ? 'bg-brand-primary text-white border-brand-accent'
                                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-brand-primary border-transparent',
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
                                                                            'shrink-0 transition-transform duration-200',
                                                                            isExpanded && 'rotate-180',
                                                                        )}
                                                                    />
                                                                )}
                                                            </button>
                                                            
                                                            {hasChildren && isExpanded && (
                                                                <div className="flex flex-col gap-1 pl-4 border-l border-slate-100 py-1">
                                                                    {visibleChildren.map((child) => (
                                                                        <button
                                                                            key={child.id}
                                                                            onClick={() => {
                                                                                handleChildCategoryClick(cat.id, child.id);
                                                                                setIsMobileMenuOpen(false);
                                                                            }}
                                                                            className={cn(
                                                                                'w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-all hover:cursor-pointer rounded-none border-l-4',
                                                                                selectedCategoryId === child.id
                                                                                    ? 'bg-brand-secondary text-white border-brand-accent'
                                                                                    : 'bg-slate-100/60 text-slate-600 hover:bg-slate-100 hover:text-brand-primary border-transparent',
                                                                            )}
                                                                        >
                                                                            {getLocalizedValue(
                                                                                child.name_localized,
                                                                                locale,
                                                                            ) || child.name}
                                                                        </button>
                                                                    ))}
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
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                                    {t('grid.resultCount', {
                                        start: products.length > 0 ? startIndex + 1 : 0,
                                        end: Math.min(startIndex + ITEMS_PER_PAGE, total),
                                        total: total,
                                    })}
                                </div>
                                <div className="flex items-center gap-6">
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
                                         <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                                             {locale === 'vi' ? 'Không tìm thấy sản phẩm' : 'No products found'}
                                         </p>
                                         <p className="text-[10px] text-slate-400 font-medium">
                                             {locale === 'vi' 
                                                 ? 'Vui lòng thử lại với từ khóa khác hoặc bộ lọc khác.' 
                                                 : 'Please try again with a different search query or filter.'}
                                         </p>
                                     </div>
                                 </div>
                             )}

                             {/* Grid View */}
                             {viewMode === 'grid' && (
                                 productsLoading ? (
                                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                                         {Array.from({ length: 8 }).map((_, i) => (
                                             <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 space-y-4 flex flex-col justify-between h-[320px] rounded-none">
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
                                             {products.map((product, i) => (
                                                 <motion.div
                                                     key={product.id}
                                                     initial={{ opacity: 0, y: 15 }}
                                                     whileInView={{ opacity: 1, y: 0 }}
                                                     viewport={{ once: true }}
                                                     transition={{ delay: i * 0.03 }}
                                                     className="group bg-white p-4 space-y-4 flex flex-col justify-between hover:z-10 hover:shadow-2xl hover:border-brand-accent transition-all duration-500 h-full border border-slate-100 rounded-none relative pt-6"
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
                                                             <div className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
                                                                 <Shield size={9} />{' '}
                                                                 {getLocalizedValue(
                                                                     product.category_localized,
                                                                     locale,
                                                                 ) || product.category}
                                                             </div>
                                                             <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-2 uppercase min-h-[2rem]">
                                                                 {getLocalizedValue(
                                                                     product.name_localized,
                                                                     locale,
                                                                 ) || product.name}
                                                             </h3>
                                                             <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
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
                                                             className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-secondary transition-colors pt-3 border-t border-slate-100 w-full mt-2"
                                                         >
                                                             {t('grid.viewDetail')}{' '}
                                                             <ArrowRight size={10} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
                                                         </LocalizedLink>
                                                     </div>
                                                 </motion.div>
                                             ))}
                                         </div>
                                     )
                                 )
                             )}

                             {/* List View */}
                             {viewMode === 'list' && (
                                 productsLoading ? (
                                     <div className="space-y-3 animate-pulse">
                                         {Array.from({ length: 4 }).map((_, i) => (
                                             <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 flex flex-col sm:flex-row gap-4 h-[160px] rounded-none">
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
                                     <div className="space-y-3">
                                     {products.map((product, i) => (
                                         <motion.div
                                             key={product.id}
                                             initial={{ opacity: 0, y: 15 }}
                                             whileInView={{ opacity: 1, y: 0 }}
                                             viewport={{ once: true }}
                                             transition={{ delay: i * 0.03 }}
                                             className="group bg-white border border-slate-100 hover:shadow-2xl hover:border-brand-accent transition-all duration-500 rounded-none relative overflow-hidden"
                                         >
                                             {/* Animated top accent bar */}
                                             <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                             <LocalizedLink
                                                 href={`/san-pham/${product.slug}`}
                                                 className="flex flex-col sm:flex-row gap-4 p-4"
                                             >
                                                 <div className="relative w-full sm:w-32 aspect-square sm:aspect-auto sm:h-32 shrink-0 overflow-hidden bg-slate-50/50 rounded-none border border-slate-100/60">
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
                                                     <div className="space-y-1">
                                                         <div className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1.5">
                                                             <Shield size={9} />{' '}
                                                             {getLocalizedValue(
                                                                 product.category_localized,
                                                                 locale,
                                                             ) || product.category}
                                                         </div>
                                                         <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase line-clamp-1">
                                                             {getLocalizedValue(
                                                                 product.name_localized,
                                                                 locale,
                                                             ) || product.name}
                                                         </h3>
                                                         <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                                                             {getLocalizedValue(
                                                                 product.tech_summary_localized,
                                                                 locale,
                                                             ) ||
                                                                 product.tech_summary ||
                                                                 t('grid.defaultSummary')}
                                                         </p>
                                                     </div>
                                                     <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-secondary transition-colors pt-2 border-t border-slate-100 w-full mt-1">
                                                         {t('grid.viewDetail')}{' '}
                                                         <ArrowRight size={10} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
                                                     </div>
                                                 </div>
                                             </LocalizedLink>
                                         </motion.div>
                                     ))}
                                </div>
                            )
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pt-12">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (currentPage > 1)
                                                            handlePageChange(currentPage - 1);
                                                    }}
                                                    className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest',
                                                        currentPage === 1 &&
                                                            'pointer-events-none opacity-50',
                                                    )}
                                                />
                                            </PaginationItem>

                                            {Array.from(
                                                { length: totalPages },
                                                (_, i) => i + 1,
                                            ).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePageChange(page);
                                                        }}
                                                        isActive={currentPage === page}
                                                        className="text-[11px] font-black"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (currentPage < totalPages)
                                                            handlePageChange(currentPage + 1);
                                                    }}
                                                    className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest',
                                                        currentPage === totalPages &&
                                                            'pointer-events-none opacity-50',
                                                    )}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
