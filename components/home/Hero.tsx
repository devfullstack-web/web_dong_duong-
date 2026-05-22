'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface HeroProduct {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
}

interface HeroProps {
    products?: HeroProduct[];
}

export default function Hero({ products = [] }: HeroProps) {
    const t = useTranslations('Hero');
    const tc = useTranslations('Common');
    const [current, setCurrent] = React.useState(0);
    const [, setDirection] = React.useState(0);

    const SLIDES_CONTENT = React.useMemo(
        () => [
            {
                type: 'video',
                src: '/videos/hero-background.mp4',
                title: t('slide1.title'),
                highlight: t('slide1.highlight'),
                titleSuffix: t('slide1.titleSuffix'),
                desc: t('slide1.description'),
                accent: t('slide1.accent'),
            },
            {
                type: 'image',
                src: '/uploads/images/2026/03/14/diagram-scada.png',
                title: t('slide2.title'),
                highlight: t('slide2.highlight'),
                titleSuffix: t('slide2.titleSuffix'),
                desc: t('slide2.description'),
                accent: t('slide2.accent'),
            },
            {
                type: 'image',
                src: '/uploads/images/2026/03/14/scada2.png',
                title: t('slide3.title'),
                highlight: t('slide3.highlight'),
                titleSuffix: t('slide3.titleSuffix'),
                desc: t('slide3.description'),
                accent: t('slide3.accent'),
            },
            {
                type: 'image',
                src: '/uploads/images/2026/03/14/scada4.png',
                title: t('slide3.title'),
                highlight: t('slide3.highlight'),
                titleSuffix: t('slide3.titleSuffix'),
                desc: t('slide3.description'),
                accent: t('slide3.accent'),
            },
        ],
        [t],
    );

    React.useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % SLIDES_CONTENT.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [SLIDES_CONTENT.length]);

    return (
        <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden ">
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

            {/* Slide-Specific Overlays */}
            <div className="absolute inset-0 z-10">
                <AnimatePresence initial={false}>
                    {SLIDES_CONTENT[current].type === 'image' && (
                        <motion.div
                            key={`image-overlay-${current}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            className="absolute inset-0 overflow-hidden"
                        >
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#1e293b_0%,transparent_70%)] opacity-20" />
                                <div className="absolute inset-0 bg-size-[60px_60px] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)]" />

                                <div className="absolute inset-0 flex items-end lg:items-center justify-center lg:justify-end pb-8 lg:pb-0 lg:py-32 px-4 sm:px-8 lg:px-24">
                                    <div className="relative w-full lg:w-[45%] h-[40%] sm:h-[45%] lg:h-full flex items-center justify-center lg:justify-end">
                                        <Image
                                            src={SLIDES_CONTENT[current].src}
                                            alt={SLIDES_CONTENT[current].title}
                                            fill
                                            priority={current === 0}
                                            sizes="(max-width: 1024px) 100vw, 45vw"
                                            className="object-contain object-bottom lg:object-right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="container relative z-10 mx-auto h-full px-4 lg:px-8">
                <div className="flex h-full flex-col items-center lg:items-start justify-start lg:justify-center pt-32 sm:pt-40 lg:pt-16">
                    <div className="max-w-4xl w-full space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase text-center lg:text-left">
                                    {SLIDES_CONTENT[current].title} <br />
                                    <span className="text-brand-accent">
                                        {SLIDES_CONTENT[current].highlight}
                                    </span>{' '}
                                    <br />
                                    <span className="text-white/60">
                                        {SLIDES_CONTENT[current].titleSuffix}
                                    </span>
                                </h1>

                                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-4">
                                    <Link
                                        href="/san-pham"
                                        className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-3 lg:py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:bg-brand-secondary w-full sm:w-auto"
                                    >
                                        <span className="relative z-10">{tc('exploreNow')}</span>
                                        <MoveRight
                                            size={14}
                                            className="relative z-10 transition-transform group-hover:translate-x-1"
                                        />
                                    </Link>
                                    <Link
                                        href="/gioi-thieu"
                                        className="inline-flex items-center justify-center gap-3 px-8 py-3 lg:py-4 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all backdrop-blur-sm rounded-sm w-full sm:w-auto"
                                    >
                                        {t('actionAdvice')}
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Featured Products - data from server, no client fetch */}
                        {products.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col items-center lg:items-start gap-4 max-sm:hidden"
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                                        {tc('featuredProducts', {
                                            defaultValue: 'Sản phẩm nổi bật',
                                        })}
                                    </h3>
                                    <div className="w-12 sm:w-16 h-px bg-brand-accent/50"></div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/san-pham/${product.slug}`}
                                            className="group relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28  overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 hover:border-brand-accent hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all duration-500"
                                        >
                                            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/10 transition-colors duration-500 z-0"></div>
                                            <div className="relative w-full h-full p-2 z-10 flex items-center justify-center">
                                                {product.image_url && (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 112px"
                                                        className="object-contain p-2 sm:p-2.5 drop-shadow-xl group-hover:scale-[1.15] transition-transform duration-500"
                                                    />
                                                )}
                                            </div>

                                            <div className="absolute inset-x-0 bottom-0 p-1 sm:p-1.5 bg-linear-to-t from-black/80 via-black/50 to-transparent text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex">
                                                <span className="text-[8px] sm:text-[9px] font-semibold tracking-wide truncate w-full text-center drop-shadow-md">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Slide Indicators */}
                        <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                            {SLIDES_CONTENT.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDirection(i > current ? 1 : -1);
                                        setCurrent(i);
                                    }}
                                    className={cn(
                                        'h-1 rounded-full transition-all duration-500',
                                        current === i
                                            ? 'w-12 bg-brand-accent shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                                            : 'w-6 bg-white/30 hover:bg-white/50',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-12 left-4 lg:left-12 z-20 flex-col items-start gap-4 hidden md:flex"
            >
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">
                        0{current + 1} / 0{SLIDES_CONTENT.length}
                    </span>
                    <div className="w-24 h-px bg-white/20">
                        <motion.div
                            className="h-full bg-brand-accent shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            initial={{ width: 0 }}
                            animate={{
                                width: `${((current + 1) / SLIDES_CONTENT.length) * 100}%`,
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
