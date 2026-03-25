'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
    ShieldCheck,
    ChevronRight,
    Download,
    CheckCircle2,
    Globe2,
    FileText,
    Warehouse,
    Truck,
    Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_ROUTES } from '@/constants/routes';
import Lightbox from '@/components/shared/Lightbox';
import { ProductComments } from '@/components/site/ProductComments';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { getLocalizedValue, getLocalizedArray } from '@/types/i18n';
import type { LocalizedText, LocalizedArray, Locale } from '@/types/i18n';

interface ProductDetailClientProps {
    product: any;
    slug: string;
}

export default function ProductDetailClient({ product, slug }: ProductDetailClientProps) {
    const t = useTranslations('ProductDetail');
    const locale = useLocale() as Locale;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const allImages = useMemo(() => {
        if (!product) return [];
        const main =
            product.image_url || 'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png';
        const gallery = Array.isArray(product.gallery) ? product.gallery : [];
        return [main, ...gallery];
    }, [product]);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    // Helper to render specs
    const renderSpecs = () => {
        if (!product.tech_specs) return null;

        if (Array.isArray(product.tech_specs)) {
            // Comparison table format
            const headers = Object.keys(product.tech_specs[0]);
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white shadow-sm ring-1 ring-slate-200">
                        <thead>
                            <tr className="bg-slate-50">
                                {headers.map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-slate-100"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {product.tech_specs.map((row: any, i: number) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                                >
                                    {headers.map((h, j) => (
                                        <td
                                            key={j}
                                            className="px-4 py-3 text-sm font-medium text-slate-900"
                                        >
                                            {row[h]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        } else {
            // Standard Key-Value format
            const entries = Object.entries(product.tech_specs);
            const shouldUseGrid = entries.length > 6;

            if (shouldUseGrid) {
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entries.map(([label, value], i) => (
                            <div
                                key={i}
                                className="bg-white p-4 border border-slate-200 hover:border-brand-primary/30 transition-colors"
                            >
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                    {label}
                                </div>
                                <div className="text-sm font-semibold text-slate-900">
                                    {String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white shadow-sm ring-1 ring-slate-200">
                        <tbody>
                            {entries.map(([label, value], i) => (
                                <tr
                                    key={i}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/3 bg-slate-50/50">
                                        {label}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                        {String(value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pt-40">
            {/* Breadcrumbs */}
            <div className="bg-slate-50 border-b border-slate-100 py-4">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Link href={SITE_ROUTES.HOME} className="hover:text-brand-primary">
                            {t('breadcrumb.home')}
                        </Link>
                        <ChevronRight size={14} />
                        <Link href={SITE_ROUTES.PRODUCTS} className="hover:text-brand-primary">
                            {t('breadcrumb.products')}
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-brand-primary uppercase tracking-tighter">
                            {getLocalizedValue(product.name_localized, locale) || product.name}
                        </span>
                    </div>
                </div>
            </div>

            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Product Visual */}
                        <div className="space-y-8">
                            <div
                                className="relative aspect-square bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-12 group cursor-zoom-in"
                                onClick={() => openLightbox(0)}
                            >
                                <Image
                                    src={
                                        product.image_url ||
                                        'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                    }
                                    alt={getLocalizedValue(product.name_localized, locale) || product.name}
                                    fill
                                    unoptimized
                                    className="object-contain p-20 transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-8 left-8">
                                    <span className="bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                        {t('badge')}
                                    </span>
                                </div>

                                {/* Zoom Hint */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-slate-900 shadow-2xl">
                                        <Maximize2 size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-full max-w-full group">
                                <Carousel
                                    opts={{
                                        align: 'start',
                                        dragFree: true,
                                    }}
                                    className="w-full"
                                >
                                    <CarouselContent className="-ml-4 pb-4">
                                        {allImages.length > 1 ? (
                                            allImages.map((img: string, i: number) => (
                                                <CarouselItem
                                                    key={i}
                                                    className="pl-4 basis-1/4 sm:basis-1/4 md:basis-1/5 lg:basis-1/4"
                                                >
                                                    <div
                                                        className={cn(
                                                            'relative aspect-square bg-slate-50 border border-slate-100 p-2 transition-all cursor-zoom-in overflow-hidden group/thumb',
                                                            currentImageIndex === i
                                                                ? 'border-brand-primary opacity-100 shadow-md'
                                                                : 'opacity-60 hover:opacity-100',
                                                        )}
                                                        onClick={() => openLightbox(i)}
                                                    >
                                                        <Image
                                                            src={img}
                                                            alt={`Thumbnail ${i}`}
                                                            fill
                                                            unoptimized
                                                            className="object-contain p-2 group-hover/thumb:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))
                                        ) : (
                                            <CarouselItem className="pl-4 basis-1/4">
                                                <div className="aspect-square bg-slate-50 border border-slate-100 p-4 opacity-100 shadow-inner">
                                                    <Image
                                                        src={
                                                            product.image_url ||
                                                            'https://saigonvalve.vn/uploads/files/2025/03/19/VAN-C-NG-TL.png'
                                                        }
                                                        alt="Thumb"
                                                        width={100}
                                                        height={100}
                                                        unoptimized
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </CarouselItem>
                                        )}
                                    </CarouselContent>
                                    {allImages.length > 4 && (
                                        <>
                                            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:flex" />
                                            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden xl:flex" />
                                        </>
                                    )}
                                </Carousel>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                                    {getLocalizedValue(product.category_name_localized, locale) || product.category_name || product.category}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
                                    {getLocalizedValue(product.name_localized, locale) || product.name}
                                </h1>
                                <p
                                    className="text-sm text-muted-foreground  leading-relaxed italic border-l-4 border-slate-100 pl-6"
                                    dangerouslySetInnerHTML={{ __html: getLocalizedValue(product.description_localized, locale) || product.description }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-y border-slate-100">
                                <div className="flex items-start gap-4">
                                    <Warehouse className="text-brand-primary shrink-0" size={24} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                            {t('status.label')}
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 uppercase">
                                            {product.availability || t('status.default')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Truck className="text-brand-primary shrink-0" size={24} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                            {t('delivery.label')}
                                        </div>
                                        <div className="text-sm font-bold text-slate-900 uppercase">
                                            {product.delivery_info || t('delivery.default')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {(() => {
                                const localizedFeatures = getLocalizedArray(product.features_localized, locale);
                                const features = localizedFeatures.length > 0 ? localizedFeatures : (Array.isArray(product.features) ? product.features : []);
                                return features.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-secondary border-b border-slate-100 pb-4">
                                            {t('features')}
                                        </h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {features.map((item: string, i: number) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-3 text-sm font-bold text-slate-700"
                                                >
                                                    <CheckCircle2
                                                        size={16}
                                                        className="text-brand-primary shrink-0"
                                                    />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}

                            <div className="flex flex-col sm:flex-row gap-6 pt-6">
                                <Link
                                    href={SITE_ROUTES.CONTACT}
                                    className="flex-1 inline-flex items-center justify-center gap-4 bg-brand-primary py-5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-brand-secondary transition-all"
                                >
                                    {t('getQuote')}
                                </Link>
                                {product.catalog_url && (
                                    <a
                                        href={product.catalog_url}
                                        target="_blank"
                                        className="flex-1 inline-flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:border-brand-primary transition-all"
                                    >
                                        {t('downloadCatalog')} <Download size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Specs */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                        <div className="lg:col-span-2 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">
                                    {t('techSpecs')}
                                </h2>
                                <div className="h-1 w-20 bg-brand-primary"></div>
                            </div>
                            {renderSpecs()}
                        </div>

                        <div className="space-y-12">
                            <div className="bg-brand-primary p-12 text-white space-y-8 relative overflow-hidden">
                                <Globe2
                                    size={120}
                                    className="absolute -bottom-10 -right-10 text-white"
                                />
                                <h4 className="text-xl font-bold uppercase leading-tight italic text-brand-accent">
                                    {t('projectSupport.title')}
                                </h4>
                                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                                    {getLocalizedValue(product.tech_summary_localized, locale) || product.tech_summary ||
                                        t('projectSupport.defaultDesc')}
                                </p>
                                <div className="space-y-6 pt-6 pt-b">
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck className="text-white" size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {t('projectSupport.warranty', { months: product.warranty || t('projectSupport.warrantyDefault') })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FileText className="text-white" size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {t('projectSupport.certificate')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Globe2 className="text-white" size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {t('projectSupport.origin', { origin: product.origin || t('projectSupport.originDefault') })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comments section */}
            <section className="bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <ProductComments productId={product.id} productSlug={slug} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 lg:px-8 text-center space-y-10">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
                        {t('cta.title')}
                    </h2>
                    <p className="max-w-xl mx-auto text-muted-foreground font-medium italic">
                        {t('cta.desc')}
                    </p>
                    <div className="flex justify-center flex-col sm:flex-row gap-6">
                        <Link
                            href={SITE_ROUTES.CONTACT}
                            className="px-12 py-5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-brand-secondary transition-all"
                        >
                            {t('cta.submit')}
                        </Link>
                        <a
                            href="tel:02835358739"
                            className="px-12 py-5 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            {t('cta.hotline')}
                        </a>
                    </div>
                </div>
            </section>

            <Lightbox
                images={allImages}
                currentIndex={currentImageIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onNavigate={(index) => setCurrentImageIndex(index)}
            />
        </div>
    );
}
