'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { User, ChevronRight, Newspaper } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';

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
function formatDate(dateString: string | null, monthText: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} ${monthText} ${month}, ${year}`;
}

export default function NewsPage() {
    const t = useTranslations('News');
    const monthText = t('date.month');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch news using react-query
    const { data: newsData, isLoading } = useQuery<{
        data: NewsArticle[];
        meta: { total: number; totalPages: number };
    }>({
        queryKey: ['news', { page: currentPage }],
        queryFn: async () => {
            const response = await $api.get(API_ROUTES.NEWS, {
                params: {
                    status: 'published',
                    page: currentPage,
                    limit: 8,
                },
            });
            if (response.data.success) {
                return {
                    data: response.data.data || [],
                    meta: response.data.meta || { total: 0, totalPages: 1 },
                };
            }
            throw new Error('Failed to fetch news');
        },
    });

    const news = newsData?.data || [];
    const totalPages = newsData?.meta?.totalPages || 1;
    const total = newsData?.meta?.total || 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading && news.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Page Header */}
            <section className="relative pt-40 pb-20 bg-linear-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="News Background"
                        fill
                        unoptimized
                        className="object-cover brightness-110"
                        priority
                    />
                    {/* <div className="absolute inset-0 bg-linear-to-b from-brand-primary/70 via-brand-secondary/50 to-brand-primary/80"></div> */}
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            {t('hero.badge')}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            {t('hero.title')} <br />
                            <span className="text-brand-accent">{t('hero.titleAccent')}</span>
                        </h1>
                        <p className="text-lg text-slate-200 font-medium max-w-xl">
                            {t('hero.desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-20">
                        <div className="w-full space-y-16">
                            {news.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-slate-200 bg-white rounded-xl">
                                    <Newspaper size={64} className="mx-auto mb-6 text-slate-300" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase">
                                        {t('empty.title')}
                                    </h3>
                                    <p className="text-muted-foreground font-medium">
                                        {t('empty.desc')}
                                    </p>
                                </div>
                            ) : (
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
                                                unoptimized
                                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>

                                        <div className="p-6 grow flex flex-col justify-between space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-brand-primary">
                                                    <span>{article.category || t('grid.defaultCategory')}</span>
                                                    <span className="text-muted-foreground">
                                                        {formatDate(article.published_at, monthText)}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                    <LocalizedLink href={`/tin-tuc/${article.slug}`}>
                                                        {article.title}
                                                    </LocalizedLink>
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <User
                                                        size={12}
                                                        className="text-brand-primary"
                                                    />
                                                    {article.author || 'SGV Admin'}
                                                </div>
                                            </div>

                                            <LocalizedLink
                                                href={`/tin-tuc/${article.slug}`}
                                                className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors pt-2 border-t border-slate-50"
                                            >
                                                {t('grid.viewDetail')} <ChevronRight size={14} />
                                            </LocalizedLink>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            )}

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
