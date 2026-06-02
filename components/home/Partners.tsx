'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'motion/react';

export const PARTNERS = [
    { name: 'Đối tác', logo: '/uploads/images/2026/02/02/1770023382773-fw807q.png' },
    { name: 'Đối tác', logo: '/uploads/images/2026/02/02/1770021778460-1ysjkc.png' },
];

export default function Partners() {
    const t = useTranslations('Partners');

    return (
        <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white py-20 sm:py-24 border-t border-slate-100"
        >
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-14 space-y-3">
                    <p className="text-[10px] font-black tracking-[0.2em] text-brand-primary uppercase flex items-center justify-center gap-2">
                        <span className="w-6 h-px bg-brand-primary inline-block" />
                        {t('title')}
                        <span className="w-6 h-px bg-brand-primary inline-block" />
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {t('description')}
                    </h2>
                </div>

                {/* Partners - Static centered grid, full color */}
                <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 max-w-3xl mx-auto">
                    {PARTNERS.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="group relative h-28 sm:h-32 lg:h-36 w-44 sm:w-56 lg:w-64 bg-white border border-slate-200 hover:border-brand-primary/40 hover:shadow-md transition-all duration-300 p-6 flex items-center justify-center"
                        >
                            <div className="relative w-full h-full group-hover:scale-[1.03] transition-transform duration-300">
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 176px, (max-width: 1024px) 224px, 256px"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
