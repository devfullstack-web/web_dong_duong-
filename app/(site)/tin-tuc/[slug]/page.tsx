'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    CalendarDays,
    User,
    Clock,
    ArrowLeft,
    Facebook,
    Linkedin,
    Twitter,
    MoveRight,
    Bookmark,
    Printer,
    Share2,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
    const [recentArticles, setRecentArticles] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articleRes, relatedRes, categoriesRes, recentRes] = await Promise.all([
                    $api.get(`${API_ROUTES.NEWS}/${params.slug}`),
                    $api.get(`${API_ROUTES.NEWS}?limit=3`),
                    $api.get(`${API_ROUTES.CATEGORIES}?type=news`),
                    $api.get(`${API_ROUTES.NEWS}?limit=5`),
                ]);

                if (articleRes.data.success) {
                    setArticle(articleRes.data.data);
                }
                if (relatedRes.data.success) {
                    setRelatedArticles(
                        relatedRes.data.data.filter((n: any) => n.slug !== params.slug).slice(0, 3),
                    );
                }
                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.data);
                }
                if (recentRes.data.success) {
                    setRecentArticles(recentRes.data.data);
                }
            } catch (error) {
                console.log('Error fetching news detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.slug]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/tin-tuc?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!article) return <div className="pt-44 text-center">Không tìm thấy bài viết</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Top Navigation & Breadcrumbs - Fixed pt-32 to avoid header overlap */}
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
                                        <Link href="/tin-tuc">Tin tức</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="max-w-[200px] truncate">
                                        {article.title}
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

            {/* Article Header */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary rounded-none">
                            {article.category}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-6 pt-4 border-t border-slate-100 social-meta text-slate-500">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Tác giả
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {article.author}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Ngày đăng
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {article.published_at
                                            ? format(new Date(article.published_at), 'dd/MM/yyyy', {
                                                  locale: vi,
                                              })
                                            : 'Đang cập nhật'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Thời gian đọc
                                    </div>
                                    <div className="text-xs font-bold text-slate-900">
                                        {article.readTime} đọc
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
                                <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-brand-primary pl-8">
                                    {article.summary}
                                </p>

                                <div
                                    className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand-primary hover:prose-a:text-brand-secondary prose-img:rounded-none"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            article.content ||
                                            `<p>Nội dung chi tiết đang được cập nhật...</p>`,
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
                                            <Bookmark size={14} /> Lưu bài viết
                                        </button>
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary px-5 py-2.5 hover:bg-brand-secondary transition-all rounded-none">
                                            Liên hệ tư vấn <MoveRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                            {/* Recent News */}
                            <div className="space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-brand-primary"></span> Tin mới
                                    nhất
                                </h3>
                                <div className="space-y-6">
                                    {recentArticles.map((news) => (
                                        <Link
                                            key={news.id}
                                            href={`/tin-tuc/${news.slug}`}
                                            className="group block space-y-2"
                                        >
                                            <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">
                                                {news.published_at
                                                    ? format(
                                                          new Date(news.published_at),
                                                          'dd/MM/yyyy',
                                                          { locale: vi },
                                                      )
                                                    : 'Đang cập nhật'}
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-snug tracking-tight">
                                                {news.title}
                                            </h4>
                                            <div className="h-px w-0 group-hover:w-full bg-slate-100 transition-all duration-500"></div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Relate News */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                BÀI VIẾT LIÊN QUAN
                            </h2>
                            <div className="h-1 w-20 bg-brand-primary mt-2"></div>
                        </div>
                        <Link
                            href="/tin-tuc"
                            className="text-[10px] font-black uppercase tracking-widest text-brand-primary border-b-2 border-brand-primary/20 pb-1 hover:border-brand-primary transition-all"
                        >
                            TẤT CẢ TIN TỨC
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedArticles.map((news) => (
                            <Link
                                key={news.id}
                                href={`/tin-tuc/${news.slug}`}
                                className="group bg-white overflow-hidden hover:translate-y-[-4px] transition-all duration-500 border border-slate-100 flex flex-col rounded-none"
                            >
                                <div className="relative aspect-16/10 overflow-hidden bg-slate-100 rounded-none">
                                    {news.image_url ? (
                                        <Image
                                            src={news.image_url}
                                            alt={news.title}
                                            fill
                                            unoptimized
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300">
                                            <CalendarDays size={32} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary rounded-none">
                                        {news.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col grow">
                                    <div className="text-[9px] font-bold text-slate-400 mb-2 flex items-center gap-2">
                                        <CalendarDays size={10} />{' '}
                                        {news.published_at
                                            ? format(new Date(news.published_at), 'dd/MM/yy', {
                                                  locale: vi,
                                              })
                                            : 'Đang cập nhật'}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase line-clamp-2 leading-tight mb-4 grow tracking-tight">
                                        {news.title}
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
        </div>
    );
}
