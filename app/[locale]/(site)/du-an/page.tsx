'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, FolderOpen } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import { API_ROUTES } from '@/constants/routes';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SiteEmptyState } from '@/components/site/SiteEmptyState';
import { SiteLoadingScreen } from '@/components/site/SiteLoadingScreen';
import { SitePagination } from '@/components/site/SitePagination';
import { getYear } from '@/utils/client-format';
import type { ProjectStatus } from '@/constants/content';

interface Project {
    id: string;
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    start_date: string | null;
    client_name: string | null;
    status: ProjectStatus;
}

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
    const t = useTranslations('Projects');
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

    if (isLoading && projects.length === 0) {
        return <SiteLoadingScreen />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Compact Grid Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    {projects.length === 0 ? (
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
                                                src={
                                                    project.image_url ||
                                                    'https://saigonvalve.vn/uploads/files/2025/07/16/thumbs/z6809258125215_0bfd24b1d2a12247ce2fe99f8bc81598-306x234-5.jpg'
                                                }
                                                alt={project.name}
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </LocalizedLink>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-brand-primary opacity-60">
                                                <span>
                                                    {project.category || t('grid.defaultCategory')}
                                                </span>
                                                <span>{getYear(project.start_date)}</span>
                                            </div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                                <LocalizedLink href={`/du-an/${project.slug}`}>
                                                    {project.name}
                                                </LocalizedLink>
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                                <MapPin size={10} />
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
