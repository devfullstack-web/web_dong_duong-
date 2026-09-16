'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/routing';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

import { useTranslations, useLocale } from 'next-intl';

export interface FeaturedProductData {
    id: string;
    name: string;
    name_localized?: { vi?: string; en?: string; zh?: string } | null;
    slug: string;
    image_url?: string | null;
    gallery?: string[] | null;
    description?: string | null;
    description_localized?: { vi?: string; en?: string; zh?: string } | null;
    price?: string | null;
    tech_specs?: Record<string, string> | null;
}

interface Props {
    products?: FeaturedProductData[];
}

function ProductCard({ product }: { product: FeaturedProductData }) {
    // Combine main image and gallery images into a unique list
    const images = React.useMemo(() => {
        const list: string[] = [];
        if (product.image_url) list.push(product.image_url);
        if (product.gallery && Array.isArray(product.gallery)) {
            product.gallery.forEach((img) => {
                if (img && !list.includes(img)) list.push(img);
            });
        }
        return list.length > 0 ? list : ['/images/dongduong/prod-bom.png'];
    }, [product.image_url, product.gallery]);

    const [activeImgIndex, setActiveImgIndex] = React.useState(0);

    const formattedPrice = React.useMemo(() => {
        if (!product.price || Number(product.price) <= 0) return null;
        return `${Number(product.price).toLocaleString('vi-VN')} VNĐ`;
    }, [product.price]);

    const locale = useLocale();
    const t = useTranslations('Home');

    const localizedName = (locale === 'zh' ? product.name_localized?.zh : locale === 'en' ? product.name_localized?.en : product.name_localized?.vi) || product.name;
    const localizedDesc = (locale === 'zh' ? product.description_localized?.zh : locale === 'en' ? product.description_localized?.en : product.description_localized?.vi) || product.description || (locale === 'zh' ? '国际高品质工程建材与暖通机电设备。' : locale === 'en' ? 'International standard industrial equipment.' : 'Thiết bị công nghiệp cao cấp tiêu chuẩn quốc tế.');

    return (
        <div className="h-full border-2 border-sky-300/80 hover:border-sky-500 rounded-3xl p-5 bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-5 group relative overflow-hidden">
            {/* Top Accent Gradient Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-amber-400 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Product Image & Multi-Image Gallery Switcher */}
            <div className="relative w-full sm:w-44 flex flex-col items-center shrink-0">
                {/* Main Active Image Viewport */}
                <div className="relative w-full h-36 sm:h-40 bg-gradient-to-b from-sky-50/80 to-white rounded-2xl p-2 flex items-center justify-center overflow-hidden border border-sky-100">
                    <div className="relative w-full h-full">
                        <Image
                            key={images[activeImgIndex]}
                            src={images[activeImgIndex]}
                            alt={localizedName}
                            fill
                            sizes="176px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Multi-image Count Badge */}
                    {images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>{activeImgIndex + 1}/{images.length}</span>
                        </div>
                    )}
                </div>

                {/* Multiple Image Thumbnails Slider / Switcher */}
                {images.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 mt-2.5 w-full">
                        {images.slice(0, 4).map((img, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImgIndex(idx)}
                                onMouseEnter={() => setActiveImgIndex(idx)}
                                aria-label={`Xem ảnh ${idx + 1}`}
                                className={`relative w-8 h-8 rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                                    idx === activeImgIndex
                                        ? 'border-sky-600 ring-2 ring-sky-300 ring-offset-1 scale-105'
                                        : 'border-slate-200 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <Image
                                    src={img}
                                    alt=""
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Content Right */}
            {/* Product Content Right */}
            <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3.5 w-full">
                {/* Tech Model / Sku Badge */}
                {product.tech_specs?.Model && (
                    <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-sky-800 bg-sky-50 px-3.5 py-1 rounded-lg border border-sky-200">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Model: {product.tech_specs.Model}
                    </span>
                )}

                {/* Title */}
                <Link
                    href={`/san-pham/${product.slug}` as any}
                    className="group-hover:text-sky-600 transition-colors"
                >
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-[#0B2545] tracking-tight line-clamp-2 leading-snug">
                        {localizedName}
                    </h3>
                </Link>

                {/* Price / Specs Description */}
                <div className="space-y-2 w-full">
                    {formattedPrice ? (
                        <p className="text-lg font-extrabold text-amber-800">
                            {t('price')}: <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#D49B45] tracking-tight">{formattedPrice}</span>
                        </p>
                    ) : null}
                    <p className="text-base sm:text-lg text-slate-700 font-medium line-clamp-2 leading-relaxed">
                        {localizedDesc}
                    </p>
                </div>

                {/* Actions: Quote Button & Details Link */}
                <div className="flex items-center gap-3 pt-2 w-full justify-center sm:justify-start">
                    <a
                        href="#quote-form"
                        className="inline-flex items-center justify-center px-7 py-3.5 sm:py-4 bg-gradient-to-r from-[#E5B869] to-[#D49B45] hover:from-[#ECC880] hover:to-[#DEAE5A] text-slate-950 text-base sm:text-lg font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        {t('requestQuote')}
                    </a>
                    <Link
                        href={`/san-pham/${product.slug}` as any}
                        className="inline-flex items-center justify-center p-3 sm:p-4 rounded-xl border-2 border-slate-300 hover:border-sky-400 hover:bg-sky-50 text-slate-800 hover:text-sky-600 transition-all text-base font-bold active:scale-[0.98]"
                        title={t('seeDetail')}
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function FeaturedProductSlider({ products = [] }: Props) {
    const t = useTranslations('Home');

    // Embla Carousel Hook with loop & autoplay
    const autoplay = React.useRef(
        Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
            breakpoints: {
                '(min-width: 768px)': { slidesToScroll: 2 },
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

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section id="featured-products" className="py-14 sm:py-16 relative bg-white border-b border-slate-100 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                {/* Section Header matching Mockup 1 */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] uppercase tracking-tight">
                        {t('featuredProductsTitle')}
                    </h2>
                    <div className="w-28 h-1.5 bg-[#D49B45] mx-auto mt-4 rounded-full" />
                </div>

                {/* Carousel Container with Side Navigation */}
                <div className="relative flex items-center gap-3 sm:gap-4">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={scrollPrev}
                        aria-label="Previous Slide"
                        className="w-10 h-10 rounded-full border border-sky-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer z-10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Embla Viewport */}
                    <div className="overflow-hidden flex-1 py-2" ref={emblaRef}>
                        <div className="flex -ml-4 sm:-ml-6">
                            {products.map((prod) => (
                                <div
                                    key={prod.id}
                                    className="flex-[0_0_100%] md:flex-[0_0_50%] pl-4 sm:pl-6 min-w-0"
                                >
                                    <ProductCard product={prod} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={scrollNext}
                        aria-label="Next Slide"
                        className="w-10 h-10 rounded-full border border-sky-300 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all cursor-pointer z-10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Bottom Pagination Dots Indicator matching Mockup 1: < ● ● ● ● > */}
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
                                aria-label={`Trang ${i + 1}`}
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
