'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export interface HeroSlide {
    id: string;
    title: string;
    highlight?: string;
    subtitle: string;
    image_url: string;
    badge?: string;
    cta_primary?: { text: string; link: string };
    cta_secondary?: { text: string; link: string };
}

interface Props {
    slides?: HeroSlide[];
}

export default function DongDuongHero({ slides = [] }: Props) {
    const autoplay = React.useRef(
        Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 25 }, [autoplay.current]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

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
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    if (!slides || slides.length === 0) {
        return null;
    }

    const currentSlide = slides[selectedIndex] || slides[0];
    const primaryCta = slides[0]?.cta_primary || { text: 'NHẬN BÁO GIÁ DỰ ÁN', link: '#quote-form' };
    const secondaryCta = slides[0]?.cta_secondary || { text: 'DANH MỤC SẢN PHẨM', link: '/san-pham' };

    return (
        <section className="relative w-full overflow-hidden bg-slate-950 pt-20 sm:pt-24 lg:pt-28 pb-14 sm:pb-16 lg:pb-20 h-[640px] sm:h-[680px] lg:h-[720px] flex items-center justify-center">
            {/* Embla Carousel Viewport */}
            <div className="absolute inset-0 z-0 overflow-hidden" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, idx) => (
                        <div
                            key={slide.id}
                            className="relative flex-[0_0_100%] h-full min-w-0 select-none overflow-hidden"
                        >
                            <Image
                                src={slide.image_url}
                                alt={slide.title}
                                fill
                                priority
                                sizes="100vw"
                                className={`object-cover object-center transition-transform duration-7000 ease-out ${
                                    idx === selectedIndex ? 'scale-105 opacity-85' : 'scale-100 opacity-60'
                                }`}
                            />
                            {/* Gradient overlays for high text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/80" />
                            <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/30 to-slate-950/70" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Slide Content Overlay with Locked Equal Height */}
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
                    {/* Dynamic Text Section with Overlapping Grid: Completely Eliminates Vertical Jumping */}
                    <div className="w-full grid grid-cols-1 grid-rows-1 items-center justify-items-center min-h-[290px] sm:min-h-[310px] lg:min-h-[330px]">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={selectedIndex}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="col-start-1 row-start-1 w-full flex flex-col items-center justify-center space-y-4 sm:space-y-5"
                            >
                                {/* Slide Badge Slot */}
                                <div className="h-8 flex items-center justify-center">
                                    {currentSlide?.badge ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{currentSlide.badge}</span>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Main Heading Slot */}
                                <div className="min-h-[85px] sm:min-h-[105px] lg:min-h-[120px] flex items-center justify-center">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.15] drop-shadow-lg text-center">
                                        {currentSlide?.title} <br />
                                        {currentSlide?.highlight && (
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#E5B869] to-amber-300">
                                                {currentSlide.highlight}
                                            </span>
                                        )}
                                    </h1>
                                </div>

                                {/* Subtitle Slot */}
                                <div className="min-h-[48px] sm:min-h-[56px] flex items-center justify-center max-w-2xl mx-auto">
                                    <p className="text-sm sm:text-base md:text-lg text-slate-100/95 font-medium leading-relaxed drop-shadow text-center line-clamp-3">
                                        {currentSlide?.subtitle}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Action CTA Buttons: 100% Fixed Dimensions, Position & Identical across every transition */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6 w-full shrink-0">
                        <a
                            href={primaryCta.link}
                            className="w-full sm:w-[260px] h-[52px] inline-flex items-center justify-center px-6 bg-gradient-to-r from-[#E5B869] to-[#D49B45] hover:from-[#ECC880] hover:to-[#DEAE5A] text-slate-950 text-sm sm:text-[15px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/40 hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-center whitespace-nowrap"
                        >
                            {primaryCta.text}
                        </a>
                        <a
                            href={secondaryCta.link}
                            className="w-full sm:w-[260px] h-[52px] inline-flex items-center justify-center px-6 bg-[#EED690] hover:bg-[#F5E0A6] text-slate-950 text-sm sm:text-[15px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/20 transition-all duration-300 transform hover:-translate-y-0.5 select-none text-center whitespace-nowrap"
                        >
                            {secondaryCta.text}
                        </a>
                    </div>
                </div>
            </div>

            {/* Side Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Previous Slide"
                        className="hidden md:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm items-center justify-center transition-all cursor-pointer hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Next Slide"
                        className="hidden md:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm items-center justify-center transition-all cursor-pointer hover:scale-110"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Bottom Slide Indicators & Slide Counter */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-md">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => scrollTo(i)}
                                aria-label={`Banner slide ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                    i === selectedIndex
                                        ? 'w-8 bg-[#E5B869]'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        ))}
                        <span className="text-[11px] font-bold text-slate-300 pl-2 border-l border-white/20">
                            0{selectedIndex + 1} / 0{slides.length}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}
