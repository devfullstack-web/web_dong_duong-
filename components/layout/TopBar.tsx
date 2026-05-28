'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Phone, Mail, Clock, Facebook, Linkedin, Youtube } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { COMPANY_INFO } from '@/constants/site-info';

export default function TopBar() {
    const t = useTranslations('Company');
    const [isScrolled, setIsScrolled] = React.useState(false);
    const socialLinks = [
        { label: 'Facebook', Icon: Facebook, href: COMPANY_INFO.social.facebook },
        { label: 'LinkedIn', Icon: Linkedin, href: COMPANY_INFO.social.linkedin },
        { label: 'YouTube', Icon: Youtube, href: COMPANY_INFO.social.youtube },
        { label: 'Zalo', href: COMPANY_INFO.social.zalo },
    ].filter((item) => item.href);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={cn(
                'hidden lg:block fixed top-0 left-0 right-0 z-60 bg-brand-primary py-2 border-b border-white/5 transition-all duration-300',
                isScrolled && '-translate-y-full opacity-0',
            )}
        >
            <div className="container mx-auto px-8">
                <div className="flex items-center justify-between text-white/70">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest leading-none">
                            <Phone size={12} className="text-brand-accent" />
                            <a
                                href={`tel:${COMPANY_INFO.hotlineRaw}`}
                                className="hover:text-white transition-colors"
                            >
                                {COMPANY_INFO.hotline}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest leading-none">
                            <Mail size={12} className="text-brand-accent" />
                            <a
                                href={`mailto:${COMPANY_INFO.email}`}
                                className="hover:text-white transition-colors uppercase"
                            >
                                {COMPANY_INFO.email}
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest leading-none">
                            <Clock size={12} className="text-brand-accent" />
                            <span>{t('workingHoursWeekdays')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                            Follow us:
                        </span>
                        <div className="flex items-center gap-4">
                            {socialLinks.map(({ label, Icon, href }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    className="hover:text-brand-accent transition-colors"
                                    aria-label={label}
                                >
                                    {Icon ? (
                                        <Icon size={14} />
                                    ) : (
                                        <span className="text-[9px] font-black uppercase leading-none">Zalo</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
