'use client';

import * as React from 'react';
import Image from 'next/image';
import { MoveRight, Newspaper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'motion/react';

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    summary: string;
    category_id?: string;
    image_url?: string | null;
    published_at?: Date | null;
    created_at: Date;
}

interface NewsProps {
    articles?: NewsArticle[];
}

function formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function News({ articles = [] }: NewsProps) {
    const t = useTranslations('News');
    const tc = useTranslations('Common');

    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="mb-20 text-center space-y-4">
                    <h2 className="text-4xl font-bold text-brand-secondary tracking-tight uppercase">
                        {t('title')}
                    </h2>
                    <div className="mx-auto h-1 w-20 bg-brand-primary"></div>
                    <p className="mx-auto max-w-2xl text-muted-foreground font-medium">
                        {t('description')}
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                        <Newspaper size={48} className="mb-4 opacity-30" />
                        <p className="text-sm font-medium">{t('noNews')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {articles.map((item, i) => (
                            <motion.article
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative h-[300px] overflow-hidden cursor-pointer bg-slate-100"
                            >
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                                        <Newspaper size={48} className="text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

                                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-brand-primary">
                                        Tin tức
                                        <span className="h-1 w-1 rounded-full bg-brand-primary/20"></span>
                                        {formatDate(item.published_at || item.created_at)}
                                    </div>
                                    <h3 className="text-[15px] font-bold text-white leading-tight transition-colors group-hover:text-white line-clamp-2 uppercase">
                                        {item.title}
                                    </h3>
                                </div>

                                <Link
                                    href={`/tin-tuc/${item.slug}`}
                                    className="absolute inset-0 z-10"
                                >
                                    <span className="sr-only">Đọc tiếp {item.title}</span>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Link href="/tin-tuc" className="inline-flex items-center gap-2 btn-corporate">
                        {tc('viewAll')}
                        <MoveRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
