'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
    ChevronRight,
    Download,
    CheckCircle2,
    Warehouse,
    Truck,
    Maximize2,
    FileText,
    Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_ROUTES } from '@/constants/routes';
import Lightbox from '@/components/shared/Lightbox';
import { ProductComments } from '@/components/site/ProductComments';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { getLocalizedValue, getLocalizedArray } from '@/types/i18n';
import type { Locale } from '@/types/i18n';
import { sanitizeRichText } from '@/utils/sanitize';

interface ProductDetailClientProps {
    product: Record<string, unknown>;
    slug: string;
}

export default function ProductDetailClient({ product, slug }: ProductDetailClientProps) {
    const t = useTranslations('ProductDetail');
    const locale = useLocale() as Locale;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

    const allImages = useMemo(() => {
        if (!product) return [];
        const main = product.image_url;
        const gallery = Array.isArray(product.gallery) ? product.gallery : [];
        return [main, ...gallery];
    }, [product]);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const renderSpecs = () => {
        if (!product.tech_specs) return null;

        if (Array.isArray(product.tech_specs)) {
            const headers = Object.keys(product.tech_specs[0]);
            return (
                <div className="overflow-x-auto border border-slate-100">
                    <table className="w-full text-left border-collapse bg-white">
                        <thead>
                            <tr className="bg-slate-50">
                                {headers.map((h, i) => (
                                    <th key={i} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {product.tech_specs.map((row: Record<string, unknown>, i: number) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    {headers.map((h, j) => (
                                        <td key={j} className="px-4 py-3 text-xs font-bold text-slate-800">
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
            const entries = Object.entries(product.tech_specs);
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-slate-100 border border-slate-100">
                    {entries.map(([label, value], i) => (
                        <div key={i} className="bg-white p-5 flex flex-col space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
                            <span className="text-xs font-bold text-slate-900 leading-tight">{String(value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pt-24 lg:pt-32">
            {/* Breadcrumbs */}
            <div className="bg-slate-50 border-y border-slate-100 py-3">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <Link href={SITE_ROUTES.HOME} className="hover:text-brand-primary">{t('breadcrumb.home')}</Link>
                        <ChevronRight size={12} />
                        <Link href={SITE_ROUTES.PRODUCTS} className="hover:text-brand-primary">{t('breadcrumb.products')}</Link>
                        <ChevronRight size={12} />
                        <span className="text-brand-primary">{getLocalizedValue(product.name_localized, locale) || product.name}</span>
                    </div>
                </div>
            </div>

            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
                        
                        {/* Left: Product Visual */}
                        <div className="lg:col-span-5 space-y-4">
                            <div 
                                className="relative aspect-square bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-8 group cursor-zoom-in"
                                onClick={() => openLightbox(0)}
                            >
                                <Image
                                    src={product.image_url || '/images/placeholder.png'}
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-0 left-0 bg-brand-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                                    {t('badge')}
                                </div>
                                <div className="absolute bottom-4 right-4 h-10 w-10 bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 size={18} />
                                </div>
                            </div>
                            
                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <Carousel className="w-full">
                                    <CarouselContent className="-ml-2">
                                        {allImages.map((img: string, i: number) => (
                                            <CarouselItem key={i} className="pl-2 basis-1/5">
                                                <div 
                                                    className={cn(
                                                        'relative aspect-square bg-slate-50 border p-1 cursor-pointer overflow-hidden transition-all',
                                                        currentImageIndex === i ? 'border-brand-primary' : 'border-slate-100 opacity-60 hover:opacity-100'
                                                    )}
                                                    onClick={() => openLightbox(i)}
                                                >
                                                    <Image src={img} alt="Thumb" fill unoptimized className="object-contain p-1" />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                            )}
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
                                    {getLocalizedValue(product.category_name_localized, locale) || product.category_name}
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                    {getLocalizedValue(product.name_localized, locale) || product.name}
                                </h1>
                                <div className="h-1 w-16 bg-brand-primary"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-px bg-slate-100 border border-slate-100">
                                <div className="bg-white p-4 flex items-center gap-4">
                                    <Warehouse size={20} className="text-brand-primary shrink-0" />
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('status.label')}</div>
                                        <div className="text-xs font-bold text-slate-900 uppercase">{product.availability || t('status.default')}</div>
                                    </div>
                                </div>
                                <div className="bg-white p-4 flex items-center gap-4">
                                    <Truck size={20} className="text-brand-primary shrink-0" />
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('delivery.label')}</div>
                                        <div className="text-xs font-bold text-slate-900 uppercase">{product.delivery_info || t('delivery.default')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Brief Features */}
                            {(() => {
                                const features = getLocalizedArray(product.features_localized, locale);
                                return features.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                                            {t('features')}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                            {features.slice(0, 8).map((item: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                    <CheckCircle2 size={14} className="text-brand-primary shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href={SITE_ROUTES.CONTACT}
                                    className="flex-1 bg-brand-primary py-4 text-[10px] font-black uppercase tracking-widest text-white text-center hover:bg-brand-secondary transition-all"
                                >
                                    {t('getQuote')}
                                </Link>
                                {product.catalog_url && (
                                    <a
                                        href={product.catalog_url}
                                        target="_blank"
                                        className="flex-1 border border-slate-200 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center hover:border-brand-primary transition-all flex items-center justify-center gap-3"
                                    >
                                        {t('downloadCatalog')} <Download size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Combined Tabs Section - Full Width */}
            <section className="bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Tab Switcher - More Visible Active State */}
                    <div className="flex border-x border-slate-100 w-fit">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={cn(
                                "flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer",
                                activeTab === 'description' 
                                    ? "bg-brand-primary text-white" 
                                    : "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <FileText size={14} /> {t('description')}
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={cn(
                                "flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all hover:cursor-pointer",
                                activeTab === 'specs' 
                                    ? "bg-brand-primary text-white" 
                                    : "bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <Settings2 size={14} /> {t('techSpecs')}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="py-12 lg:py-16">
                        {activeTab === 'description' && (
                            <div className="animate-in fade-in duration-500">
                                {(getLocalizedValue(product.description_localized, locale) || product.description) ? (
                                    <div
                                        className="prose prose-slate max-w-none prose-sm lg:prose-base 
                                            prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                                            prose-p:text-slate-600 prose-p:leading-relaxed
                                            prose-img:border prose-img:border-slate-100 prose-img:p-2
                                            prose-table:border prose-table:border-slate-100 prose-th:bg-slate-50 prose-th:text-[10px] prose-th:font-black prose-th:uppercase prose-th:p-3
                                            prose-td:p-3 prose-td:text-xs prose-td:font-medium
                                        "
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeRichText(
                                                getLocalizedValue(product.description_localized, locale) ||
                                                    product.description,
                                            ),
                                        }}
                                    />
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Đang cập nhật nội dung chi tiết...</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="animate-in fade-in duration-500">
                                {product.tech_specs ? (
                                    renderSpecs()
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Đang cập nhật thông số kỹ thuật...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Comments Section */}
            <section className="bg-white border-t border-slate-100 pt-8">
                <div className="container mx-auto px-4 lg:px-8">
                    <ProductComments productId={product.id} productSlug={slug} />
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 bg-slate-50 border-t border-slate-100 text-center">
                <div className="container mx-auto px-4 lg:px-8 space-y-8">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900">{t('cta.title')}</h2>
                    <div className="flex justify-center gap-4">
                        <Link href={SITE_ROUTES.CONTACT} className="px-10 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary transition-all">
                            {t('cta.submit')}
                        </Link>
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
