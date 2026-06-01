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
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import { useSiteInfo } from '@/components/providers/site-info-provider';
import { PORTAL_ROUTES } from '@/constants/routes';

export default function Footer() {
    const COMPANY_INFO = useSiteInfo();
    const t = useTranslations('Footer');
    const tCompany = useTranslations('Company');
    const socialLinks = [
        { label: 'Facebook', Icon: Facebook, href: COMPANY_INFO.social.facebook },
        { label: 'LinkedIn', Icon: Linkedin, href: COMPANY_INFO.social.linkedin },
        { label: 'YouTube', Icon: Youtube, href: COMPANY_INFO.social.youtube },
        { label: 'Zalo', href: COMPANY_INFO.social.zalo },
    ].filter((item) => item.href);

    return (
        <footer className="bg-brand-primary pt-10 pb-4 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>

            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-8 border-b border-white/5">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="relative block h-12 w-44 group">
                            <Image
                                src="/images/logo/logo.png"
                                alt="Sài Gòn Valve Logo"
                                fill
                                sizes="176px"
                                className="object-contain brightness-0 invert group-hover:scale-105 transition-transform"
                            />
                        </Link>
                        <p className="text-xs text-blue-100/90 font-bold uppercase tracking-widest leading-relaxed">
                            {t('slogan')}
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map(({ label, Icon, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="h-8 w-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm hover:bg-white hover:text-brand-primary hover:border-white text-white transition-all duration-300"
                                >
                                    {Icon ? (
                                        <Icon size={14} />
                                    ) : (
                                        <span className="text-[8px] font-black uppercase tracking-tight">Zalo</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-white/10 pb-2">
                            {t('navigationMenu')}
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { label: t('home'), href: '/' },
                                { label: t('about'), href: '/gioi-thieu' },
                                { label: t('products'), href: '/san-pham' },
                                { label: t('projects'), href: '/du-an' },
                                { label: t('news'), href: '/tin-tuc' },
                                { label: t('contact'), href: '/lien-he' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href as "/" | "/gioi-thieu" | "/san-pham" | "/du-an" | "/tin-tuc" | "/lien-he"}
                                        className="text-[11px] font-bold uppercase tracking-widest text-blue-100/80 hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                                    >
                                        <ArrowRight
                                            size={10}
                                            className="text-white group-hover:text-white transition-colors"
                                        />{' '}
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white border-b border-white/10 pb-2">
                            {t('contactInfo')}
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 group">
                                <MapPin
                                    className="text-white shrink-0 group-hover:text-white transition-colors"
                                    size={16}
                                />
                                <span className="text-[11px] text-blue-100/80 font-bold uppercase tracking-wider leading-relaxed">
                                    {COMPANY_INFO.address}
                                </span>
                            </li>
                            <li className="flex gap-3 items-center group">
                                <Phone
                                    className="text-white shrink-0 group-hover:text-white transition-colors"
                                    size={16}
                                />
                                <a
                                    href={`tel:${COMPANY_INFO.hotlineRaw}`}
                                    className="text-[11px] text-blue-100/90 font-black tracking-widest hover:text-white transition-colors"
                                >
                                    {COMPANY_INFO.hotline}
                                </a>
                            </li>
                            <li className="flex gap-3 items-center group">
                                <Mail
                                    className="text-white shrink-0 group-hover:text-white transition-colors"
                                    size={16}
                                />
                                <a
                                    href={`mailto:${COMPANY_INFO.email}`}
                                    className="text-[11px] text-blue-100/90 font-black tracking-widest uppercase hover:text-white transition-colors"
                                >
                                    {COMPANY_INFO.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-200/60 uppercase tracking-[0.15em]">
                            {COMPANY_INFO.copyright}
                        </p>
                        <div className="flex items-center gap-1.5 justify-center md:justify-start text-[10px] font-bold text-blue-200/70 uppercase tracking-widest">
                            <ShieldCheck size={12} className="text-white/80" />{' '}
                            {t('securityWarning')}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link
                            href="#"
                            className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 hover:text-white transition-colors"
                        >
                            {t('terms')}
                        </Link>
                        <Link
                            href="#"
                            className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 hover:text-white transition-colors"
                        >
                            {t('privacy')}
                        </Link>
                        <Link
                            href={PORTAL_ROUTES.dashboard as string}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 hover:text-white transition-colors"
                        >
                            {t('admin')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
