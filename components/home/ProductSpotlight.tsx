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
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Box } from 'lucide-react';

export default function ProductSpotlight() {
    const t = useTranslations('ProductSpotlight');
    const commonT = useTranslations('Common');
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await $api.get(`${API_ROUTES.PRODUCTS}?isFeatured=true&status=active`);
                if (response.data.success) {
                    setProducts(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProducts();
    }, []);

    if (loading) {
        return (
            <section className="bg-slate-50 py-12 lg:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="h-48 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    </div>
                </div>
            </section>
        );
    }

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
                                {commonT('featuredProducts', { defaultValue: 'SẢN PHẨM TIÊU BIỂU' })}
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
                        </motion.h2 >
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
                            Tất cả <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
                            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="h-full"
                                >
                                    <Link
                                        href={`/san-pham/${product.slug}`}
                                        className="flex flex-col h-full bg-white border border-slate-100 group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 rounded-xl overflow-hidden"
                                    >
                                        {/* Image Area - Smaller aspect */}
                                        <div className="relative aspect-square bg-slate-50/50 overflow-hidden">
                                            <Image
                                                src={product.image_url || '/images/placeholder.png'}
                                                alt={product.name}
                                                fill
                                                unoptimized
                                                className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {product.category_name && (
                                                <div className="absolute top-3 left-3">
                                                    <div className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-slate-100 flex items-center gap-1.5">
                                                        <Box size={10} className="text-brand-primary" />
                                                        <span className="text-[8px] font-black text-slate-900 uppercase tracking-wider">{product.category_name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Area - Compact & Real Data */}
                                        <div className="flex-1 p-5 flex flex-col space-y-3">
                                            <div className="space-y-1 flex-1">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                {product.summary && (
                                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                        {product.summary}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Dynamic Metadata from API */}
                                            {(product.brand || product.origin) && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                                                    {product.brand && (
                                                        <span className="text-[8px] font-bold text-brand-primary uppercase tracking-widest">{product.brand}</span>
                                                    )}
                                                    {product.origin && (
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">• {product.origin}</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{t('productDetail')}</span>
                                                <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
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
