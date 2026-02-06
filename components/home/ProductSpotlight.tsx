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

export default function ProductSpotlight() {
    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await $api.get(`${API_ROUTES.PRODUCTS}?isFeatured=true`);
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
            <section className="bg-white py-24 sm:py-32">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                    </div>
                </div>
            </section>
        );
    }

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
                    SẢN PHẨM NỔI BẬT
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
                                <a
                                    href={`/san-pham/${product.slug}`}
                                    className="p-4 flex flex-col items-center text-center space-y-6 group"
                                >
                                    <div className="relative aspect-square w-full max-w-75 transition-transform duration-500 group-hover:scale-110">
                                        <Image
                                            src={
                                                product.image_url ||
                                                'https://via.placeholder.com/300?text=SGV'
                                            }
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            {product.category}
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight min-h-10 flex items-center justify-center">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            XEM CHI TIẾT
                                        </div>
                                    </div>
                                </a>
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
