import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const PARTNERS = [
    { name: 'Đối tác', logo: '/uploads/images/2026/02/02/1770023382773-fw807q.png' },
    { name: 'Đối tác', logo: '/uploads/images/2026/02/02/1770021778460-1ysjkc.png' },
];

export default function Partners() {
    const t = useTranslations('Partners');
    return (
        <section className="bg-gradient-to-b from-slate-50 to-white py-20 sm:py-28">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                        {t('title')}
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">{t('description')}</p>
                </div>

                {/* Partners Grid */}
                <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 max-w-5xl mx-auto">
                    {PARTNERS.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="group w-48 sm:w-56 lg:w-64"
                        >
                            <div className="relative h-32 sm:h-36 lg:h-40 w-full bg-white  border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-primary/30 transition-all duration-300 p-6 flex items-center justify-center overflow-hidden">
                                {/* Background glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                                    <Image
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        className="object-contain p-2 hover:cursor-pointer"
                                        sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                                    />
                                </div>
                            </div>

                            {/* Partner name tooltip */}
                            <p className="text-center text-sm text-slate-500 mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {partner.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
