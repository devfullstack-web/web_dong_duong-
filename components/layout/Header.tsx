'use client';

import * as React from 'react';
import { useParams, usePathname as useNextPathname } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Check, Facebook, Globe, Linkedin, Mail, Menu, Phone, X, Youtube, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import { SITE_ROUTES } from '@/constants/routes';
import { COMPANY_INFO } from '@/constants/site-info';

type Locale = 'vi' | 'en';

const isLocale = (value: string | undefined): value is Locale => value === 'vi' || value === 'en';

interface NavLink {
    label: string;
    href: string;
    submenu?: { title: string; href: string; external?: boolean }[];
    featured?: { title: string; desc: string; href: string }[];
}

export default function Header() {
    const t = useTranslations('Header');
    const ts = useTranslations('Solutions');
    const intlLocale = useLocale();
    const router = useRouter();
    const params = useParams<{ locale?: string | string[] }>();

    const NAV_LINKS: NavLink[] = [
        { label: t('home'), href: SITE_ROUTES.HOME },
        { label: t('about'), href: SITE_ROUTES.ABOUT },
        {
            label: t('solutions'),
            href: '#',
            featured: [
                {
                    title: ts('waterManagement'),
                    desc: ts('waterManagementDesc'),
                    href: SITE_ROUTES.SOLUTIONS.WATER_MANAGEMENT,
                },
                {
                    title: ts('agriculture'),
                    desc: ts('agricultureDesc'),
                    href: SITE_ROUTES.SOLUTIONS.AGRICULTURE,
                },
            ],
        },
        {
            label: t('products'),
            href: SITE_ROUTES.PRODUCTS,
            submenu: [
                {
                    title: t('products'),
                    href: SITE_ROUTES.PRODUCTS,
                },
                {
                    title: t('iotControlSoftware'),
                    href: 'https://iot.saigonvalve.vn/login',
                    external: true,
                },
            ],
        },
        { label: t('projects'), href: SITE_ROUTES.PROJECTS },
        { label: t('news'), href: SITE_ROUTES.NEWS },
        { label: t('recruitment'), href: SITE_ROUTES.RECRUITMENT },
        { label: t('contact'), href: SITE_ROUTES.CONTACT },
    ];
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false);
    const [expandedLinks, setExpandedLinks] = React.useState<Record<string, boolean>>({});
    const languageMenuRef = React.useRef<HTMLDivElement>(null);

    const toggleExpand = (label: string) => {
        setExpandedLinks((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    React.useEffect(() => {
        if (!mobileMenuOpen) {
            setExpandedLinks({});
        }
    }, [mobileMenuOpen]);
    const mobileSocialLinks = [
        { label: 'Facebook', Icon: Facebook, href: COMPANY_INFO.social.facebook },
        { label: 'LinkedIn', Icon: Linkedin, href: COMPANY_INFO.social.linkedin },
        { label: 'YouTube', Icon: Youtube, href: COMPANY_INFO.social.youtube },
        { label: 'Zalo', href: COMPANY_INFO.social.zalo },
    ].filter((item) => item.href);
    const pathname = usePathname();
    const nextPathname = useNextPathname();
    const routeLocale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
    const activeLocale = React.useMemo<Locale>(() => {
        if (isLocale(routeLocale)) {
            return routeLocale;
        }

        const localeFromPath = nextPathname.split('/')[1];

        if (isLocale(localeFromPath)) {
            return localeFromPath;
        }

        if (isLocale(intlLocale)) {
            return intlLocale;
        }

        return 'vi';
    }, [intlLocale, nextPathname, routeLocale]);

    React.useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    React.useEffect(() => {
        if (!languageMenuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!languageMenuRef.current?.contains(event.target as Node)) {
                setLanguageMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLanguageMenuOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [languageMenuOpen]);

    const switchLocale = React.useCallback(
        (nextLocale: Locale) => {
            setLanguageMenuOpen(false);

            if (nextLocale === activeLocale) {
                setMobileMenuOpen(false);
                return;
            }

            document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
            setMobileMenuOpen(false);
            router.replace(pathname + window.location.search + window.location.hash, {
                locale: nextLocale,
                scroll: false,
            });
        },
        [activeLocale, pathname, router],
    );

  return (
    <header 
      className={cn(
        "fixed top-0 lg:top-8 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "lg:top-0 bg-white dark:bg-background shadow-md py-1.5 lg:py-2" 
          : "bg-white dark:bg-background border-b border-border py-2.5 lg:py-3.5"
      )}
    >
      <div className="container mx-auto px-4 lg:px-3 xl:px-8">
        <nav className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href={SITE_ROUTES.HOME} className="relative h-11 lg:h-12 xl:h-14 w-36 lg:w-40 xl:w-48 shrink-0 group flex items-center">
            <img
              src="/images/logo/logo.png"
              alt={t('logoAlt')}
              className="object-contain group-hover:scale-105 transition-transform h-9 lg:h-10 xl:h-12.5 w-auto"
            />
          </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
                        <NavigationMenu viewport={false}>
                            <NavigationMenuList className="gap-1 xl:gap-2">
                                {mounted &&
                                    NAV_LINKS.map((link) => (
                                        <NavigationMenuItem key={link.label} className="relative">
                                            {'submenu' in link || 'featured' in link ? (
                                                <>
                                                    <NavigationMenuTrigger
                                                        className={cn(
                                                            'h-9 xl:h-10 px-2 xl:px-4 text-[12px] xl:text-[13px] font-bold xl:font-black uppercase tracking-widest bg-transparent hover:bg-transparent! focus:bg-transparent! active:bg-transparent! data-[state=open]:bg-transparent! data-[active]:bg-transparent! hover:text-brand-primary! active:bg-transparent data-[state=open]:text-brand-primary! transition-colors relative after:absolute after:bottom-0 after:left-2 after:right-6 after:h-[2px] after:bg-brand-primary after:transition-transform after:duration-300 after:origin-left',
                                                            pathname === link.href || (link.href === '#' && (link.submenu || link.featured)?.some(sub => pathname === sub.href))
                                                                ? 'text-brand-primary! after:scale-x-100'
                                                                : 'text-foreground after:scale-x-0 hover:after:scale-x-100',
                                                        )}
                                                    >
                                                        {link.label}
                                                    </NavigationMenuTrigger>
                                                    <NavigationMenuContent className="p-0 border border-slate-100 dark:border-white/10 shadow-lg w-auto!">
                                                        <ul className="grid w-[280px] gap-1 p-2 grid-cols-1 bg-white dark:bg-background rounded-md">
                                                            {(link.submenu || link.featured)?.map(
                                                                (item: any) => (
                                                                    <ListItem
                                                                        key={item.title}
                                                                        title={item.title}
                                                                        href={item.href}
                                                                        external={item.external}
                                                                    >
                                                                        {item.desc}
                                                                    </ListItem>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </NavigationMenuContent>
                                                </>
                                            ) : (
                                                <NavigationMenuLink
                                                    asChild
                                                    active={pathname === link.href}
                                                    className="bg-transparent! hover:bg-transparent! focus:bg-transparent! active:bg-transparent! data-[active=true]:bg-transparent! data-[active=true]:text-brand-primary!"
                                                >
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            'group inline-flex h-max w-max items-center justify-center rounded-sm bg-transparent px-2 xl:px-4 py-1.5 xl:py-2 text-[12px] xl:text-[13px] font-bold xl:font-black uppercase tracking-widest transition-colors hover:text-brand-primary! focus:outline-none relative after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-brand-primary after:transition-transform after:duration-300 after:origin-left',
                                                            pathname === link.href
                                                                ? 'text-brand-primary! after:scale-x-100'
                                                                : 'text-foreground after:scale-x-0 hover:after:scale-x-100',
                                                        )}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </NavigationMenuLink>
                                            )}
                                        </NavigationMenuItem>
                                    ))}
                            </NavigationMenuList>
                        </NavigationMenu>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 xl:gap-6 pl-1.5 xl:pl-8 dark:border-white/10">
                            <div ref={languageMenuRef} className="relative ml-1">
                                <button
                                    type="button"
                                    aria-haspopup="menu"
                                    aria-expanded={languageMenuOpen}
                                    onClick={() => setLanguageMenuOpen((open) => !open)}
                                    className="flex items-center border border-slate-100 dark:border-white/10 px-2 xl:px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-sm outline-none hover:border-brand-primary/30 transition-colors"
                                >
                                    <Globe size={14} className="mr-1.5 xl:mr-2 text-brand-primary" />
                                    <span className="text-[12px] xl:text-[13px] font-bold xl:font-black tracking-widest uppercase">
                                        {activeLocale}
                                    </span>
                                </button>

                                {languageMenuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 top-full z-50 mt-2 min-w-36 border border-slate-100 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-slate-900"
                                    >
                                        <button
                                            type="button"
                                            role="menuitemradio"
                                            aria-checked={activeLocale === 'vi'}
                                            onClick={() => switchLocale('vi')}
                                            className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-xs font-black tracking-widest uppercase text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                                        >
                                            {t('vi')}
                                            {activeLocale === 'vi' && (
                                                <Check
                                                    size={12}
                                                    className="ml-2 text-brand-primary"
                                                />
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            role="menuitemradio"
                                            aria-checked={activeLocale === 'en'}
                                            onClick={() => switchLocale('en')}
                                            className="flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-xs font-black tracking-widest uppercase text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                                        >
                                            {t('en')}
                                            {activeLocale === 'en' && (
                                                <Check
                                                    size={12}
                                                    className="ml-2 text-brand-primary"
                                                />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="flex items-center gap-4 lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-foreground hover:text-brand-primary transition-colors"
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/10 overflow-y-auto no-scrollbar max-h-[calc(100vh-5rem)] shadow-2xl rounded-b-2xl border-b border-x border-slate-100 dark:border-white/10"
                    >
                        <div className="container mx-auto px-5 py-4 space-y-3.5">
                            {/* Language Switcher for Mobile */}
                            <div className="flex items-center justify-between py-2 border-b border-slate-100/50 dark:border-white/5">
                                <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Globe size={14} className="text-brand-primary" />
                                    {t('language')}:
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => switchLocale('vi')}
                                        className={cn(
                                            'px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full border transition-all duration-300',
                                            activeLocale === 'vi'
                                                ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        VI
                                    </button>
                                    <button
                                        onClick={() => switchLocale('en')}
                                        className={cn(
                                            'px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full border transition-all duration-300',
                                            activeLocale === 'en'
                                                ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/10'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>

                            {NAV_LINKS.map((link) => {
                                const hasSubmenu = "submenu" in link || "featured" in link;
                                const isExpanded = !!expandedLinks[link.label];
                                const isSubmenuActive = link.href === '#' && (link.submenu || link.featured)?.some(sub => pathname === sub.href);
                                
                                return (
                                    <div key={link.label} className="border-b border-slate-100/50 dark:border-white/5 pb-1.5 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            {link.href === '#' ? (
                                                <button
                                                    onClick={() => toggleExpand(link.label)}
                                                    className={cn(
                                                        "flex items-center justify-between w-full text-xs sm:text-sm font-bold uppercase tracking-wider text-left transition-colors py-1.5",
                                                        isSubmenuActive
                                                            ? "text-brand-primary!"
                                                            : "text-foreground hover:text-brand-primary!"
                                                    )}
                                                >
                                                    <span>{link.label}</span>
                                                    <ChevronDown 
                                                        size={16} 
                                                        className={cn(
                                                            "text-muted-foreground/75 transition-transform duration-300",
                                                            isExpanded && "rotate-180 text-brand-primary"
                                                        )}
                                                    />
                                                </button>
                                            ) : (
                                                <>
                                                    <Link 
                                                        href={link.href}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className={cn(
                                                            "flex-1 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors py-1.5",
                                                            pathname === link.href
                                                                ? "text-brand-primary!"
                                                                : "text-foreground hover:text-brand-primary!"
                                                        )}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                    {hasSubmenu && (
                                                        <button
                                                            onClick={() => toggleExpand(link.label)}
                                                            className="p-2 -mr-2 text-muted-foreground/75 hover:text-brand-primary transition-colors"
                                                            aria-label={`Toggle ${link.label} submenu`}
                                                        >
                                                            <ChevronDown 
                                                                size={16} 
                                                                className={cn(
                                                                    "transition-transform duration-300",
                                                                    isExpanded && "rotate-180 text-brand-primary"
                                                                )}
                                                            />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {hasSubmenu && (
                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pl-4 mt-1 mb-1 py-0.5 grid grid-cols-1 gap-1.5 border-l border-brand-primary/20">
                                                            {(link.submenu || link.featured)?.map((item: any) => {
                                                                const isSubActive = pathname === item.href;
                                                                const subLinkContent = (
                                                                    <span className={cn(
                                                                        "text-xs sm:text-xs font-semibold transition-colors flex items-center gap-1.5 py-0.5",
                                                                        isSubActive
                                                                            ? "text-brand-primary!"
                                                                            : "text-muted-foreground hover:text-brand-primary!"
                                                                    )}>
                                                                        <span className={cn(
                                                                            "h-1 w-1 rounded-full transition-colors",
                                                                            isSubActive 
                                                                                ? "bg-brand-primary"
                                                                                : "bg-brand-primary/40 group-hover:bg-brand-primary"
                                                                        )} />
                                                                        {item.title}
                                                                    </span>
                                                                );
                                                                
                                                                return item.external ? (
                                                                    <a
                                                                        key={item.title}
                                                                        href={item.href}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                        className="group block"
                                                                    >
                                                                        {subLinkContent}
                                                                    </a>
                                                                ) : (
                                                                    <Link
                                                                        key={item.title}
                                                                        href={item.href}
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                        className="group block"
                                                                    >
                                                                        {subLinkContent}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                );
                            })}
                            
                            <div className="pt-4 border-t border-slate-100/50 dark:border-white/5 space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <a href={`tel:${COMPANY_INFO.hotlineRaw}`} className="flex items-center gap-3 text-muted-foreground hover:text-brand-primary transition-colors group">
                                        <div className="h-8 w-8 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-full transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105">
                                            <Phone size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Hotline</span>
                                            <span className="font-bold text-xs sm:text-xs tracking-wider text-foreground">{COMPANY_INFO.hotline}</span>
                                        </div>
                                    </a>
                                    <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-brand-primary transition-colors group">
                                        <div className="h-8 w-8 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-full transition-all group-hover:bg-brand-primary group-hover:text-white group-hover:scale-105">
                                            <Mail size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Email</span>
                                            <span className="font-bold text-xs sm:text-xs tracking-wider text-foreground truncate max-w-[200px]">{COMPANY_INFO.email}</span>
                                        </div>
                                    </a>
                                </div>
                                
                                {mobileSocialLinks.length > 0 && (
                                    <div className="flex items-center gap-2 pt-1">
                                        {mobileSocialLinks.map(({ label, Icon, href }) => (
                                            <a
                                                key={label}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={label}
                                                className="h-8 px-2.5 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-full border border-slate-100 dark:border-white/5 transition-all hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:scale-105"
                                            >
                                                {Icon ? <Icon size={14} /> : <span className="text-[8px] font-bold uppercase tracking-wider">Zalo</span>}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
    </header>
  );
}

const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'> & { title: string; external?: boolean; href: string }
>(({ className, title, children, external, href, ...props }, ref) => {
    const content = (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-black uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                {title}
            </div>
            {children && (
                <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-muted-foreground/80 italic">
                    {children}
                </p>
            )}
        </div>
    );

    return (
        <li>
            <NavigationMenuLink asChild>
                {external ? (
                    <a
                        ref={ref}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'block select-none space-y-1 rounded-sm p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 focus:bg-slate-100/50 dark:focus:bg-slate-800/50 group',
                            className,
                        )}
                        {...props}
                    >
                        {content}
                    </a>
                ) : (
                    <Link
                        href={href}
                        className={cn(
                            'block select-none space-y-1 rounded-sm p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 focus:bg-slate-100/50 dark:focus:bg-slate-800/50 group',
                            className,
                        )}
                    >
                        {content}
                    </Link>
                )}
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = 'ListItem';
