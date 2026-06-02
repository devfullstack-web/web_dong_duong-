'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SITE_ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { Droplet, Sprout, Waves, CloudRain, Building2, ArrowRight } from 'lucide-react';

export default function Solutions() {
    const t = useTranslations('Solutions');
    const commonT = useTranslations('Common');
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

    const SOLUTIONS = [
        {
            id: 'water',
            brand: 'SGV WATER',
            title: t('waterManagement'),
            desc: t('waterManagementDesc'),
            image: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
            href: SITE_ROUTES.SOLUTIONS.WATER_MANAGEMENT,
            Icon: Droplet,
        },
        {
            id: 'farm',
            brand: 'SGV FARM',
            title: t('agriculture'),
            desc: t('agricultureDesc'),
            image: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',
            href: SITE_ROUTES.SOLUTIONS.AGRICULTURE,
            Icon: Sprout,
        },
        {
            id: 'aqua',
            brand: 'SGV AQUA',
            title: t('aquaculture'),
            desc: t('aquacultureDesc'),
            image: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
            href: SITE_ROUTES.SOLUTIONS.AQUACULTURE,
            Icon: Waves,
        },
        {
            id: 'hydro',
            brand: 'SGV HYDRO',
            title: t('hydrology'),
            desc: t('hydrologyDesc'),
            image: '/uploads/images/2026/02/02/1770024676466-u4e2w9.png',
            href: '#',
            Icon: CloudRain,
        },
        {
            id: 'building',
            brand: 'SGV BUILDING',
            title: t('building'),
            desc: t('buildingDesc'),
            image: '/uploads/images/2026/02/02/1770024682380-kkc3q0.png',
            href: '#',
            Icon: Building2,
        },
    ];

    const active = SOLUTIONS[activeIndex];

    return (
        <section className="bg-white py-20 lg:py-28 border-t border-slate-100">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header - Same style as SystemHighlight */}
                <div className="mb-14 space-y-3">
                    <p className="text-[10px] font-black tracking-[0.2em] text-brand-primary uppercase flex items-center gap-2">
                        <span className="w-6 h-px bg-brand-primary inline-block" />
                        {t('digitalEcosystem')}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                        {t('title')}
                    </h2>
                </div>

                {/* Tab Navigation - Simple horizontal tabs */}
                <div className="flex flex-wrap gap-0 border-b border-slate-200 mb-0">
                    {SOLUTIONS.map((item, i) => {
                        const isActive = activeIndex === i;
                        const { Icon } = item;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveIndex(i)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={cn(
                                    "flex items-center gap-2 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-px",
                                    isActive
                                        ? "text-brand-primary border-brand-primary bg-slate-50"
                                        : "text-slate-400 border-transparent hover:text-slate-700 hover:border-slate-300"
                                )}
                            >
                                <Icon size={14} className="shrink-0" />
                                <span className="hidden sm:inline">{item.title}</span>
                                <span className="sm:hidden">{item.brand.split(' ')[1]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Panel */}
                <div className="flex flex-col lg:flex-row items-stretch bg-slate-50 border border-t-0 border-slate-200">
                    {/* Image */}
                    <div className="relative w-full lg:w-3/5 h-72 sm:h-80 lg:h-[460px] overflow-hidden shrink-0">
                        <Image
                            src={imageErrors[active.id] ? '/images/hero-poster.jpg' : active.image}
                            alt={active.brand}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            onError={() =>
                                setImageErrors((prev) => ({ ...prev, [active.id]: true }))
                            }
                            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
                        />
                    </div>

                    {/* Info */}
                    <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black tracking-[0.2em] text-brand-primary uppercase">
                                {active.brand}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {active.title}
                            </h3>
                        </div>

                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            {active.desc}
                        </p>

                        <div className="pt-2">
                            <Link
                                href={active.href}
                                className="inline-flex items-center gap-4 px-8 py-3.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 group"
                            >
                                {commonT('exploreNow')}
                                <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover:translate-x-2"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
