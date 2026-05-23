'use client';

import * as React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { SITE_ROUTES } from '@/constants/routes';
import { Link } from '@/i18n/routing';
import { Droplet, Sprout, Waves, CloudRain, Building2, ArrowRight } from 'lucide-react';

export default function Solutions() {
    const t = useTranslations('Solutions');
    const activeLocale = useLocale();
    const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

    const SOLUTIONS_CONTENT = [
        {
            id: 'water',
            brand: 'SGV WATER',
            title: t('waterManagement'),
            subtitle: 'Smart Water Management Systems',
            desc: t('waterManagementDesc'),
            image: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
            href: SITE_ROUTES.SOLUTIONS.WATER_MANAGEMENT,
            Icon: Droplet,
            color: 'text-brand-cyan group-hover:text-brand-cyan/80',
            bgGlow: 'bg-brand-primary/20',
            borderGlow: 'group-hover:border-brand-cyan/40',
            glowColor: 'shadow-brand-cyan/10',
        },
        {
            id: 'farm',
            brand: 'SGV FARM',
            title: t('agriculture'),
            subtitle: 'Precision Agriculture IoT',
            desc: t('agricultureDesc'),
            image: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',
            href: SITE_ROUTES.SOLUTIONS.AGRICULTURE,
            Icon: Sprout,
            color: 'text-brand-accent group-hover:text-brand-accent/80',
            bgGlow: 'bg-brand-primary/20',
            borderGlow: 'group-hover:border-brand-accent/40',
            glowColor: 'shadow-brand-accent/10',
        },
        {
            id: 'aqua',
            brand: 'SGV AQUA',
            title: t('aquaculture'),
            subtitle: 'Aquaculture Monitoring',
            desc: activeLocale === 'vi' 
                ? 'Giải pháp kiểm soát chất lượng nước nuôi thủy hải sản chuyên sâu, cảnh báo rủi ro 24/7 bằng công nghệ đám mây.'
                : 'Advanced aquaculture water quality control solutions with 24/7 cloud alerts.',
            image: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
            href: SITE_ROUTES.SOLUTIONS.AQUACULTURE,
            Icon: Waves,
            color: 'text-brand-cyan group-hover:text-brand-cyan/80',
            bgGlow: 'bg-brand-primary/20',
            borderGlow: 'group-hover:border-brand-cyan/40',
            glowColor: 'shadow-brand-cyan/10',
        },
        {
            id: 'hydro',
            brand: 'SGV HYDRO',
            title: t('hydrology'),
            subtitle: 'Smart Irrigation & Hydrology',
            desc: activeLocale === 'vi'
                ? 'Hệ thống tự động hóa điều tiết nguồn nước, trạm khí tượng thủy văn thông minh phục vụ phát triển bền vững.'
                : 'Automated water regulation systems and smart hydro-meteorological stations for sustainability.',
            image: '/uploads/images/2026/02/02/1770024676466-u4e2w9.png',
            href: '#',
            Icon: CloudRain,
            color: 'text-brand-accent group-hover:text-brand-accent/80',
            bgGlow: 'bg-brand-primary/20',
            borderGlow: 'group-hover:border-brand-accent/40',
            glowColor: 'shadow-brand-accent/10',
        },
        {
            id: 'building',
            brand: 'SGV BUILDING',
            title: t('building'),
            subtitle: 'Smart Building & Infrastructure',
            desc: activeLocale === 'vi'
                ? 'Giải pháp tích hợp quản lý năng lượng, thông gió và điều phối thiết bị thông minh cho cao ốc & hạ tầng công cộng.'
                : 'Integrated solutions for energy management, ventilation, and smart equipment coordination for buildings.',
            image: '/uploads/images/2026/02/02/1770024682380-kkc3q0.png',
            href: '#',
            Icon: Building2,
            color: 'text-brand-cyan group-hover:text-brand-cyan/80',
            bgGlow: 'bg-brand-primary/20',
            borderGlow: 'group-hover:border-brand-cyan/40',
            glowColor: 'shadow-brand-cyan/10',
        },
    ];

    return (
        <section className="bg-brand-primary overflow-hidden relative">
            {/* Header Area */}
            <div className="pt-24 pb-16 text-center relative z-20 container mx-auto px-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-white/20 rounded-none mb-4">
                    <span className="w-1.5 h-1.5 rounded-none bg-brand-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.2em]">
                        {activeLocale === 'vi' ? 'Hệ sinh thái số' : 'Digital Ecosystem'}
                    </span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] mb-4 text-shadow uppercase leading-none">
                    {t('title')}
                </h2>
                
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-white/70 uppercase tracking-widest">
                    <span className="hover:text-white transition-colors cursor-pointer">{t('breadcrumbHome')}</span>
                    <span>/</span>
                    <span className="text-brand-accent font-black">{t('breadcrumbSolutions')}</span>
                </div>
            </div>

            {/* Interactive Desktop Strips */}
            <div className="hidden lg:flex group/container h-[600px] w-full border-t border-white/10 bg-brand-primary items-stretch overflow-hidden">
                {SOLUTIONS_CONTENT.map((item) => {
                    const { Icon } = item;
                    const hasError = imageErrors[item.id];
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                'relative overflow-hidden group cursor-pointer h-full flex-1 min-w-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]',
                                'border-r border-white/10 last:border-r-0 rounded-none',
                                'lg:group-hover/container:flex-[0.6] lg:group-hover/container:opacity-50 lg:group-hover/container:hover:flex-[2.6] lg:group-hover/container:hover:opacity-100'
                            )}
                        >
                            {/* Background Image Area with robust error states and visual blueprints */}
                            <div className="absolute inset-0 z-0 bg-[#001633]">
                                {/* High-tech Blueprint Grid Pattern (appears if image is missing/loading) */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
                                
                                <Image
                                    src={hasError ? '/images/hero-poster.jpg' : item.image}
                                    alt={item.brand}
                                    fill
                                    sizes="40vw"
                                    onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                                    className="object-cover transition-transform duration-1000 ease-out scale-100 group-hover:scale-105"
                                />
                                
                                {/* Solid, clean bottom gradient bar for normal state texts */}
                                <div className="absolute inset-0 bg-slate-950/20 transition-opacity duration-500 group-hover:opacity-5" />
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent transition-opacity duration-500" />
                            </div>

                            {/* Top Accent Line */}
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent transition-transform duration-700 origin-left scale-x-0 group-hover:scale-x-100"
                            )} />

                            {/* Floating Icon at top-right in minimal state */}
                            <div className={cn(
                                "absolute top-8 right-8 w-12 h-12 rounded-none border border-white/20 flex items-center justify-center bg-slate-950/60 shadow-lg z-10 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-[-10px]",
                                item.color
                            )}>
                                <Icon size={24} />
                            </div>

                            {/* Minimal State Bottom Texts */}
                            <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4 rounded-none">
                                <div className="space-y-1.5 transform translate-y-0 transition-transform duration-500">
                                    <p className="text-[10px] font-black text-brand-accent tracking-[0.3em] uppercase">
                                        {item.brand}
                                    </p>
                                    <h3 className="text-lg font-black text-white tracking-wide uppercase leading-tight mt-1">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Expanded State */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-between p-10 bg-brand-secondary/25 border-l-2 border-brand-accent opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-75 rounded-none shadow-[25px_0_60px_rgba(0,10,30,0.4)]">
                                {/* Top info with animated icon */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-brand-accent tracking-[0.4em] uppercase bg-brand-primary px-2.5 py-1 rounded-none border border-white/10">
                                            {item.brand}
                                        </span>
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-tight pt-2">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-slate-300 font-semibold tracking-wide">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* Glowing Icon */}
                                    <div className={cn(
                                        "w-14 h-14 rounded-none border border-white/10 flex items-center justify-center transition-all duration-500 bg-brand-primary",
                                        item.color, item.borderGlow
                                    )}>
                                        <Icon size={28} className="animate-pulse" />
                                    </div>
                                </div>

                                {/* Bottom description and CTA */}
                                <div className="space-y-6">
                                    <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-md">
                                        {item.desc}
                                    </p>

                                    {/* Action button */}
                                    <div className="inline-flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-brand-accent group/btn hover:text-white transition-colors">
                                        <span>{activeLocale === 'vi' ? 'Khám phá ngay' : 'Explore now'}</span>
                                        <div className="w-8 h-8 rounded-none border border-brand-accent/30 flex items-center justify-center bg-brand-accent/5 group-hover/btn:bg-brand-accent group-hover/btn:border-brand-accent group-hover/btn:translate-x-1.5 transition-all duration-300">
                                            <ArrowRight size={14} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Responsive Grid for Mobile and Tablet */}
            <div className="lg:hidden container mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {SOLUTIONS_CONTENT.map((item) => {
                    const { Icon } = item;
                    const hasError = imageErrors[item.id];
                    return (
                        <div
                            key={item.id}
                            className="bg-brand-secondary border border-white/5 shadow-2xl rounded-none overflow-hidden group flex flex-col transition-all duration-500"
                        >
                            {/* Image Header with brand and robust error backdrops */}
                            <div className="relative aspect-16/9 w-full overflow-hidden bg-[#001633]">
                                {/* Blueprint pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:25px_25px]" />
                                
                                <Image
                                    src={hasError ? '/images/hero-poster.jpg' : item.image}
                                    alt={item.brand}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-950/20" />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent" />
                                
                                {/* Absolute Badges on Image */}
                                <div className="absolute top-4 left-4">
                                    <span className="text-[9px] font-black text-brand-accent tracking-[0.3em] uppercase bg-slate-950/80 px-2.5 py-1 border border-brand-accent/20 rounded-none">
                                        {item.brand}
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-none border border-white/10 flex items-center justify-center bg-slate-950/60 shadow-sm",
                                        item.color
                                    )}>
                                        <Icon size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Info Content Area */}
                            <div className="p-6 flex flex-col justify-between flex-grow">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5 uppercase">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-300 font-medium leading-relaxed line-clamp-2">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Link action at bottom */}
                                <div className="pt-5 border-t border-white/5 mt-5">
                                    <Link
                                        href={item.href}
                                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-accent hover:text-white transition-colors"
                                    >
                                        <span>{activeLocale === 'vi' ? 'Xem chi tiết' : 'Details'}</span>
                                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
