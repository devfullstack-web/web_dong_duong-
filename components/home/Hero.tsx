'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { MoveRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Hero() {
    const t = useTranslations('Hero');
    const tc = useTranslations('Common');

    const HERO_COPY = React.useMemo(
        () => ({
            title: t('fixed.title'),
            highlight: t('fixed.highlight'),
            titleSuffix: t('fixed.titleSuffix'),
        }),
        [t],
    );

    return (
        <section className="relative h-[62svh] min-h-[440px] max-h-[560px] w-full overflow-hidden sm:h-[66svh] sm:min-h-[500px] sm:max-h-[620px] lg:h-[85vh] lg:min-h-[600px] lg:max-h-none">
            {/* Video Background - preload="none" to avoid blocking LCP */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    src="/videos/hero-background.mp4"
                />
            </div>

            <div className="container relative z-10 mx-auto h-full px-4 lg:px-8">
                <div className="flex h-full flex-col items-center justify-center pb-10 pt-20 sm:pb-12 sm:pt-24 lg:pb-0 lg:pt-16">
                    <div className="max-w-4xl w-full space-y-6 sm:space-y-8 text-center">
                        <div className="space-y-6">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase text-center">
                                {HERO_COPY.title} <br />
                                <span className="text-brand-accent">
                                    {HERO_COPY.highlight}
                                </span>{' '}
                                <br />
                                <span className="text-white/60">
                                    {HERO_COPY.titleSuffix}
                                </span>
                            </h1>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    href="#technology-overview"
                                    className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-3 lg:py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:bg-brand-secondary w-full sm:w-auto"
                                >
                                    <span className="relative z-10">{tc('exploreNow')}</span>
                                    <MoveRight
                                        size={14}
                                        className="relative z-10 transition-transform group-hover:translate-x-1"
                                    />
                                </Link>
                                <Link
                                    href="#contact"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-3 lg:py-4 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all backdrop-blur-sm rounded-sm w-full sm:w-auto"
                                >
                                    {t('actionAdvice')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
