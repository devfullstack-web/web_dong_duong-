'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { Newspaper, Calendar } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
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
    category: string;
    published_at: string | null;
    image_url: string;
}

const ITEMS_PER_PAGE = 12;

export default function NewsPage() {
    const t = useTranslations('News');
    const [currentPage, setCurrentPage] = useState(1);

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
                    limit: ITEMS_PER_PAGE,
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading && news.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Compact News Grid */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    {news.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
                            <Newspaper size={48} className="mx-auto mb-4 text-slate-200" />
                            <h3 className="text-sm font-black text-slate-400 uppercase">
                                {t('empty.title')}
                            </h3>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {news.map((article, i) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex flex-col space-y-4"
                                    >
                                        <LocalizedLink
                                            href={`/tin-tuc/${article.slug}`}
                                            className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100"
                                        >
                                            <Image
                                                src={article.image_url}
                                                alt={article.title}
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </LocalizedLink>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-brand-primary opacity-60">
                                                <span>
                                                    {article.category || t('grid.defaultCategory')}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={8} />
                                                    <span>
                                                        {article.published_at
                                                            ? new Date(
                                                                  article.published_at,
                                                              ).toLocaleDateString('vi-VN')
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                <LocalizedLink href={`/tin-tuc/${article.slug}`}>
                                                    {article.title}
                                                </LocalizedLink>
                                            </h3>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                {article.summary}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Simple Pagination */}
                            {totalPages > 1 && (
                                <div className="pt-12 flex justify-center">
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
                                                        'text-[10px] font-bold uppercase tracking-widest',
                                                        currentPage === 1 &&
                                                            'opacity-30 pointer-events-none',
                                                    )}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <span className="text-[10px] font-black px-4">
                                                    {currentPage} / {totalPages}
                                                </span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (currentPage < totalPages)
                                                            handlePageChange(currentPage + 1);
                                                    }}
                                                    className={cn(
                                                        'text-[10px] font-bold uppercase tracking-widest',
                                                        currentPage === totalPages &&
                                                            'opacity-30 pointer-events-none',
                                                    )}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
