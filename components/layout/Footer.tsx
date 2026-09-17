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

                        {/* 4 Official Quality & Security Badges (2x2 Grid) */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                            {/* Badge 1: Bo Cong Thuong */}
                            <div className="bg-white rounded-xl p-2 border-2 border-[#D32F2F] flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] transition-transform">
                                <div className="w-full bg-[#D32F2F] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider py-0.5 rounded-t-md -mt-2">
                                    Đã thông báo
                                </div>
                                <div className="my-1 flex items-center justify-center">
                                    <svg width="28" height="28" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="#0D47A1" />
                                        <circle cx="50" cy="50" r="40" fill="#D32F2F" stroke="#FFFFFF" strokeWidth="2" />
                                        <circle cx="50" cy="50" r="26" fill="#FFD700" opacity="0.9" />
                                        <polygon points="50,22 57,38 74,38 60,49 66,66 50,56 34,66 40,49 26,38 43,38" fill="#D32F2F" />
                                        <circle cx="50" cy="50" r="10" fill="#FFD700" />
                                        <polygon points="50,38 53,46 62,46 55,51 58,60 50,55 42,60 45,51 38,46 47,46" fill="#D32F2F" />
                                    </svg>
                                </div>
                                <span className="text-[#0D47A1] text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight leading-tight">
                                    Bộ Công Thương
                                </span>
                            </div>

                            {/* Badge 2: ISO 9001:2015 */}
                            <div className="bg-gradient-to-br from-[#091E36] to-[#12365F] rounded-xl p-2 border-2 border-[#E5B869] flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] transition-transform text-white">
                                <div className="text-[#E5B869] text-[8px] sm:text-[9px] tracking-widest leading-none mb-0.5">
                                    ★★★★★
                                </div>
                                <div className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                                    ISO 9001
                                </div>
                                <div className="text-[#E5B869] text-[10px] font-bold leading-tight">
                                    : 2015
                                </div>
                                <div className="bg-[#E5B869] text-[#091E36] text-[7.5px] sm:text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1 tracking-wider leading-none">
                                    Quality Certified
                                </div>
                            </div>

                            {/* Badge 3: DMCA Protected */}
                            <div className="bg-[#0F172A] rounded-xl p-2 border-2 border-[#06B6D4] flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] transition-transform">
                                <div className="flex items-center gap-1">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2.5">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    </svg>
                                    <span className="text-xs sm:text-sm font-black text-[#06B6D4] tracking-wider leading-none">
                                        DMCA
                                    </span>
                                    <span className="bg-[#06B6D4] text-[#0F172A] text-[6.5px] font-black px-1 py-0.5 rounded leading-none">
                                        .COM
                                    </span>
                                </div>
                                <div className="text-slate-100 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">
                                    Protected
                                </div>
                                <div className="text-slate-400 text-[7px] sm:text-[8px] font-medium leading-none mt-0.5">
                                    Bản quyền số
                                </div>
                            </div>

                            {/* Badge 4: QUATEST 3 / TCVN */}
                            <div className="bg-white rounded-xl p-2 border-2 border-[#0284C7] flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] transition-transform">
                                <span className="text-[#0284C7] text-[11px] sm:text-xs font-black tracking-tight leading-none">
                                    QUATEST 3
                                </span>
                                <div className="my-0.5">
                                    <svg width="20" height="20" viewBox="0 0 60 60" fill="none">
                                        <circle cx="30" cy="30" r="26" stroke="#0284C7" strokeWidth="3" strokeDasharray="6 3"/>
                                        <circle cx="30" cy="30" r="18" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5"/>
                                        <path d="M 22 30 L 28 36 L 40 24" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="text-slate-600 text-[7px] sm:text-[7.5px] font-bold uppercase leading-none">
                                    TCVN / ISO 17025
                                </div>
                                <div className="bg-[#0284C7] text-white text-[7px] sm:text-[7.5px] font-bold px-1.5 py-0.5 rounded mt-1 leading-none">
                                    Đạt kiểm định
                                </div>
                            </div>
                        </div>

                        {/* Certified Security Assurance */}
                        <div className="flex items-center justify-center gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-2.5 py-2 mt-2 shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-[11px] xl:text-[11.5px] text-emerald-200/95 font-semibold whitespace-nowrap leading-none">
                                {t('securityWarning')}
                            </span>
                        </div>
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
