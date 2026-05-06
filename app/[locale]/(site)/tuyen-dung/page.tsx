'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, Briefcase, Clock, ChevronRight, Users, ArrowRight } from 'lucide-react';
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

export default function RecruitmentHub() {
    const t = useTranslations('Careers');
    const [currentPage, setCurrentPage] = useState(1);
    const jobsListRef = useRef<HTMLDivElement>(null);

    // Fetch jobs using react-query
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
                    limit: 10,
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-linear-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="Recruitment Background"
                        fill
                        unoptimized
                        className="object-cover brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-brand-primary/70 via-brand-secondary/50 to-brand-primary/80"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            {t('hero.badge')}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            {t('hero.title')} <br />
                            <span className="text-brand-accent">{t('hero.titleAccent')}</span>
                        </h1>
                        <p className="text-lg text-slate-300 font-medium max-w-xl">
                            {t('hero.desc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Jobs List */}
            <section className="py-20 bg-slate-50" ref={jobsListRef}>
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {t('list.title')}
                            </h2>
                            <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-2 border-l-4 border-brand-primary pl-4">
                                {t('list.count', { total: jobs.length })}
                            </p>
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 bg-white rounded-xl">
                            <Users size={64} className="mx-auto mb-6 text-slate-300" />
                            <h3 className="text-xl font-black text-slate-900 uppercase">
                                {t('empty.title')}
                            </h3>
                            <p className="text-muted-foreground font-medium">
                                {t('empty.desc')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <LocalizedLink
                                        href={`/tuyen-dung/${job.slug}`}
                                        className="group block bg-white border border-slate-100 p-8 hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary border-b-2 border-brand-primary pb-1">
                                                        {job.department || t('list.defaultDepartment')}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500 uppercase">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-brand-primary" />
                                                        {job.location || t('list.defaultLocation')}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Briefcase size={14} className="text-brand-primary" />
                                                        {t(`employmentTypes.${job.employment_type?.toLowerCase() || 'full_time'}`)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-brand-primary" />
                                                        {t('list.deadlinePrefix')} {job.deadline || 'ASAP'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-lg shadow-slate-200">
                                                    {t('list.viewDetail')} <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-16 pt-10 border-t border-slate-200">
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
                                                currentPage === 1 &&
                                                    'pointer-events-none opacity-50',
                                            )}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === page}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ),
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages)
                                                    handlePageChange(currentPage + 1);
                                            }}
                                            className={cn(
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
            </section>
        </div>
    );
}
