'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { Newspaper, Calendar } from 'lucide-react';
import { getLocalizedValue, LocalizedText, type Locale } from '@/types/i18n';
import { PageBanner } from '@/components/site/PageBanner';
import TechSvgBackground from '@/components/ui/TechSvgBackground';
import { API_ROUTES } from '@/constants/routes';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SiteEmptyState } from '@/components/site/SiteEmptyState';
import Loading from '@/components/shared/Loading';
import { SitePagination } from '@/components/site/SitePagination';
import { formatViDate } from '@/utils/client-format';
import { NEWS_STATUS } from '@/constants/content';

interface NewsArticle {
    id: string;
    title: string;
    title_localized?: LocalizedText | null;
    slug: string;
    summary: string;
    summary_localized?: LocalizedText | null;
    category: string;
    category_localized?: LocalizedText | null;
    published_at: string | null;
    image_url: string;
}

const ITEMS_PER_PAGE = 8;

export default function NewsPage() {
    const t = useTranslations('News');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
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
        params: { status: NEWS_STATUS.PUBLISHED },
    });

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Compact News Grid */}
            <section className="relative py-12 bg-white min-h-[400px] overflow-hidden">
                {/* Tech Dot Matrix Background */}
                <TechSvgBackground variant="ecommerce-grid" glowColor="cyan" className="absolute inset-0 z-0" />

                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    {isLoading && news.length === 0 ? (
                        <Loading variant="section" size="lg" text={tCommon('loading')} />
                    ) : news.length === 0 ? (
                        <SiteEmptyState icon={Newspaper} title={t('empty.title')} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {news.map((article, i) => {
                                    const activeTitle = getLocalizedValue(article.title_localized, locale as Locale) || article.title;
                                    const activeSummary = getLocalizedValue(article.summary_localized, locale as Locale) || article.summary;
                                    const activeCat = getLocalizedValue(article.category_localized, locale as Locale) || article.category;
                                    return (
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
                                                    alt={activeTitle}
                                                    fill
                                                    unoptimized
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </LocalizedLink>

                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700">
                                                    <span>
                                                        {activeCat || t('grid.defaultCategory')}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                                                        <Calendar size={15} className="text-amber-500" />
                                                        <span>{formatViDate(article.published_at, locale)}</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                                                    <LocalizedLink href={`/tin-tuc/${article.slug}`}>
                                                        {activeTitle}
                                                    </LocalizedLink>
                                                </h3>
                                                <p className="text-sm sm:text-base text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                                    {activeSummary}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
