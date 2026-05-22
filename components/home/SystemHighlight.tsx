'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function SystemHighlight() {
    const t = useTranslations('SystemHighlight');

    const HIGHLIGHTS = [
        {
            tag: t('banners.featured.tag'),
            title: t('banners.featured.title'),
            desc: t('banners.featured.desc'),
            btnText: t('banners.featured.btnText'),
            image: '/uploads/images/2026/03/14/diagram-scada.png',
            url: '/giai-phap',
            accent: 'bg-brand-primary',
        },
        {
            tag: t('banners.video.tag'),
            title: 'HỆ THỐNG QUAN TRẮC IOT & SCADA',
            desc: t('banners.video.desc'),
            btnText: t('banners.video.btnText'),
            image: '/images/banners/481264911_591002697270931_5782673037351412801_n.jpg',
            url: '/giai-phap/quan-ly-nuoc-thong-minh',
            accent: 'bg-slate-800',
        },
    ];

    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8 space-y-16 lg:space-y-24">
                {HIGHLIGHTS.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
                    >
                        {/* Image column */}
                        <div className="relative w-full lg:w-1/2 h-72 lg:h-[420px] overflow-hidden rounded-sm shrink-0">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-1000 hover:scale-105"
                            />
                            <div className={`absolute inset-0 ${item.accent} opacity-10`} />
                        </div>

                        {/* Content column */}
                        <div className="w-full lg:w-1/2 space-y-6">
                            <p className="text-[10px] font-black tracking-[0.2em] text-brand-primary uppercase flex items-center gap-2">
                                <span className="w-6 h-px bg-brand-primary inline-block" />
                                {item.tag}
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                                {item.title}
                            </h2>
                            <p className="text-sm lg:text-base text-slate-500 font-medium leading-relaxed">
                                {item.desc}
                            </p>

                            <div className="pt-2">
                                <Link
                                    href={item.url}
                                    className="inline-flex items-center gap-4 px-10 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 group"
                                >
                                    {item.btnText}{' '}
                                    <ArrowRight
                                        size={14}
                                        className="transition-transform group-hover:translate-x-2"
                                    />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Công nghệ
                                    </div>
                                    <div className="text-xs font-bold text-slate-800">
                                        SCADA / IoT Cloud
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Ứng dụng
                                    </div>
                                    <div className="text-xs font-bold text-slate-800">
                                        Quản lý mạng lưới
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
