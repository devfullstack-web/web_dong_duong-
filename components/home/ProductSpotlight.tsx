'use client';

import * as React from 'react';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    description: string;
}

interface ProductSpotlightProps {
    products?: Product[];
}

export default function ProductSpotlight({ products = [] }: ProductSpotlightProps) {
    const t = useTranslations('ProductSpotlight');
    const commonT = useTranslations('Common');
    const activeLocale = useLocale();

    if (products.length === 0) return null;

    return (
        <section className="bg-slate-50 py-16 overflow-hidden border-t border-b border-slate-100">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header - Highly Polished & Structured */}
                <div className="flex items-end justify-between gap-4 mb-10 border-b border-slate-100 pb-6">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                            {commonT('featuredProducts', {
                                defaultValue: 'SẢN PHẨM TIÊU BIỂU',
                            })}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                            GIẢI PHÁP <span className="text-brand-primary">THIẾT BỊ NỔI BẬT</span>
                        </h2>
                    </div>

                    <Link
                        href="/san-pham"
                        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors group pb-1"
                    >
                        <span>{activeLocale === 'vi' ? 'Xem tất cả' : 'View all'}</span>
                        <ArrowRight
                            size={12}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                {/* Products Carousel - Golden Grid Ratio */}
                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4500,
                            stopOnInteraction: false,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4 lg:-ml-6">
                        {products.map((product) => {
                            // Strip HTML tags and decode HTML entities for clean layout
                            const cleanDescription = product.description 
                                ? product.description
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .trim()
                                : '';

                            const fallbackDescription = activeLocale === 'vi' 
                                ? 'Thiết bị van công nghiệp cao cấp phục vụ đa dạng hạ tầng kỹ thuật.'
                                : 'Premium industrial valve equipment for diverse engineering infrastructures.';

                            return (
                                <CarouselItem 
                                    key={product.id} 
                                    className="pl-4 lg:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4"
                                >
                                    <Link
                                        href={`/san-pham/${product.slug}`}
                                        className="block group bg-white border border-slate-200/80 hover:border-brand-primary hover:shadow-md transition-all duration-300 rounded-none h-full"
                                    >
                                        {/* High-quality Comfortable Image Box */}
                                        <div className="relative h-36 sm:h-40 md:h-44 w-full bg-slate-50/30 flex items-center justify-center p-6 overflow-hidden rounded-none border-b border-slate-100">
                                            <Image
                                                src={
                                                    product.image_url ||
                                                    'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                }
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                                className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                                            />
                                        </div>

                                        {/* Content Info Box - Balanced & Detailed */}
                                        <div className="p-4 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                {/* Micro Subtitle Tag for context */}
                                                <div className="text-[9px] font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                                                    <ShieldCheck size={10} className="text-brand-accent shrink-0" />
                                                    <span>SAIGON VALVE STANDARD</span>
                                                </div>

                                                {/* Product Title - Distinct & Clear */}
                                                <h3 className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight line-clamp-1 leading-snug group-hover:text-brand-primary transition-colors">
                                                    {product.name}
                                                </h3>

                                                {/* Compact Single-line Description with HTML stripped */}
                                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1 leading-relaxed">
                                                    {cleanDescription || fallbackDescription}
                                                </p>
                                            </div>

                                            {/* Action link with border top */}
                                            <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors pt-3 border-t border-slate-100 w-full mt-3">
                                                <span>{activeLocale === 'vi' ? 'Xem chi tiết' : 'View details'}</span>
                                                <ArrowRight size={10} className="ml-auto transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>

                    {/* Premium Engineered Arrow Controls */}
                    <div className="hidden lg:flex items-center gap-2 mt-8 justify-center">
                        <CarouselPrevious className="static translate-y-0 h-8 w-8 rounded-none border border-slate-200 bg-white hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 shadow-sm" />
                        <CarouselNext className="static translate-y-0 h-8 w-8 rounded-none border border-slate-200 bg-white hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300 shadow-sm" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
