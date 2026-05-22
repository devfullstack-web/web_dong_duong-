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

    if (products.length === 0) return null;

    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 lg:px-8 text-center sm:text-left">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl font-black text-brand-secondary uppercase tracking-wider mb-16"
                >
                    {t('title')}
                </motion.h2>

                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 3000,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full relative px-12"
                >
                    <CarouselContent>
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
                    <CarouselPrevious className="hidden sm:flex -left-4 size-14 border-none bg-transparent hover:bg-transparent text-brand-primary [&_svg]:size-10 opacity-50 hover:opacity-100 transition-opacity" />
                    <CarouselNext className="hidden sm:flex -right-4 size-14 border-none bg-transparent hover:bg-transparent text-brand-primary [&_svg]:size-10 opacity-50 hover:opacity-100 transition-opacity" />
                </Carousel>
            </div>
        </section>
    );
}
