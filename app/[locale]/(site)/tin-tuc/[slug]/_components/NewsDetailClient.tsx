'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { vi, enUS, zhCN } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { getLocalizedValue, type Locale } from '@/types/i18n';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { sanitizeRichText } from '@/utils/sanitize';

interface NewsDetailClientProps {
    article: {
        id: string;
        title: string;
        summary: string;
        content: string;
        author: string;
        category: string;
        readTime: string;
        published_at?: string | Date | null;
        image_url?: string | null;
        gallery?: string[] | null;
    };
    relatedArticles: {
        id: string;
        title: string;
        title_localized?: LocalizedText | null;
        slug: string;
        summary: string;
        summary_localized?: LocalizedText | null;
        image_url?: string | null;
        published_at?: string | Date | null;
        category_name?: string | null;
    }[];
    recentArticles: {
        id: string;
        title: string;
        title_localized?: LocalizedText | null;
        slug: string;
        summary: string;
        summary_localized?: LocalizedText | null;
        image_url?: string | null;
        published_at?: string | Date | null;
        category_name?: string | null;
    }[];
}

export default function NewsDetailClient({
    article,
    relatedArticles,
    recentArticles,
}: NewsDetailClientProps) {
    const router = useRouter();
    const locale = useLocale();
    const isVi = locale === 'vi';
    const isZh = locale === 'zh';
    const dateLocale = isZh ? zhCN : isVi ? vi : enUS;

    const tLabel = (viText: string, enText: string, zhText: string) => {
        if (isZh) return zhText;
        if (isVi) return viText;
        return enText;
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Top Navigation & Breadcrumbs */}
            <section className="pt-44 pb-6 border-b border-slate-100">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">{tLabel('Trang chủ', 'Home', '首页')}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/tin-tuc">{tLabel('Tin tức', 'News', '新闻资讯')}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="max-w-[200px] truncate text-xs sm:text-sm font-medium">
                                        {article.title}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <button
                            onClick={() => router.back()}
                            className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors"
                        >
                            <ArrowLeft size={14} /> {tLabel('Quay lại', 'Back', '返回')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Article Header */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="space-y-6">
                        <div className="inline-flex items-center bg-brand-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-brand-primary rounded-none">
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
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {tLabel('Tác giả', 'Author', '作者')}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                                        {article.author}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <CalendarDays size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {tLabel('Ngày đăng', 'Publish date', '发布日期')}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                                        {article.published_at
                                            ? format(new Date(article.published_at), 'dd/MM/yyyy', {
                                                  locale: dateLocale,
                                              })
                                            : tLabel('Đang cập nhật', 'Updating', '更新中')}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-none border border-slate-100">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        {tLabel('Thời gian đọc', 'Read time', '阅读时长')}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                                        {article.readTime}
                                    </div>
                                </div>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    title={tLabel('Chia sẻ', 'Share', '分享')}
                                    className="h-9 w-9 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all rounded-none"
                                >
                                    <Share2 size={16} />
                                </button>
                                <button
                                    title={tLabel('In', 'Print', '打印')}
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
                                        __html: sanitizeRichText(
                                            article.content ||
                                                `<p>${tLabel('Nội dung chi tiết đang được cập nhật...', 'Detail content is being updated...', '详细内容正在持续更新中...')}</p>`,
                                        ),
                                    }}
                                />

                                {/* Share & Actions */}
                                <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {tLabel('Chia sẻ:', 'Share:', '分享:')}
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
                                        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-5 py-2.5 hover:bg-slate-200 transition-all rounded-none border border-slate-100">
                                            <Bookmark size={14} /> {tLabel('Lưu bài viết', 'Save article', '收藏文章')}
                                        </button>
                                        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-brand-primary px-5 py-2.5 hover:bg-brand-secondary transition-all rounded-none">
                                            {tLabel('Liên hệ tư vấn', 'Contact Support', '咨询专家')} <MoveRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-12">
                            {/* Recent News */}
                            <div className="space-y-8">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-brand-primary"></span> {tLabel('Tin mới nhất', 'Latest News', '最新资讯')}
                                </h3>
                                <div className="space-y-6">
                                    {recentArticles.map((news) => {
                                        const newsTitle = getLocalizedValue(news.title_localized, locale as Locale) || news.title;
                                        return (
                                            <Link
                                                key={news.id}
                                                href={`/tin-tuc/${news.slug}`}
                                                className="group block space-y-2"
                                            >
                                                <div className="text-xs font-bold text-brand-primary/80 uppercase tracking-wider">
                                                    {news.published_at
                                                        ? format(
                                                              new Date(news.published_at),
                                                              'dd/MM/yyyy',
                                                              { locale: dateLocale },
                                                          )
                                                        : tLabel('Đang cập nhật', 'Updating', '更新中')}
                                                </div>
                                                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-snug tracking-tight">
                                                    {newsTitle}
                                                </h4>
                                                <div className="h-px w-0 group-hover:w-full bg-slate-100 transition-all duration-500"></div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Related News */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                                {tLabel('BÀI VIẾT LIÊN QUAN', 'RELATED ARTICLES', '相关文章推荐')}
                            </h2>
                            <div className="h-1 w-20 bg-brand-primary mt-2"></div>
                        </div>
                        <Link
                            href="/tin-tuc"
                            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-primary border-b-2 border-brand-primary/20 pb-1 hover:border-brand-primary transition-all"
                        >
                            {tLabel('TẤT CẢ TIN TỨC', 'ALL NEWS', '查看全部新闻')}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedArticles.slice(0, 3).map((news) => {
                            const newsTitle = getLocalizedValue(news.title_localized, locale as Locale) || news.title;
                            return (
                                <Link
                                    key={news.id}
                                    href={`/tin-tuc/${news.slug}`}
                                    className="group bg-white overflow-hidden hover:translate-y-[-4px] transition-all duration-500 border border-slate-100 flex flex-col rounded-none"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100 rounded-none">
                                        {news.image_url ? (
                                            <Image
                                                src={news.image_url}
                                                alt={newsTitle}
                                                fill
                                                unoptimized
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-300">
                                                <CalendarDays size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-primary rounded-none">
                                            {news.category_name || tLabel('Tin tức', 'News', '新闻资讯')}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col grow">
                                        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                                            <CalendarDays size={13} />{' '}
                                            {news.published_at
                                                ? format(new Date(news.published_at), 'dd/MM/yy', {
                                                      locale: dateLocale,
                                                  })
                                                : tLabel('Đang cập nhật', 'Updating', '更新中')}
                                        </div>
                                        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors uppercase line-clamp-2 leading-tight mb-4 grow tracking-tight">
                                            {newsTitle}
                                        </h4>
                                        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-brand-primary gap-1 group-hover:gap-2 transition-all">
                                            {tLabel('Xem chi tiết', 'View details', '阅读全文')} <MoveRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
