'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
    Facebook,
    Linkedin,
    Youtube,
    Mail,
    Phone,
    MapPin,
    Instagram,
    ShieldCheck,
} from 'lucide-react';
import { useSiteInfo } from '@/components/providers/site-info-provider';
import { PORTAL_ROUTES } from '@/constants/routes';

export default function Footer() {
    const COMPANY_INFO = useSiteInfo();
    const t = useTranslations('Footer');

    return (
        <footer id="footer" className="bg-[#081E38] text-white pt-14 pb-6 border-t-2 border-amber-500/30 relative overflow-hidden">
            {/* Top decorative subtle lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5B869] to-transparent opacity-60" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
                    {/* Col 1: Brand & Contact (lg:col-span-4) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="relative h-14 sm:h-16 w-64 sm:w-72 shrink-0">
                                <Image
                                    src="/images/dongduong/dongduong_logo_horizontal.png"
                                    alt="Đông Dương Corporation Logo"
                                    fill
                                    sizes="288px"
                                    className="object-contain object-left drop-shadow-md"
                                />
                            </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#E5B869] pt-1">
                            {t('companyTitle')}
                        </h3>

                        <ul className="space-y-3 text-sm sm:text-base text-slate-200 font-medium">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#E5B869] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{COMPANY_INFO.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-[#E5B869] shrink-0" />
                                <a
                                    href={`tel:${COMPANY_INFO.hotlineRaw}`}
                                    className="text-base sm:text-lg font-black text-[#E5B869] hover:text-amber-300 transition-colors"
                                >
                                    {COMPANY_INFO.hotline}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-[#E5B869] shrink-0" />
                                <a
                                    href={`mailto:${COMPANY_INFO.email}`}
                                    className="hover:text-amber-300 transition-colors"
                                >
                                    {COMPANY_INFO.email}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Col 2: SẢN PHẨM & DỊCH VỤ (lg:col-span-3) */}
                    <div className="lg:col-span-3 space-y-3.5">
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
                            {t('productsAndServices')}
                        </h4>
                        <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 font-medium">
                            <li>
                                <Link href="/san-pham" className="hover:text-amber-300 transition-colors">
                                    {t('commoditiesTrading')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/san-pham" className="hover:text-amber-300 transition-colors">
                                    {t('materialsSupply')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/giai-phap/dieu-hoa-trung-tam-vrv-chiller" className="hover:text-amber-300 transition-colors">
                                    {t('logisticsServices')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/tin-tuc" className="hover:text-amber-300 transition-colors">
                                    {t('training')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: QUY TRÌNH & ĐIỀU KHOẢN (lg:col-span-2) */}
                    <div className="lg:col-span-2 space-y-3.5">
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
                            {t('processAndTerms')}
                        </h4>
                        <ul className="space-y-2.5 text-sm sm:text-base text-slate-200 font-medium">
                            <li>
                                <Link href="/tuyen-dung" className="hover:text-amber-300 transition-colors">
                                    {t('careers')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/lien-he" className="hover:text-amber-300 transition-colors">
                                    {t('faqs')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/lien-he" className="hover:text-amber-300 transition-colors">
                                    {t('techSupport')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/lien-he" className="hover:text-amber-300 transition-colors">
                                    {t('terms')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: CHỨNG NHẬN (lg:col-span-3) */}
                    <div className="lg:col-span-3 space-y-3.5">
                        <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-2.5">
                            {t('standards')}
                        </h4>
                        <div className="relative w-full h-18 sm:h-22 bg-white/5 rounded-xl p-2 border border-white/10 overflow-hidden flex items-center justify-center">
                            <Image
                                src="/images/dongduong/footer-badges.png"
                                alt="Chứng nhận ISO 9001, IOTA, Bộ Công Thương, DMCA Protected"
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-contain p-1"
                            />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium text-center sm:text-left pt-1">
                            {t('securityWarning')}
                        </p>
                    </div>
                </div>

                {/* Bottom Bar: Copyright, Admin Portal & Socials */}
                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 font-medium">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                        <p>{t('copyright')}</p>
                        <span className="hidden sm:inline text-white/20">•</span>
                        <Link
                            href={PORTAL_ROUTES.dashboard as string}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#E5B869]/20 border border-white/10 hover:border-[#E5B869]/50 text-slate-200 hover:text-[#E5B869] text-xs sm:text-sm font-bold transition-all group shadow-sm"
                        >
                            <ShieldCheck className="w-4 h-4 text-[#E5B869] group-hover:scale-110 transition-transform" />
                            <span>{t('admin')}</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {COMPANY_INFO.hotlineRaw && (
                            <a
                                href={`tel:${COMPANY_INFO.hotlineRaw}`}
                                aria-label="Hotline"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                        {COMPANY_INFO.social.facebook && (
                            <a
                                href={COMPANY_INFO.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {COMPANY_INFO.social.linkedin && (
                            <a
                                href={COMPANY_INFO.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {COMPANY_INFO.social.youtube && (
                            <a
                                href={COMPANY_INFO.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white flex items-center justify-center transition-all"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
