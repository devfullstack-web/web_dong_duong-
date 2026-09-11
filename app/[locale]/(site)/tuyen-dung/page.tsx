'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link as LocalizedLink } from '@/i18n/routing';
import { motion } from 'motion/react';
import { MapPin, Briefcase, Users, ArrowRight } from 'lucide-react';
import { PageBanner } from '@/components/site/PageBanner';
import { API_ROUTES } from '@/constants/routes';
import { usePaginatedApiQuery } from '@/hooks/use-paginated-api-query';
import { SiteEmptyState } from '@/components/site/SiteEmptyState';
import Loading from '@/components/shared/Loading';
import { SitePagination } from '@/components/site/SitePagination';
import { EMPLOYMENT_TYPE, JOB_STATUS, type JobStatus } from '@/constants/content';

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
    status: JobStatus;
    deadline: string | null;
    created_at: string;
}

const ITEMS_PER_PAGE = 12;

export default function RecruitmentHub() {
    const t = useTranslations('Careers');
    const tCommon = useTranslations('Common');
    const jobsListRef = useRef<HTMLDivElement>(null);
    const {
        items: jobs,
        isLoading,
        currentPage,
        totalPages,
        handlePageChange,
    } = usePaginatedApiQuery<JobPosting>({
        endpoint: API_ROUTES.JOBS,
        queryKey: ['jobs'],
        pageSize: ITEMS_PER_PAGE,
        params: { status: JOB_STATUS.OPEN },
        scrollTargetRef: jobsListRef,
    });

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Jobs List */}
            <section className="py-16 bg-white relative min-h-[400px]" ref={jobsListRef}>
                <div className="container mx-auto px-4 lg:px-8">
                    {isLoading && jobs.length === 0 ? (
                        <Loading variant="section" size="lg" text={tCommon('loading')} />
                    ) : jobs.length === 0 ? (
                        <SiteEmptyState icon={Users} title={t('empty.title')} />
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
                                        className="group block bg-white border border-slate-200 border-l-4 border-l-brand-primary p-6 hover:shadow-md hover:border-l-brand-secondary transition-all duration-200"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                                                    {job.department || t('list.defaultDepartment')}
                                                </span>
                                            </div>
                                            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {job.location || t('list.defaultLocation')}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Briefcase size={14} className="text-slate-400" />
                                                    {t(
                                                        `employmentTypes.${job.employment_type?.toLowerCase() || EMPLOYMENT_TYPE.FULL_TIME}`,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 group-hover:text-brand-primary">
                                                {t('list.viewDetail')} <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <SitePagination
                        className="mt-12"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </section>
        </div>
    );
}
