'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, FolderOpen } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import { API_ROUTES } from '@/constants/routes';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SiteEmptyState } from '@/components/site/SiteEmptyState';
import Loading from '@/components/shared/Loading';
import { SitePagination } from '@/components/site/SitePagination';
import { getYear } from '@/utils/client-format';
import { getLocalizedValue, type Locale, type LocalizedText } from '@/types/i18n';
import type { ProjectStatus } from '@/constants/content';

interface Project {
    id: string;
    name: string;
    name_localized?: LocalizedText | null;
    slug: string;
    category: string;
    category_localized?: LocalizedText | null;
    image_url: string | null;
    start_date: string | null;
    client_name: string | null;
    status: ProjectStatus;
}

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
    const t = useTranslations('Projects');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const {
        items: projects,
        isLoading,
        currentPage,
        totalPages,
        handlePageChange,
    } = usePaginatedApiQuery<Project>({
        endpoint: API_ROUTES.PROJECTS,
        queryKey: ['projects'],
        pageSize: ITEMS_PER_PAGE,
    });

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Compact Grid Section */}
            <section className="py-12 bg-white relative min-h-[400px]">
                <div className="container mx-auto px-4 lg:px-8">
                    {isLoading && projects.length === 0 ? (
                        <Loading variant="section" size="lg" text={tCommon('loading')} />
                    ) : projects.length === 0 ? (
                        <SiteEmptyState icon={FolderOpen} title={t('empty.title')} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projects.map((project, i) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex flex-col space-y-4"
                                    >
                                        <LocalizedLink
                                            href={`/du-an/${project.slug}`}
                                            className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-100"
                                        >
                                            <Image
                                                src={project.image_url || ''}
                                                alt={
                                                    getLocalizedValue(
                                                        project.name_localized,
                                                        locale as Locale,
                                                    ) || project.name
                                                }
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </LocalizedLink>

                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between text-sm sm:text-base font-extrabold uppercase tracking-wide text-brand-primary">
                                                <span>
                                                    {getLocalizedValue(
                                                        project.category_localized,
                                                        locale as Locale,
                                                    ) ||
                                                        project.category ||
                                                        t('grid.defaultCategory')}
                                                </span>
                                                <span className="text-slate-500 font-bold text-sm sm:text-base">{getYear(project.start_date)}</span>
                                            </div>
                                            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                <LocalizedLink href={`/du-an/${project.slug}`}>
                                                    {getLocalizedValue(
                                                        project.name_localized,
                                                        locale as Locale,
                                                    ) || project.name}
                                                </LocalizedLink>
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 uppercase">
                                                <MapPin size={16} className="text-slate-500" />
                                                {project.client_name || t('grid.defaultLocation')}
                                            </div>
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
