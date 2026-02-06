'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, LayoutGrid, List, ArrowRight, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';

interface Product {
    id: string;
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    tech_summary: string | null;
    price: string;
    status: string;
}

interface Category {
    id: string;
    name: string;
}

const ITEMS_PER_PAGE = 6;

export default function ProductArchive() {
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    if (productsLoading && products.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const handleCategoryChange = (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pt-24">
            {/* Page Header */}
            <section className="relative py-20 bg-linear-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-70">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="Projects Background"
                        fill
                        className="object-cover brightness-110"
                        priority
                    />
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                                Sản phẩm & Giải pháp
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">
                                THIẾT BỊ <br />
                                <span className="text-brand-accent">CHUYÊN DỤNG</span>
                            </h1>
                            <p className="text-slate-200 font-medium text-base sm:text-lg max-w-xl">
                                Van công nghiệp, thiết bị đo lường và giải pháp IoT tiêu chuẩn Nhật
                                Bản & Hàn Quốc cho ngành nước và hạ tầng kỹ thuật.
                            </p>
                        </div>

                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full bg-white/10 backdrop-blur-md px-6 py-5 pl-14 text-sm font-bold border border-white/20 focus:outline-none focus:border-brand-accent text-white placeholder:text-white/40 transition-all"
                            />
                            <Search
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40"
                                size={20}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-64 shrink-0">
                            <div className="sticky top-32 space-y-12">
                                <div className="space-y-6">
                                    <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-brand-secondary border-b border-slate-100 pb-4">
                                        CHUYÊN MỤC
                                    </h4>
                                    <div className="flex flex-wrap gap-2 lg:flex-col">
                                        {/* "Tất cả" button */}
                                        <button
                                            onClick={() => handleCategoryChange(null)}
                                            className={cn(
                                                'px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer',
                                                selectedCategoryId === null
                                                    ? 'bg-brand-primary text-white '
                                                    : 'bg-white text-muted-foreground hover:bg-slate-50 hover:text-brand-primary',
                                            )}
                                        >
                                            Tất cả
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategoryChange(cat.id)}
                                                className={cn(
                                                    'px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer',
                                                    selectedCategoryId === cat.id
                                                        ? 'bg-brand-primary text-white '
                                                        : 'bg-white text-muted-foreground hover:bg-slate-50 hover:text-brand-primary',
                                                )}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Grid */}
                        <div className="flex-1 space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                                    Hiển thị {products.length > 0 ? startIndex + 1 : 0} -{' '}
                                    {Math.min(startIndex + ITEMS_PER_PAGE, total)} trong {total} kết
                                    quả
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

                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white p-8 space-y-8 flex flex-col justify-between hover:z-10 hover:shadow-2xl transition-all duration-500 h-full border border-slate-100"
                                        >
                                            <div className="relative aspect-square w-full overflow-hidden transition-all duration-500">
                                                <Image
                                                    src={
                                                        product.image_url ||
                                                        'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                    }
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-1000"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                                                    <Shield size={10} /> {product.category}
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors line-clamp-2 uppercase min-h-10">
                                                    {product.name}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground font-medium line-clamp-2">
                                                    {product.tech_summary ||
                                                        'Thiết bị chuyên dụng ngành nước và công nghiệp.'}
                                                </p>
                                                <Link
                                                    href={`/san-pham/${product.slug}`}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-secondary transition-colors pt-4 border-t border-slate-50 w-full"
                                                >
                                                    CHI TIẾT SẢN PHẨM{' '}
                                                    <ArrowRight size={12} className="ml-auto" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                    {products.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white border border-slate-100 hover:shadow-xl transition-all duration-500"
                                        >
                                            <Link
                                                href={`/san-pham/${product.slug}`}
                                                className="flex flex-col sm:flex-row gap-6 p-6"
                                            >
                                                <div className="relative w-full sm:w-48 h-48 sm:h-32 shrink-0 overflow-hidden bg-slate-50">
                                                    <Image
                                                        src={
                                                            product.image_url ||
                                                            'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                        }
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                                                        <Shield size={10} /> {product.category}
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                                                        {product.tech_summary ||
                                                            'Thiết bị chuyên dụng ngành nước và công nghiệp.'}
                                                    </p>
                                                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-secondary transition-colors pt-2">
                                                        CHI TIẾT SẢN PHẨM <ArrowRight size={12} />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
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

                            {products.length === 0 && !productsLoading && (
                                <div className="py-20 text-center space-y-4">
                                    <Info className="mx-auto text-slate-200" size={64} />
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest">
                                        Không tìm thấy sản phẩm nào.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
