'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, Briefcase, Clock, DollarSign, ChevronRight, MoveRight, Users } from 'lucide-react';
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
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    contract: 'Hợp đồng',
    internship: 'Thực tập',
};

export default function RecruitmentPage() {
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
    const total = jobsData?.meta?.total || 0;

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
                            CƠ HỘI NGHỀ NGHIỆP
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            GIA NHẬP <br />
                            <span className="text-brand-accent">ĐỘI NGŨ SGV</span>
                        </h1>
                        <p className="text-lg text-slate-200 font-medium max-w-xl">
                            Khám phá cơ hội nghề nghiệp tại Sài Gòn Valve - Nơi bạn có thể phát
                            triển sự nghiệp cùng đội ngũ chuyên gia hàng đầu trong lĩnh vực công
                            nghệ ngành nước.
                        </p>
                    </div>
                </div>
            </section>

            {/* Jobs List */}
            <section className="py-20 bg-slate-50" ref={jobsListRef}>
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                Vị trí đang tuyển
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">
                                {total} vị trí đang mở
                            </p>
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div className="text-center py-20">
                            <Users size={64} className="mx-auto mb-6 text-slate-300" />
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                Hiện chưa có vị trí nào
                            </h3>
                            <p className="text-sm text-slate-500">
                                Vui lòng quay lại sau hoặc gửi CV tự ứng tuyển qua email.
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
                                    <Link
                                        href={`/tuyen-dung/${job.slug}`}
                                        className="group block bg-white border border-slate-100 p-8 hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1.5">
                                                        {job.department || 'Tổng hợp'}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                        {
                                                            EMPLOYMENT_TYPE_LABELS[
                                                                job.employment_type
                                                            ]
                                                        }
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin
                                                            size={14}
                                                            className="text-brand-primary"
                                                        />
                                                        {job.location || 'Việt Nam'}
                                                    </span>
                                                    {job.salary_range && (
                                                        <span className="flex items-center gap-2">
                                                            <DollarSign
                                                                size={14}
                                                                className="text-brand-primary"
                                                            />
                                                            {job.salary_range}
                                                        </span>
                                                    )}
                                                    {job.experience_level && (
                                                        <span className="flex items-center gap-2">
                                                            <Briefcase
                                                                size={14}
                                                                className="text-brand-primary"
                                                            />
                                                            {job.experience_level}
                                                        </span>
                                                    )}
                                                    {job.deadline && (
                                                        <span className="flex items-center gap-2">
                                                            <Clock
                                                                size={14}
                                                                className="text-brand-primary"
                                                            />
                                                            Hạn:{' '}
                                                            {format(
                                                                new Date(job.deadline),
                                                                'dd/MM/yyyy',
                                                                { locale: vi },
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors flex items-center gap-2">
                                                    Xem chi tiết <ChevronRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
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
