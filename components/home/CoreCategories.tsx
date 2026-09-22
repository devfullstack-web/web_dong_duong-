'use client';

import * as React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import {
    LayoutGrid,
    Wind,
    Disc,
    Activity,
    Layers,
    Cpu,
    Wrench,
    Building2,
    Sparkles,
    Grid,
    Package,
    Boxes,
    Flame,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { useLocale, useTranslations } from 'next-intl';
import TechSvgBackground from '@/components/ui/TechSvgBackground';

// Dynamic Icon Mapping
const ICON_MAP: Record<string, React.ElementType> = {
    LayoutGrid,
    Wind,
    Disc,
    Activity,
    Layers,
    Cpu,
    Wrench,
    Building2,
    Sparkles,
    Grid,
    Package,
    Boxes,
    Flame,
    ShieldCheck,
};

export interface CoreCategoryItem {
    id: string;
    name: string;
    name_localized?: {
        vi?: string;
        en?: string;
        zh?: string;
        subtitle?: string;
        subtitle_en?: string;
        subtitle_zh?: string;
        image_url?: string;
        icon?: string;
    } | null;
    display_order?: number;
}

interface Props {
    categories?: CoreCategoryItem[];
}

export default function CoreCategories({ categories = [] }: Props) {
    const locale = useLocale();
    const t = useTranslations('Home');

    // Embla Carousel with Autoplay & loop
    const autoplay = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
            breakpoints: {
                '(min-width: 640px)': { slidesToScroll: 2 },
                '(min-width: 1024px)': { slidesToScroll: 3 },
            },
        },
        [autoplay.current]
    );

    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const scrollPrev = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = React.useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = React.useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="py-16 sm:py-20 relative overflow-hidden bg-gradient-to-b from-white via-sky-50/20 to-white">
            {/* Tech Vector Grid with dynamic lighting */}
            <TechSvgBackground variant="ecommerce-grid" glowColor="cyan" className="absolute inset-0 z-0" />

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] uppercase tracking-tight">
                        {t('coreCategoriesTitle')}
                    </h2>
                    <div className="w-28 h-1.5 bg-[#D49B45] mx-auto mt-4 rounded-full" />
                </div>

                {/* Carousel Viewport with Side Arrows */}
                <div className="relative flex items-center gap-3 sm:gap-4">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Previous Category Slide"
                        className="w-12 h-12 rounded-full border border-sky-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer z-10"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>

                    {/* Embla Track */}
                    <div className="overflow-hidden flex-1 py-2" ref={emblaRef}>
                        <div className="flex -ml-5 sm:-ml-6 items-stretch">
                            {categories.map((cat) => {
                                const isZh = locale === 'zh';
                                const isEn = locale === 'en';
                                const title = (isZh && cat.name_localized?.zh) ? cat.name_localized.zh : (isEn && cat.name_localized?.en) ? cat.name_localized.en : (cat.name_localized?.vi || cat.name);
                                const subtitle = isZh
                                    ? (cat.name_localized?.subtitle_zh || '高标准工程建材与核心机电设备')
                                    : isEn
                                        ? (cat.name_localized?.subtitle_en || 'High-standard industrial products & equipment')
                                        : (cat.name_localized?.subtitle || 'Sản phẩm & thiết bị công nghiệp tiêu chuẩn cao');
                                const imageUrl =
                                    cat.name_localized?.image_url ||
                                    '/images/dongduong/cat-gachmen.png';
                                const iconKey = cat.name_localized?.icon || 'LayoutGrid';
                                const IconComponent = ICON_MAP[iconKey] || LayoutGrid;

                                return (
                                    <div
                                        key={cat.id}
                                        className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-5 sm:pl-6 min-w-0 flex flex-col items-stretch"
                                    >
                                        <Link
                                            href={`/san-pham?category=${cat.id}`}
                                            className="flex flex-col justify-between h-full min-h-[340px] sm:min-h-[380px] border-2 border-sky-400 rounded-3xl p-4 sm:p-5 bg-white shadow-md hover:shadow-xl hover:border-sky-500 transition-all duration-300 group hover:-translate-y-1"
                                        >
                                            {/* Image Top */}
                                            <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden mb-4 bg-slate-100 shrink-0">
                                                <Image
                                                    src={imageUrl}
                                                    alt={title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
                                            </div>

                                            {/* Content Bottom */}
                                            <div className="flex items-center gap-4 px-1 py-1 mt-auto">
                                                <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 text-[#D49B45] group-hover:scale-110 group-hover:bg-amber-100/70 transition-all">
                                                    <IconComponent className="w-7 h-7 stroke-[1.8]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-[#0B2545] tracking-wide truncate group-hover:text-sky-600 transition-colors">
                                                        {title}
                                                    </h3>
                                                    <p className="text-base sm:text-[17px] text-slate-700 font-medium truncate mt-1">
                                                        {subtitle}
                                                    </p>
                                                </div>
                                                <div className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Next Category Slide"
                        className="w-10 h-10 rounded-full border border-sky-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Bottom Pagination Indicator */}
                {scrollSnaps.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                            type="button"
                            onClick={scrollPrev}
                            className="text-slate-400 hover:text-sky-600 p-1 transition-colors cursor-pointer"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {scrollSnaps.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => scrollTo(i)}
                                aria-label={`Slide ${i + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    i === selectedIndex
                                        ? 'w-7 bg-sky-600'
                                        : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                                }`}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={scrollNext}
                            className="text-slate-400 hover:text-sky-600 p-1 transition-colors cursor-pointer"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
