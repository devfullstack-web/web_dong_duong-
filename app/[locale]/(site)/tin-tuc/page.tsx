'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { Newspaper, Calendar } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import { API_ROUTES } from '@/constants/routes';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SiteEmptyState } from '@/components/site/SiteEmptyState';
import { SiteLoadingScreen } from '@/components/site/SiteLoadingScreen';
import { SitePagination } from '@/components/site/SitePagination';
import { formatViDate } from '@/utils/client-format';

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
    const {
        items: news,
        isLoading,
        currentPage,
        totalPages,
        handlePageChange,
    } = usePaginatedApiQuery<NewsArticle>({
        endpoint: API_ROUTES.NEWS,
        queryKey: ['news'],
        pageSize: ITEMS_PER_PAGE,
        params: { status: 'published' },
    });

    if (isLoading && news.length === 0) {
        return <SiteLoadingScreen />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Compact News Grid */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    {news.length === 0 ? (
                        <SiteEmptyState icon={Newspaper} title={t('empty.title')} />
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
                                                    <span>{formatViDate(article.published_at)}</span>
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
                            <SitePagination
                                className="pt-12"
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
