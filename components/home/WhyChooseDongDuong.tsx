'use client';

import * as React from 'react';
import Image from 'next/image';

import { useTranslations } from 'next-intl';
import TechSvgBackground from '@/components/ui/TechSvgBackground';

export interface ReasonItem {
    id: string;
    iconSrc: string;
    title: string;
    desc: string;
}

interface Props {
    reasons?: ReasonItem[];
}

export default function WhyChooseDongDuong({ reasons = [] }: Props) {
    const t = useTranslations('Home');

    if (!reasons || reasons.length === 0) {
        return null;
    }

    return (
        <section className="relative py-14 sm:py-16 lg:py-20 bg-white border-b border-slate-100 overflow-hidden">
            {/* High-Tech Animated Vector Blueprint Background */}
            <TechSvgBackground variant="blueprint" glowColor="amber" className="absolute inset-0 z-0" />

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                {/* Section Title matching Mockup serif bold */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B2545] uppercase tracking-wide font-serif">
                        {t('whyChooseTitle')}
                    </h2>
                </div>

                {/* Cards Grid with Gold Border & Real Icons from Backend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {reasons.map((item) => (
                        <div
                            key={item.id || item.title}
                            className="bg-white rounded-2xl border-2 border-amber-300/80 p-6 sm:p-7 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="relative w-18 h-18 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src={item.iconSrc}
                                    alt={item.title}
                                    fill
                                    sizes="72px"
                                    className="object-contain p-1"
                                />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black uppercase text-[#0B2545] tracking-wide mb-3 leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-base sm:text-[17px] text-slate-800 font-medium leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
