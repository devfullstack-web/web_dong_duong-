'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Share2,
    Printer,
    MapPin,
    Calendar,
    Building,
    MoveRight,
    Facebook,
    Linkedin,
    Twitter,
    Bookmark,
} from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { sanitizeRichText } from '@/utils/sanitize';
import { PROJECT_STATUS } from '@/constants/content';

interface ProjectDetailClientProps {
    project: Record<string, unknown>;
    relatedProjects: Record<string, unknown>[];
}

export default function ProjectDetailClient({
    project,
    relatedProjects,
}: ProjectDetailClientProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Breadcrumbs */}
            <section className="pt-44 pb-6 border-b border-slate-100">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">Trang chủ</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/du-an">Dự án</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="max-w-[200px] truncate">
                                        {project.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <button
                            onClick={() => router.back()}
                            className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>
                    </div>
                </div>
            </section>

            {/* Project Header */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary rounded-none">
                            {project.category || 'DỰ ÁN'}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            {project.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-6 pt-4 border-t border-slate-100 text-slate-500">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <Building size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Khách hàng
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {project.client_name || 'Đang cập nhật'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Vị trí
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {project.location || 'Việt Nam'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Thời gian
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {project.start_date
                                            ? new Date(project.start_date).getFullYear()
                                            : '2024'}
                                        {project.end_date
                                            ? ` - ${new Date(project.end_date).getFullYear()}`
                                            : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    title="Chia sẻ"
                                    className="h-9 w-9 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all rounded-none"
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    title="In"
                                    className="h-9 w-9 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all rounded-none"
                                >
                                    <Printer size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Area */}
            <section className="pb-16 sm:pb-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8">
                            <div className="space-y-8">
                                {/* Main Image */}
                                {project.image_url && (
                                    <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                                        <Image
                                            src={project.image_url}
                                            alt={project.name}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                            priority
                                        />
                                    </div>
                                )}

                                {/* Project Summary */}
                                {project.summary && (
                                    <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-brand-primary pl-8">
                                        {project.summary}
                                    </p>
                                )}

                                {/* Project Content */}
                                <div
                                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand-primary hover:prose-a:text-brand-secondary prose-img:rounded-none"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeRichText(
                                            project.description ||
                                                '<p>Nội dung đang được cập nhật...</p>',
                                        ),
                                    }}
                                />

                                {/* Share & Actions */}
                                <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Chia sẻ:
                                        </span>
                                        <div className="flex gap-2">
                                            {[Facebook, Linkedin, Twitter].map((Icon, i) => (
                                                <button
                                                    key={i}
                                                    className="h-8 w-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-brand-primary hover:text-white transition-all rounded-none border border-slate-100"
                                                >
                                                    <Icon size={14} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 px-5 py-2.5 hover:bg-slate-200 transition-all rounded-none border border-slate-100">
                                            <Bookmark size={14} /> Lưu dự án
                                        </button>
                                        <Link
                                            href="/lien-he"
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary px-5 py-2.5 hover:bg-brand-secondary transition-all rounded-none"
                                        >
                                            Liên hệ tư vấn <MoveRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                            {/* Project Info Card */}
                            <div className="bg-slate-50 border border-slate-100 p-6 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-brand-primary"></span> Thông tin
                                    dự án
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Loại dự án
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {project.category || 'Hạ tầng nước'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Khách hàng
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {project.client_name || 'Đang cập nhật'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Vị trí
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {project.location || 'Việt Nam'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Trạng thái
                                        </span>
                                        <span
                                            className={`text-xs font-bold ${project.status === PROJECT_STATUS.COMPLETED ? 'text-green-600' : 'text-amber-600'}`}
                                        >
                                            {project.status === PROJECT_STATUS.COMPLETED
                                                ? 'Đã hoàn thành'
                                                : 'Đang triển khai'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Thời gian
                                        </span>
                                        <span className="text-xs font-bold text-slate-900">
                                            {project.start_date
                                                ? new Date(project.start_date).getFullYear()
                                                : '2024'}
                                            {project.end_date
                                                ? ` - ${new Date(project.end_date).getFullYear()}`
                                                : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-brand-primary p-6 text-white space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-tight">
                                    Bạn có dự án tương tự?
                                </h3>
                                <p className="text-xs text-white/80 leading-relaxed">
                                    Liên hệ ngay để được tư vấn giải pháp phù hợp nhất cho dự án của
                                    bạn.
                                </p>
                                <Link
                                    href="/lien-he"
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-brand-primary px-4 py-2 hover:bg-slate-100 transition-all"
                                >
                                    Liên hệ ngay <ArrowRight size={12} />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4 lg:px-8">
                        <div className="mb-12 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                    DỰ ÁN LIÊN QUAN
                                </h2>
                                <div className="h-1 w-20 bg-brand-primary mt-2"></div>
                            </div>
                            <Link
                                href="/du-an"
                                className="text-[10px] font-black uppercase tracking-widest text-brand-primary border-b-2 border-brand-primary/20 pb-1 hover:border-brand-primary transition-all"
                            >
                                TẤT CẢ DỰ ÁN
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedProjects.map((proj) => (
                                <Link
                                    key={proj.id}
                                    href={`/du-an/${proj.slug}`}
                                    className="group bg-white overflow-hidden hover:translate-y-[-4px] transition-all duration-500 border border-slate-100 flex flex-col rounded-none"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 rounded-none">
                                        {proj.image_url ? (
                                            <Image
                                                src={proj.image_url}
                                                alt={proj.name}
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <Building size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary rounded-none">
                                            {proj.category || 'DỰ ÁN'}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col grow">
                                        <div className="text-[9px] font-bold text-slate-400 mb-2 flex items-center gap-2">
                                            <MapPin size={10} /> {proj.location || 'Việt Nam'}
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase line-clamp-2 leading-tight mb-4 grow tracking-tight">
                                            {proj.name}
                                        </h4>
                                        <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-brand-primary gap-1 group-hover:gap-2 transition-all">
                                            Xem chi tiết <MoveRight size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
