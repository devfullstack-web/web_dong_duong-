'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

export interface EquipmentProductItem {
    id: string;
    name: string;
    name_localized?: { vi?: string; en?: string; zh?: string } | null;
    slug: string;
    image_url?: string | null;
    tech_specs?: Record<string, unknown> | null;
    description?: string | null;
    description_localized?: { vi?: string; en?: string; zh?: string } | null;
    price?: string | null;
}

interface Props {
    products?: EquipmentProductItem[];
}

export default function EquipmentProductsGrid({ products = [] }: Props) {
    const locale = useLocale();
    const t = useTranslations('Home');

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section id="equipment-products" className="py-16 sm:py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#C29236] uppercase tracking-wide">
                        {t('equipmentGridTitle')}
                    </h2>
                    <div className="w-28 h-1.5 bg-[#D49B45] mx-auto mt-4 rounded-full" />
                </div>

                {/* Grid of Real Products from Backend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((item, idx) => {
                        // Extract up to 3 real specs from tech_specs object
                        const entries =
                            item.tech_specs && typeof item.tech_specs === 'object'
                                ? Object.entries(item.tech_specs)
                                : [];

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-amber-400 p-5 sm:p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Product Image */}
                                <div className="relative w-full h-48 sm:h-52 mb-4 flex items-center justify-center bg-slate-50/60 rounded-xl overflow-hidden p-2 group-hover:bg-amber-50/30 transition-colors">
                                    <Image
                                        src={item.image_url || '/images/dongduong/p-van-spec.png'}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Product Name */}
                                <h3 className="text-lg sm:text-xl lg:text-[21px] font-black text-slate-900 uppercase tracking-tight mb-2.5 line-clamp-2 min-h-[56px] flex items-center justify-center leading-snug">
                                    {(locale === 'zh' ? item.name_localized?.zh : locale === 'en' ? item.name_localized?.en : item.name_localized?.vi) || item.name}
                                </h3>

                                {/* Price Highlight - Essential for Elderly / Buyers */}
                                {item.price && Number(item.price) > 0 ? (
                                    <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200 w-full flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                                            {locale === 'zh' ? '价格:' : locale === 'en' ? 'Price:' : 'Giá:'}
                                        </span>
                                        <span className="text-lg sm:text-xl font-black text-[#D49B45]">
                                            {new Intl.NumberFormat('vi-VN').format(Number(item.price))} đ
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 w-full flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wide">
                                            {locale === 'zh' ? '价格:' : locale === 'en' ? 'Price:' : 'Giá:'}
                                        </span>
                                        <span className="text-base sm:text-lg font-bold text-amber-600">
                                            {locale === 'zh' ? '联系获取底价' : locale === 'en' ? 'Contact for Quote' : 'Liên hệ báo giá'}
                                        </span>
                                    </div>
                                )}

                                {/* Specifications from Backend DB - Large & Clear for Mobile Reading */}
                                <div className="space-y-2 text-base sm:text-[17px] text-slate-800 font-medium mb-5 w-full border-t border-slate-200/80 pt-3.5 min-h-[60px] text-left">
                                    {entries.slice(0, 3).map(([key, val], i) => (
                                        <p key={i} className="line-clamp-1 flex items-baseline gap-2 leading-relaxed">
                                            <span className="text-[#C29236] font-black text-xl leading-none select-none">•</span>
                                            <span className="font-extrabold text-slate-900 shrink-0">{key}:</span>
                                            <span className="text-slate-800 font-medium truncate">{String(val)}</span>
                                        </p>
                                    ))}
                                    {entries.length === 0 && (
                                        <p className="line-clamp-2 text-base text-slate-600 font-medium leading-relaxed italic">
                                            {(locale === 'zh' ? item.description_localized?.zh : locale === 'en' ? item.description_localized?.en : item.description_localized?.vi) || item.description || (locale === 'zh' ? '高品质工程标准设备。' : locale === 'en' ? 'High quality standard equipment.' : 'Sản phẩm tiêu chuẩn chất lượng cao.')}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons - Touch-friendly & Large font */}
                                <div className="mt-auto w-full flex items-center gap-3 pt-2">
                                    <a
                                        href="#quote-form"
                                        className="flex-1 py-3.5 px-4 rounded-xl bg-[#0A2958] hover:bg-[#123B7A] text-white text-base sm:text-lg font-bold uppercase tracking-wider transition-colors shadow-sm text-center active:scale-[0.98]"
                                    >
                                        {t('quote')}
                                    </a>
                                    <Link
                                        href={`/san-pham/${item.slug}` as "/san-pham"}
                                        className="py-3.5 px-4 rounded-xl border-2 border-slate-300 hover:border-amber-500 hover:text-amber-600 text-slate-900 text-base sm:text-lg font-bold transition-colors text-center active:scale-[0.98]"
                                    >
                                        {t('details')}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
