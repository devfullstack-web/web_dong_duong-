import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SITE_ROUTES } from '@/constants/routes';

export default function Solutions() {
    const t = useTranslations('Solutions');

    const SOLUTIONS_CONTENT = [
        {
            id: 'water',
            brand: 'SAIGONVALVE WATER',
            title: t('waterManagement'),
            subtitle: 'Smart Water Management Systems',
            image: '/uploads/images/2026/02/02/1770024627773-di5jqj.png',
            href: SITE_ROUTES.SOLUTIONS.WATER_MANAGEMENT,
        },
        {
            id: 'farm',
            brand: 'SAIGONVALVE FARM',
            title: t('agriculture'),
            subtitle: 'Precision Agriculture IoT',
            image: '/uploads/images/2026/02/02/1770024634433-tfvl2o.png',

            href: SITE_ROUTES.SOLUTIONS.AGRICULTURE,
        },
        {
            id: 'aqua',
            brand: 'SAIGONVALVE AQUA',
            title: t('aquaculture'),
            subtitle: 'Aquaculture Monitoring',
            image: '/uploads/images/2026/02/02/1770024641404-d0g5xi.png',
            href: SITE_ROUTES.SOLUTIONS.AQUACULTURE,
        },
        {
            id: 'hydro',
            brand: 'SAIGONVALVE HYDRO',
            title: t('hydrology'),
            subtitle: 'Smart Irrigation & Hydrology',
            image: '/uploads/images/2026/02/02/1770024676466-u4e2w9.png',
            href: '#',
        },
        {
            id: 'building',
            brand: 'SAIGONVALVE BUILDING',
            title: t('building'),
            subtitle: 'Smart Building & Infrastructure',
            image: '/uploads/images/2026/02/02/1770024682380-kkc3q0.png',
            href: '#',
        },
    ];

    return (
        <section className="bg-brand overflow-hidden">
            {/* Header Area */}
            <div className="pt-24 pb-12 text-center relative z-20">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-[0.2em] mb-4">
                    {t('title')}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    <span>{t('breadcrumbHome')}</span>
                    <span>/</span>
                    <span className="text-white">{t('breadcrumbSolutions')}</span>
                </div>
            </div>

            {/* Interactive Strips */}
            <div className="flex flex-col lg:flex-row h-[700px] w-full border-t border-white/10 items-stretch">
                {SOLUTIONS_CONTENT.map((item, idx) => (
                    <div
                        key={item.id}
                        className={cn(
                            'relative overflow-hidden group cursor-pointer  border-white/5 last:border-0 h-[700px] flex-1 min-w-0 transition-all duration-500',
                            idx === 0 ? 'z-10' : 'z-0',
                        )}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={item.image}
                                alt={item.brand}
                                fill
                                sizes="(max-width: 1024px) 100vw, 20vw"
                                className="object-cover"
                            />
                        </div>

                        <div className="absolute inset-0 z-10 flex -translate-y-full flex-col items-center justify-center p-4 text-center backdrop-blur-3xl border-b border-white/10 bg-white/5 transition-transform duration-500 ease-out group-hover:translate-y-0 sm:p-6 lg:p-8">
                            <div className="mb-6 sm:mb-8 lg:mb-10 relative group/logo">
                                {/* Premium Logo Container */}
                                <div className="relative h-14 w-36 sm:h-16 sm:w-44 lg:h-20 lg:w-52 p-3 sm:p-4 bg-white rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-3 flex items-center justify-center">
                                    <Image
                                        src="/images/logo/logo.png"
                                        alt="Sài Gòn Valve Logo"
                                        fill
                                        sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px"
                                        className="object-contain p-2 sm:p-3"
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-px w-5 sm:w-6 bg-brand-accent"></div>
                                    <div className="size-1 rounded-full bg-brand-accent"></div>
                                    <div className="h-px w-5 sm:w-6 bg-brand-accent"></div>
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-1 sm:space-y-2">
                                    <h3 className="text-[8px] sm:text-[9px] font-black text-brand-accent uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                                        {item.subtitle}
                                    </h3>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                                        {item.brand} <br />
                                        <span className="text-brand-accent text-sm sm:text-base lg:text-lg">
                                            {item.title}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-8 pt-20 transition-opacity duration-300 bg-linear-to-t from-slate-950/80 to-transparent group-hover:opacity-0">
                            <div className="lg:-rotate-90 lg:origin-left lg:absolute lg:left-8 lg:bottom-12 lg:whitespace-nowrap lg:transform lg:translate-y-full">
                                <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] mb-4">
                                    {item.brand}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-3 bg-brand-accent"></div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest text-shadow">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100" />
                    </div>
                ))}
            </div>
        </section>
    );
}
