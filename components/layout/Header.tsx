'use client';

import * as React from 'react';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import {
    Search,
    Menu,
    X,
    ChevronDown,
    Check,
    Phone,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSiteInfo } from '@/components/providers/site-info-provider';

type Locale = 'vi' | 'en' | 'zh';

const isLocale = (value: string | undefined): value is Locale => value === 'vi' || value === 'en' || value === 'zh';

export default function Header() {
    const COMPANY_INFO = useSiteInfo();
    const t = useTranslations('Header');
    const ts = useTranslations('Solutions');
    const intlLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const nextPathname = useNextPathname();
    const params = useParams<{ locale?: string | string[] }>();

    const [isScrolled, setIsScrolled] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const desktopLangRef = React.useRef<HTMLDivElement>(null);
    const mobileLangRef = React.useRef<HTMLDivElement>(null);

    const routeLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
    const activeLocale = React.useMemo<Locale>(() => {
        if (isLocale(routeLocale)) return routeLocale;
        const localeFromPath = nextPathname.split('/')[1];
        if (isLocale(localeFromPath)) return localeFromPath;
        if (isLocale(intlLocale)) return intlLocale;
        return 'vi';
    }, [intlLocale, nextPathname, routeLocale]);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    React.useEffect(() => {
        if (!languageMenuOpen) return;
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                desktopLangRef.current?.contains(target) ||
                mobileLangRef.current?.contains(target)
            ) {
                return;
            }
            setLanguageMenuOpen(false);
        };
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [languageMenuOpen]);

    const getLocalizedUrl = React.useCallback((nextLocale: Locale) => {
        if (typeof window === 'undefined') return `/${nextLocale}`;
        const curPath = window.location.pathname;
        let nextPath = curPath;
        if (
            curPath === '/vi' || curPath === '/vi/' ||
            curPath === '/en' || curPath === '/en/' ||
            curPath === '/zh' || curPath === '/zh/' ||
            curPath === '/'
        ) {
            nextPath = `/${nextLocale}`;
        } else if (curPath.startsWith('/vi/')) {
            nextPath = `/${nextLocale}/${curPath.slice(4)}`;
        } else if (curPath.startsWith('/en/')) {
            nextPath = `/${nextLocale}/${curPath.slice(4)}`;
        } else if (curPath.startsWith('/zh/')) {
            nextPath = `/${nextLocale}/${curPath.slice(4)}`;
        } else {
            nextPath = `/${nextLocale}${curPath.startsWith('/') ? curPath : `/${curPath}`}`;
        }
        return nextPath + window.location.search + window.location.hash;
    }, []);

    const switchLocale = React.useCallback((nextLocale: Locale) => {
        setLanguageMenuOpen(false);
        document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        if (typeof window !== 'undefined') {
            const targetUrl = getLocalizedUrl(nextLocale);
            window.location.href = targetUrl;
        }
    }, [getLocalizedUrl]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}` as "/san-pham");
            setMobileMenuOpen(false);
        }
    };

    const navItems = [
        { label: t('home'), href: '/' },
        { label: t('about'), href: '/gioi-thieu' },
        { label: t('solutions'), href: '/giai-phap/dieu-hoa-trung-tam-vrv-chiller' },
        { label: t('products'), href: '/san-pham' },
        { label: t('projects'), href: '/du-an' },
        { label: t('news'), href: '/tin-tuc' },
        { label: t('careers'), href: '/tuyen-dung' },
        { label: t('contact'), href: '/lien-he' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0A2958] text-white overflow-visible',
                isScrolled ? 'shadow-2xl' : ''
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1340px] overflow-visible min-h-[64px] sm:min-h-[70px] lg:min-h-[76px] flex items-center justify-between gap-4">
                {/* Brand Logo with Hanging Triangular Pennant Pointing Down into Hero */}
                <Link
                    href="/"
                    className="relative self-stretch flex items-center gap-2.5 sm:gap-3.5 shrink-0 group z-30 select-none overflow-visible"
                >
                    {/* Emblem Container (Emblem + Hanging Chevron attached to bottom of navbar) */}
                    <div className="relative self-stretch flex items-center justify-center shrink-0">
                        {/* 3D Gold Emblem (centered vertically, extends below navbar deep into chevron) */}
                        <div className="relative z-20 w-[54px] h-[60px] sm:w-[66px] sm:h-[74px] lg:w-[78px] lg:h-[86px] translate-y-3 sm:translate-y-4 lg:translate-y-5 shrink-0 drop-shadow-lg group-hover:scale-[1.03] transition-transform duration-200">
                            <Image
                                src="/images/dongduong/dongduong_emblem_tight.png"
                                alt="Đông Dương Emblem"
                                fill
                                priority
                                sizes="(max-width: 640px) 54px, (max-width: 1024px) 66px, 78px"
                                className="object-contain"
                            />
                        </div>

                        {/* Hanging Chevron SVG (positioned at top-full of self-stretch container = EXACT bottom edge of header) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] pointer-events-none">
                            <svg
                                className="w-[76px] h-[23px] sm:w-[90px] sm:h-[27px] lg:w-[104px] lg:h-[31px]"
                                viewBox="0 0 104 31"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M 0 0 L 52 30 L 104 0 Z" fill="#0A2958" />
                                <path
                                    d="M 0 0 L 52 30 L 104 0"
                                    stroke="#E5B869"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M 1.5 0.5 L 52 29.5 L 102.5 0.5"
                                    stroke="#FFF5D6"
                                    strokeWidth="1"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    opacity="0.8"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Brand Name: 3D Gold 'ĐÔNG DƯƠNG' */}
                    <div className="flex flex-col justify-center">
                        <div className="relative h-6 sm:h-7 lg:h-8.5 w-28 sm:w-36 lg:w-44 shrink-0">
                            <Image
                                src="/images/dongduong/new_text_clean.png"
                                alt="ĐÔNG DƯƠNG"
                                fill
                                priority
                                sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
                                className="object-contain object-left group-hover:brightness-110 transition-all duration-300"
                            />
                        </div>
                    </div>
                </Link>

                {/* Desktop Right Side: Top Utilities + Navigation */}
                <div className="hidden lg:flex flex-col items-end justify-center py-2 gap-1.5 flex-1 pl-6">
                        {/* Top Utility Row (Search, Language) */}
                        <div className="flex items-center gap-5 text-sm text-slate-200">
                            {/* Search Form Input */}
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 xl:w-56 px-4 py-2 pr-9 bg-white text-slate-900 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E5B869] placeholder:text-slate-400 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    aria-label={t('search')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Language Switcher Dropdown */}
                            <div ref={desktopLangRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setLanguageMenuOpen((o) => !o)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-sm font-bold"
                                >
                                    <span>{activeLocale === 'vi' ? '🇻🇳' : activeLocale === 'zh' ? '🇨🇳' : '🇬🇧'}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                                </button>

                                {languageMenuOpen && (
                                    <div
                                        onPointerDown={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-1.5 w-40 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-100 py-1 z-50 text-sm font-bold"
                                    >
                                        <a
                                            href={getLocalizedUrl('vi')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                switchLocale('vi');
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">🇻🇳 Tiếng Việt</span>
                                            {activeLocale === 'vi' && <Check className="w-4 h-4 text-amber-600" />}
                                        </a>
                                        <a
                                            href={getLocalizedUrl('en')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                switchLocale('en');
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">🇬🇧 English</span>
                                            {activeLocale === 'en' && <Check className="w-4 h-4 text-amber-600" />}
                                        </a>
                                        <a
                                            href={getLocalizedUrl('zh')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                switchLocale('zh');
                                            }}
                                            className="w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                        >
                                            <span className="flex items-center gap-2">🇨🇳 中文 (简体)</span>
                                            {activeLocale === 'zh' && <Check className="w-4 h-4 text-amber-600" />}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Navigation Menu Row */}
                        <nav className="flex items-center gap-3.5 xl:gap-6 pt-1">
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === '/'
                                        ? pathname === '/'
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href as "/"}
                                        className={cn(
                                            'text-sm sm:text-base lg:text-[16px] xl:text-[17px] font-extrabold tracking-wide uppercase transition-all duration-200 relative py-1 hover:text-[#E5B869]',
                                            isActive
                                                ? 'text-[#E5B869] font-black'
                                                : 'text-white'
                                        )}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5B869] rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div ref={mobileLangRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setLanguageMenuOpen((o) => !o)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/10 text-xs font-semibold"
                            >
                                <span>{activeLocale === 'vi' ? '🇻🇳' : activeLocale === 'zh' ? '🇨🇳' : '🇬🇧'}</span>
                                <ChevronDown className="w-3 h-3 text-slate-300" />
                            </button>

                            {languageMenuOpen && (
                                <div
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-1.5 w-36 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-100 py-1 z-50 text-xs font-bold"
                                >
                                    <a
                                        href={getLocalizedUrl('vi')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            switchLocale('vi');
                                        }}
                                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                    >
                                        <span>🇻🇳 Tiếng Việt</span>
                                        {activeLocale === 'vi' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                    </a>
                                    <a
                                        href={getLocalizedUrl('en')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            switchLocale('en');
                                        }}
                                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                    >
                                        <span>🇬🇧 English</span>
                                        {activeLocale === 'en' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                    </a>
                                    <a
                                        href={getLocalizedUrl('zh')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            switchLocale('zh');
                                        }}
                                        className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                                    >
                                        <span>🇨🇳 中文 (简体)</span>
                                        {activeLocale === 'zh' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                    </a>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle Menu"
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute inset-x-0 top-full bg-[#0A2958] border-b border-white/10 shadow-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 pr-10 bg-white text-slate-900 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#E5B869] placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            aria-label={t('search')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </form>

                    <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => {
                            const isActive =
                                item.href === '/'
                                    ? pathname === '/'
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href as "/"}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'px-4 py-3 rounded-xl text-base sm:text-lg font-black tracking-wide uppercase transition-colors',
                                        isActive
                                            ? 'text-[#E5B869] bg-white/10 font-black'
                                            : 'text-white hover:text-[#E5B869] hover:bg-white/5'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-3 border-t border-white/10">
                        <a
                            href={`tel:${COMPANY_INFO.hotlineRaw}`}
                            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-lg active:scale-98 transition-transform"
                        >
                            <Phone className="w-5 h-5 fill-slate-950 text-slate-950" />
                            <span>Hotline: {COMPANY_INFO.hotline}</span>
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
