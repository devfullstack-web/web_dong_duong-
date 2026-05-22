'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

export default function SystemHighlight() {
    const t = useTranslations('SystemHighlight');

    const BANNERS_CONTENT = [
        {
            tag: t('banners.featured.tag'),
            title: t('banners.featured.title'),
            desc: t('banners.featured.desc'),
            btnText: t('banners.featured.btnText'),
            image: '/uploads/images/2026/01/19/1768814857344-hfho0c.png',
            url: '/san-pham',
        },
        {
            tag: t('banners.video.tag'),
            title: t('banners.video.title'),
            desc: t('banners.video.desc'),
            btnText: t('banners.video.btnText'),
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000',
            url: '/giai-phap/quan-ly-nuoc-thong-minh',
        },
    ];

    return (
        <section className="bg-white py-12 space-y-8">
            <div className="container mx-auto px-4 lg:px-8 space-y-8">
                {BANNERS_CONTENT.map((banner, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative h-100 overflow-hidden bg-slate-900"
                    >
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            sizes="100vw"
                            className="object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/40 to-transparent"></div>

                        <div className="absolute inset-0 container mx-auto px-12 py-16 flex flex-col justify-center space-y-6">
                            <div className="space-y-4 max-w-xl">
                                <p className="text-[10px] font-black tracking-[0.2em] text-brand-accent uppercase">
                                    {banner.tag}
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                    {banner.title}
                                </h2>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                    {banner.desc}
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button className="inline-flex items-center px-8 py-3 bg-brand-primary hover:cursor-pointer  text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-colors">
                                    {banner.btnText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
