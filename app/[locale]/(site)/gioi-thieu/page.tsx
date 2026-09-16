'use client';

import { useState, useEffect } from 'react';
import $api from '@/utils/axios';
import { motion } from 'motion/react';
import {
    ShieldCheck,
    Target,
    Users,
    MoveRight,
    CheckCircle2,
    Rocket,
    Eye,
    Globe2,
    Mail,
    Phone,
    Grid,
    Wind,
    Cpu,
    Building2,
    Layers,
    Sparkles,
    ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useSiteInfo } from '@/components/providers/site-info-provider';
import { PageBanner } from '@/components/site/PageBanner';

import { DEFAULT_PARTNERS, BrandPartnerItem } from '@/components/home/Partners';

export default function AboutPage() {
    const COMPANY_INFO = useSiteInfo();
    const t = useTranslations('About');
    const tPartners = useTranslations('Partners');
    const locale = useLocale();
    const [partners, setPartners] = useState<BrandPartnerItem[]>(DEFAULT_PARTNERS);

    useEffect(() => {
        $api.get(`/settings/brand-partners?locale=${locale}`)
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
                    setPartners(res.data.data);
                }
            })
            .catch(() => {});
    }, [locale]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Intro Section - Mission & Vision */}
            <section className="py-20 lg:py-28 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 max-w-[1340px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A2958]/5 border border-[#0A2958]/15 rounded-full text-xs font-black uppercase tracking-wider text-[#0A2958]">
                                    <Building2 className="w-3.5 h-3.5 text-[#E5B869]" />
                                    {t('intro.who')}
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A2958] uppercase tracking-tight leading-tight">
                                    {t('intro.title')}
                                </h2>
                                <div className="h-1.5 w-24 bg-[#E5B869] rounded-full"></div>
                            </div>

                            <div className="space-y-5 text-slate-600 leading-relaxed font-medium text-base sm:text-lg">
                                <p className="text-slate-800 font-bold border-l-4 border-[#0A2958] pl-4">
                                    {t('intro.content1')}
                                </p>
                                <p>{t('intro.content2')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 p-8 border-t-4 border-[#E5B869] shadow-sm space-y-3 rounded-b-lg border-x border-b border-slate-100"
                                >
                                    <Rocket className="text-[#0A2958]" size={36} />
                                    <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                                        {t('intro.mission.title')}
                                    </h4>
                                    <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
                                        {t('intro.mission.desc')}
                                    </p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-[#0A2958] p-8 border-t-4 border-[#E5B869] shadow-md space-y-3 text-white rounded-b-lg"
                                >
                                    <Eye className="text-[#E5B869]" size={36} />
                                    <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                                        {t('intro.vision.title')}
                                    </h4>
                                    <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                                        {t('intro.vision.desc')}
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="relative aspect-[4/5] sm:aspect-square shadow-2xl rounded-2xl overflow-hidden group border-4 border-white">
                                <Image
                                    src="/images/dongduong/hero-building.png"
                                    alt="Đông Dương Corporation Headquarters"
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2958]/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-[#0A2958] text-[#E5B869] flex items-center justify-center font-black text-lg">
                                            ĐD
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase">
                                                {locale === 'zh' ? '值得信赖的合作伙伴' : locale === 'en' ? 'TRUSTED PARTNER' : 'ĐỐI TÁC TIN CẬY'}
                                            </div>
                                            <div className="text-base sm:text-lg font-black text-[#0A2958]">
                                                {locale === 'zh' ? '东洋集团' : locale === 'en' ? 'DONG DUONG CORPORATION' : 'ĐÔNG DƯƠNG CORPORATION'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 h-36 w-36 border-4 border-[#E5B869]/30 rounded-2xl -z-10"></div>
                            <div className="absolute -top-6 -left-6 h-48 w-48 bg-[#0A2958]/5 rounded-full blur-2xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20 lg:py-24 bg-slate-50 border-y border-slate-200/80">
                <div className="container mx-auto px-4 lg:px-8 max-w-[1340px]">
                    <div className="text-center mb-16 space-y-3">
                        <div className="inline-block text-xs sm:text-sm font-black uppercase tracking-wider text-[#0A2958] px-4 py-1.5 bg-white border border-slate-200 rounded-full">
                            {t('values.badge')}
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A2958] uppercase tracking-tight">
                            {t('values.title')}
                        </h2>
                        <div className="mx-auto h-1.5 w-24 bg-[#E5B869] rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: t('values.items.0.title'),
                                desc: t('values.items.0.desc'),
                            },
                            {
                                icon: Target,
                                title: t('values.items.1.title'),
                                desc: t('values.items.1.desc'),
                            },
                            {
                                icon: Users,
                                title: t('values.items.2.title'),
                                desc: t('values.items.2.desc'),
                            },
                        ].map((val, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 sm:p-10 space-y-5 rounded-xl shadow-sm border border-slate-200/70 hover:shadow-xl hover:border-[#E5B869]/60 transition-all duration-300 group"
                            >
                                <div className="h-16 w-16 rounded-xl bg-[#0A2958]/5 flex items-center justify-center text-[#0A2958] group-hover:bg-[#0A2958] group-hover:text-[#E5B869] transition-all duration-300">
                                    <val.icon size={32} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight group-hover:text-[#0A2958] transition-colors">
                                    {val.title}
                                </h3>
                                <p className="text-slate-700 font-medium text-base sm:text-lg leading-relaxed">
                                    {val.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Business Pillars - 2 Core Sectors */}
            <section className="py-20 lg:py-28 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 max-w-[1340px]">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-16">
                        <div className="space-y-3 text-left">
                            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0A2958]">
                                {t('pillars.badge')}
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A2958] uppercase tracking-tight leading-none">
                                {t('pillars.title')}{' '}
                                <span className="text-[#E5B869]">
                                    {t('pillars.titleAccent')}
                                </span>
                            </h2>
                        </div>
                        <p className="max-w-xl text-slate-700 font-medium text-base sm:text-lg leading-relaxed">
                            {t('pillars.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sector 1: Gạch men & Gạch trang trí */}
                        <div className="bg-gradient-to-b from-slate-50 to-white p-8 sm:p-10 space-y-6 rounded-2xl border-2 border-slate-200/80 hover:border-[#E5B869] hover:shadow-2xl transition-all duration-300 group relative">
                            <div className="flex items-center justify-between">
                                <div className="text-5xl font-black text-slate-200 group-hover:text-[#E5B869]/30 transition-colors">
                                    01
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                    <Grid className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl sm:text-2xl font-black text-[#0A2958] uppercase">
                                    {t('pillars.items.0.title')}
                                </h3>
                                <div className="h-1.5 w-16 bg-[#E5B869] rounded-full"></div>
                            </div>
                            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                                {t('pillars.items.0.desc')}
                            </p>
                            <div className="pt-4 border-t border-slate-200/70 text-xs sm:text-sm font-black tracking-wider text-slate-600 uppercase flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                {t('pillars.items.0.footer')}
                            </div>
                        </div>

                        {/* Sector 2: Điều hòa cục bộ dòng 2 cục */}
                        <div className="bg-gradient-to-b from-slate-50 to-white p-8 sm:p-10 space-y-6 rounded-2xl border-2 border-slate-200/80 hover:border-[#E5B869] hover:shadow-2xl transition-all duration-300 group relative">
                            <div className="flex items-center justify-between">
                                <div className="text-5xl font-black text-slate-200 group-hover:text-[#E5B869]/30 transition-colors">
                                    02
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                    <Wind className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl sm:text-2xl font-black text-[#0A2958] uppercase">
                                    {t('pillars.items.1.title')}
                                </h3>
                                <div className="h-1.5 w-16 bg-[#E5B869] rounded-full"></div>
                            </div>
                            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                                {t('pillars.items.1.desc')}
                            </p>
                            <div className="pt-4 border-t border-slate-200/70 text-xs sm:text-sm font-black tracking-wider text-slate-600 uppercase flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" />
                                {t('pillars.items.1.footer')}
                            </div>
                        </div>

                        {/* Sector 3: Điều hòa trung tâm VRV & Chiller */}
                        <div className="bg-gradient-to-b from-slate-50 to-white p-8 sm:p-10 space-y-6 rounded-2xl border-2 border-slate-200/80 hover:border-[#E5B869] hover:shadow-2xl transition-all duration-300 group relative">
                            <div className="flex items-center justify-between">
                                <div className="text-5xl font-black text-slate-200 group-hover:text-[#E5B869]/30 transition-colors">
                                    03
                                </div>
                                <div className="w-14 h-14 rounded-xl bg-[#0A2958]/10 text-[#0A2958] flex items-center justify-center">
                                    <Cpu className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl sm:text-2xl font-black text-[#0A2958] uppercase">
                                    {t('pillars.items.2.title')}
                                </h3>
                                <div className="h-1.5 w-16 bg-[#E5B869] rounded-full"></div>
                            </div>
                            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                                {t('pillars.items.2.desc')}
                            </p>
                            <div className="pt-4 border-t border-slate-200/70 text-xs sm:text-sm font-black tracking-wider text-slate-600 uppercase flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#0A2958]" />
                                {t('pillars.items.2.footer')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advanced HVAC & Climate Features */}
            <section className="py-20 lg:py-28 bg-[#0A2958] text-white overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-20 left-10 w-64 h-64 bg-[#E5B869]/10 rounded-full blur-2xl pointer-events-none"></div>
                <Globe2
                    size={420}
                    className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none"
                />
                <div className="container mx-auto px-4 lg:px-8 max-w-[1340px] relative z-10">
                    <div className="max-w-4xl mb-16 space-y-4">
                        <div className="inline-block text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#E5B869] px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                            {t('tech.badge')}
                        </div>
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none text-white">
                            {t('tech.title')}{' '}
                            <span className="text-[#E5B869]">{t('tech.titleAccent')}</span>
                        </h2>
                        <p className="text-slate-200 font-medium max-w-2xl leading-relaxed text-base sm:text-lg">
                            {t('tech.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: t('tech.items.0.title'),
                                desc: t('tech.items.0.desc'),
                            },
                            {
                                title: t('tech.items.1.title'),
                                desc: t('tech.items.1.desc'),
                            },
                            {
                                title: t('tech.items.2.title'),
                                desc: t('tech.items.2.desc'),
                            },
                            {
                                title: t('tech.items.3.title'),
                                desc: t('tech.items.3.desc'),
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-[#0E3570] hover:border-[#E5B869]/40 transition-all duration-300 group shadow-lg backdrop-blur-sm"
                            >
                                <div className="h-1.5 w-12 bg-[#E5B869] group-hover:w-full transition-all duration-300 rounded-full" />
                                <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-[#E5B869] transition-colors leading-snug">
                                    {feature.title}
                                </h4>
                                <p className="text-base text-slate-200 leading-relaxed font-medium group-hover:text-white">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Strategic Brands & Distribution Network */}
            <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200">
                <div className="container mx-auto px-4 lg:px-8 max-w-[1340px]">
                    <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-black text-[#0A2958] uppercase tracking-tight">
                            {t('certs.title')}
                        </h2>
                        <p className="text-slate-600 font-medium italic border-l-4 border-[#E5B869] pl-4 max-w-xl mx-auto text-sm sm:text-base">
                            {t('certs.quote')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {partners.map((partner, i) => {
                            const isZh = locale === 'zh';
                            const isEn = locale === 'en';
                            const partnerName = (isZh && partner.shortName_zh) ? partner.shortName_zh : (isEn && partner.shortName_en) ? partner.shortName_en : (partner.shortName || partner.name);
                            const partnerSector = (isZh && partner.sector_zh) ? partner.sector_zh : (isEn && partner.sector_en) ? partner.sector_en : partner.sector;
                            const partnerDesc = (isZh && partner.desc_zh) ? partner.desc_zh : (isEn && partner.desc_en) ? partner.desc_en : partner.desc;
                            const partnerBadge = (isZh && partner.badge_zh) ? partner.badge_zh : (isEn && partner.badge_en) ? partner.badge_en : partner.badge;
                            const partnerDiscount = (isZh && partner.discount_zh) ? partner.discount_zh : (isEn && partner.discount_en) ? partner.discount_en : partner.discount;
                            const logoSrc = partner.logo || '/images/dongduong/partners/dongtam.png';

                            return (
                                <div
                                    key={partner.id || `${partner.name}-${i}`}
                                    className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-[#E5B869] hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
                                >
                                    <div>
                                        {/* Top Bar: Badge & Discount */}
                                        <div className="flex items-center justify-between gap-2 mb-4">
                                            <span className="inline-block px-3 py-1 rounded-lg text-xs sm:text-sm font-bold bg-[#0A2958]/5 text-[#0A2958] uppercase tracking-wide">
                                                {partnerBadge}
                                            </span>
                                            {partnerDiscount && (
                                                <span className="inline-block px-3 py-1 rounded-lg text-xs sm:text-sm font-black bg-amber-500/10 text-amber-800 border border-amber-500/20">
                                                    {partnerDiscount}
                                                </span>
                                            )}
                                        </div>

                                        {/* Logo Container */}
                                        <div className="relative w-full h-28 mb-4 bg-slate-50/70 rounded-xl p-3 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                            <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                                <Image
                                                    src={logoSrc}
                                                    alt={partner.name}
                                                    fill
                                                    className="object-contain p-2"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            </div>
                                        </div>

                                        {/* Partner Details */}
                                        <div className="space-y-1.5">
                                            <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#0A2958] transition-colors uppercase tracking-tight line-clamp-1">
                                                {partnerName}
                                            </h3>
                                            <div className="text-sm sm:text-base font-extrabold text-[#E5B869] uppercase tracking-wide">
                                                {partnerSector}
                                            </div>
                                            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed pt-1 line-clamp-3">
                                                {partnerDesc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm sm:text-base">
                                        <div className="flex items-center gap-1.5 font-bold text-[#0A2958]">
                                            <CheckCircle2 size={16} className="text-[#E5B869]" />
                                            <span>{tPartners('officialBadge')}</span>
                                        </div>
                                        {partner.website && (
                                            <Link
                                                href={partner.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#0A2958] transition-colors"
                                                title={partner.name}
                                            >
                                                <span>{tPartners('viewPartner')}</span>
                                                <ExternalLink size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-[#0A2958] via-[#0D3169] to-[#081E38] relative overflow-hidden text-white">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E5B869]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-[1340px]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-8 space-y-6">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight text-[#E5B869]">
                                {t('cta.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed max-w-2xl">
                                {t('cta.desc')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="h-11 w-11 rounded-lg bg-[#E5B869]/20 flex items-center justify-center text-[#E5B869] shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            {t('cta.hotline')}
                                        </div>
                                        <a
                                            href={`tel:${COMPANY_INFO.phoneRaw}`}
                                            className="text-base font-bold text-white hover:text-[#E5B869] transition-colors"
                                        >
                                            {COMPANY_INFO.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="h-11 w-11 rounded-lg bg-[#E5B869]/20 flex items-center justify-center text-[#E5B869] shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            {t('cta.email')}
                                        </div>
                                        <a
                                            href={`mailto:${COMPANY_INFO.email}`}
                                            className="text-base font-bold text-white hover:text-[#E5B869] transition-colors"
                                        >
                                            {COMPANY_INFO.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex justify-start lg:justify-end">
                            <Link
                                href="/lien-he"
                                className="inline-flex items-center gap-4 px-10 py-5 bg-[#E5B869] text-[#0A2958] font-black uppercase tracking-wider rounded-xl shadow-2xl shadow-amber-500/30 hover:bg-white hover:text-[#0A2958] transition-all transform hover:-translate-y-1 hover:scale-105"
                            >
                                {t('cta.btnText')} <MoveRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
