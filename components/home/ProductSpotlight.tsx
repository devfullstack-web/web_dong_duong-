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
import { motion } from 'motion/react';
import Autoplay from 'embla-carousel-autoplay';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

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

    if (products.length === 0) return null;

    return (
        <section className="bg-slate-50 py-12 lg:py-16 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header - More Compact */}
                <div className="flex items-end justify-between gap-4 mb-10">
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2"
                        >
                            <div className="h-px w-6 bg-brand-primary"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary">
                                {commonT('featuredProducts', {
                                    defaultValue: 'SẢN PHẨM TIÊU BIỂU',
                                })}
                            </span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight"
                        >
                            GIẢI PHÁP <span className="text-brand-primary">THIẾT BỊ</span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            href="/san-pham"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors group"
                        >
                            Tất cả{' '}
                            <ArrowRight
                                size={14}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </Link>
                    </motion.div>
                </div>

                {/* Products Carousel */}
                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                            stopOnInteraction: false,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                                <Link
                                    href={`/san-pham/${product.slug}`}
                                    className="p-4 flex flex-col items-center text-center space-y-6 group"
                                >
                                    <div className="relative aspect-square w-full max-w-75 transition-transform duration-500 group-hover:scale-110">
                                        <Image
                                            src={
                                                product.image_url ||
                                                '/images/placeholder-product.png'
                                            }
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight min-h-10 flex items-center justify-center">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            {t('productDetail')}
                                        </div>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Compact Navigation */}
                    <div className="hidden lg:flex items-center gap-2 mt-8 justify-center">
                        <CarouselPrevious className="static translate-y-0 h-8 w-8 border-slate-200 hover:bg-brand-primary hover:text-white transition-all" />
                        <CarouselNext className="static translate-y-0 h-8 w-8 border-slate-200 hover:bg-brand-primary hover:text-white transition-all" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
