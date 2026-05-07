'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, FolderOpen } from 'lucide-react';
import { API_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { useQuery } from '@tanstack/react-query';

interface Project {
    id: string;
    name: string;
    slug: string;
    category: string;
    image_url: string | null;
    start_date: string | null;
    client_name: string | null;
    status: string;
}

const ITEMS_PER_PAGE = 12;

export default function ProjectsPage() {
    const t = useTranslations('Projects');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: projectsData, isLoading } = useQuery<{
        data: Project[];
        meta: { total: number; totalPages: number };
    }>({
        queryKey: ['projects', { page: currentPage }],
        queryFn: async () => {
            const response = await $api.get(API_ROUTES.PROJECTS, {
                params: {
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
            throw new Error('Failed to fetch projects');
        },
    });

    const projects = projectsData?.data || [];
    const totalPages = projectsData?.meta?.totalPages || 1;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoading && projects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Ultra Clean Title Section with Brand Color */}
            <section className="pt-48 pb-16 bg-brand-primary">
                <div className="container mx-auto px-4 lg:px-8">
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
                        {t('hero.title')} <span className="text-brand-accent">{t('hero.titleAccent')}</span>
                    </h1>
                </div>
            </section>

            {/* Compact Grid Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    {projects.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
                            <FolderOpen size={48} className="mx-auto mb-4 text-slate-200" />
                            <h3 className="text-sm font-black text-slate-400 uppercase">
                                {t('empty.title')}
                            </h3>
                        </div>
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
                                <LocalizedLink href={`/du-an/${project.slug}`} className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-100">
                                    <Image
                                        src={project.image_url || 'https://saigonvalve.vn/uploads/files/2025/07/16/thumbs/z6809258125215_0bfd24b1d2a12247ce2fe99f8bc81598-306x234-5.jpg'}
                                        alt={project.name}
                                        fill
                                        unoptimized
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </LocalizedLink>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-brand-primary opacity-60">
                                        <span>{project.category || t('grid.defaultCategory')}</span>
                                        <span>{project.start_date ? new Date(project.start_date).getFullYear() : ''}</span>
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
                    {totalPages > 1 && (
                        <div className="pt-12 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) handlePageChange(currentPage - 1);
                                            }}
                                            className={cn('text-[10px] font-bold uppercase tracking-widest', currentPage === 1 && 'opacity-30 pointer-events-none')}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="text-[10px] font-black px-4">{currentPage} / {totalPages}</span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                            }}
                                            className={cn('text-[10px] font-bold uppercase tracking-widest', currentPage === totalPages && 'opacity-30 pointer-events-none')}
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
