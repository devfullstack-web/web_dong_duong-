'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, ExternalLink, MoveRight } from 'lucide-react';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import { cn } from '@/lib/utils';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

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

const ITEMS_PER_PAGE = 8;

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchProjects = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await $api.get(API_ROUTES.PROJECTS, {
                params: {
                    page,
                    limit: ITEMS_PER_PAGE,
                },
            });
            if (response.data.success) {
                setProjects(response.data.data || []);

                if (response.data.meta) {
                    setTotalPages(response.data.meta.totalPages || 1);
                    setTotal(response.data.meta.total || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && projects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-40 pb-20 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="Projects Background"
                        fill
                        className="object-cover brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/70 via-brand-secondary/50 to-brand-primary/80"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            DỰ ÁN TIÊU BIỂU
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            KHẲNG ĐỊNH <br />
                            <span className="text-brand-accent">NĂNG LỰC DỰ ÁN</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium max-w-xl">
                            Hơn {total > 0 ? total : 50}+ dự án đã triển khai thành công trên toàn
                            quốc trong lĩnh vực cấp thoát nước và tự động hóa.
                        </p>
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="py-12 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {projects.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative bg-white overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 border border-slate-100"
                            >
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={
                                            project.image_url ||
                                            'https://saigonvalve.vn/uploads/files/2025/07/16/thumbs/z6809258125215_0bfd24b1d2a12247ce2fe99f8bc81598-306x234-5.jpg'
                                        }
                                        alt={project.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-brand-primary">
                                            <span>{project.category || 'CÔNG TRÌNH'}</span>
                                            <span className="text-muted-foreground">
                                                {project.start_date
                                                    ? new Date(
                                                          project.start_date,
                                                      ).toLocaleDateString('vi-VN')
                                                    : ''}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                            <MapPin size={12} className="text-brand-primary" />
                                            {project.client_name || 'Việt Nam'}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/du-an/${project.slug}`}
                                        className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors pt-2 border-t border-slate-50"
                                    >
                                        XEM CHI TIẾT <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pt-12">
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
                                                'text-[9px] font-black uppercase tracking-widest',
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                    isActive={currentPage === page}
                                                    className="text-[11px] font-black"
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
                                                'text-[9px] font-black uppercase tracking-widest',
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
