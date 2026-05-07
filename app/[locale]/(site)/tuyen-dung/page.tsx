'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, Briefcase, Users, ArrowRight } from 'lucide-react';
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

interface JobPosting {
    id: string;
    title: string;
    slug: string;
    description: string;
    location: string | null;
    employment_type: string;
    salary_range: string | null;
    experience_level: string | null;
    department: string | null;
    status: 'open' | 'closed';
    deadline: string | null;
    created_at: string;
}

const ITEMS_PER_PAGE = 12;

export default function RecruitmentHub() {
    const t = useTranslations('Careers');
    const [currentPage, setCurrentPage] = useState(1);
    const jobsListRef = useRef<HTMLDivElement>(null);

    const { data: jobsData, isLoading } = useQuery<{
        data: JobPosting[];
        meta: { total: number; totalPages: number };
    }>({
        queryKey: ['jobs', { page: currentPage }],
        queryFn: async () => {
            const response = await $api.get(API_ROUTES.JOBS, {
                params: {
                    status: 'open',
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
            throw new Error('Failed to fetch jobs');
        },
    });

    const jobs = jobsData?.data || [];
    const totalPages = jobsData?.meta?.totalPages || 1;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (jobsListRef.current) {
            jobsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (isLoading && jobs.length === 0) {
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
                    <div className="max-w-3xl space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
                            {t('hero.title')} <span className="text-brand-accent">{t('hero.titleAccent')}</span>
                        </h1>
                        <p className="text-lg text-white/70 font-medium max-w-xl">
                            {t('hero.desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Jobs List */}
            <section className="py-16 bg-white" ref={jobsListRef}>
                <div className="container mx-auto px-4 lg:px-8">
                    {jobs.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
                            <Users size={48} className="mx-auto mb-4 text-slate-200" />
                            <h3 className="text-sm font-black text-slate-400 uppercase">
                                {t('empty.title')}
                            </h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {jobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <LocalizedLink
                                        href={`/tuyen-dung/${job.slug}`}
                                        className="group block bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:bg-white hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                                    {job.department || t('list.defaultDepartment')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={12} />
                                                    {job.location || t('list.defaultLocation')}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase size={12} />
                                                    {t(`employmentTypes.${job.employment_type?.toLowerCase() || 'full_time'}`)}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary">
                                                {t('list.viewDetail')} <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center">
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
                </div>
            </section>
        </div>
    );
}
