'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { User, ChevronRight } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content?: string;
    category: string;
    author: string;
    published_at: string | null;
    created_at: string;
    readTime: string;
    image_url: string;
}

// Helper to format date in Vietnamese
function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} THÁNG ${month}, ${year}`;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchNews = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await $api.get(API_ROUTES.NEWS, {
                params: {
                    status: 'published',
                    page,
                    limit: 8,
                },
            });
            if (response.data.success) {
                setNews(response.data.data || []);
                if (response.data.meta) {
                    setTotalPages(response.data.meta.totalPages || 1);
                    setTotal(response.data.meta.total || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && news.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Page Header */}
            <section className="relative pt-40 pb-20 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="News Background"
                        fill
                        className="object-cover brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/70 via-brand-secondary/50 to-brand-primary/80"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            Truyền thông & Tin tức
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            TRUNG TÂM <br />
                            <span className="text-brand-accent">TIÊU ĐIỂM</span>
                        </h1>
                        <p className="text-lg text-slate-200 font-medium max-w-xl">
                            Cập nhật những tin tức mới nhất về công nghệ, dự án và xu hướng trong
                            ngành nước và hạ tầng công nghiệp.
                        </p>
                    </div>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-20">
                        <div className="w-full space-y-16">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {news.map((article, i) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative bg-white overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 border border-slate-100"
                                    >
                                        <div className="relative aspect-4/3 w-full overflow-hidden">
                                            <Image
                                                src={article.image_url}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>

                                        <div className="p-6 grow flex flex-col justify-between space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-brand-primary">
                                                    <span>{article.category || 'TIN TỨC'}</span>
                                                    <span className="text-muted-foreground">
                                                        {formatDate(article.published_at)}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                    <Link href={`/tin-tuc/${article.slug}`}>
                                                        {article.title}
                                                    </Link>
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <User
                                                        size={12}
                                                        className="text-brand-primary"
                                                    />
                                                    {article.author || 'SGV Admin'}
                                                </div>
                                            </div>

                                            <Link
                                                href={`/tin-tuc/${article.slug}`}
                                                className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors pt-2 border-t border-slate-50"
                                            >
                                                XEM CHI TIẾT <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pt-16 border-t border-slate-100">
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
