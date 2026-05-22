'use client';

import * as React from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Menu, X, Search, Globe, Phone, Mail, Check } from 'lucide-react';
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
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { SITE_ROUTES } from '@/constants/routes';
import { COMPANY_INFO } from "@/constants/site-info";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavLink {
    label: string;
    href: string;
    submenu?: { title: string; href: string; external?: boolean }[];
    featured?: { title: string; desc: string; href: string }[];
}

export default function Header() {
    const t = useTranslations('Header');
    const ts = useTranslations('Solutions');
    const locale = useLocale();
    const router = useRouter();

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
    const pathname = usePathname();

    React.useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 lg:top-8 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "lg:top-0 bg-white dark:bg-background shadow-md py-2" 
          : "bg-white dark:bg-background border-b border-border py-4"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href={SITE_ROUTES.HOME} className="relative h-12 w-40 xl:w-44 shrink-0 group flex items-center">
            <img
              src="/images/logo/logo.png"
              alt={t('logoAlt')}
              className="object-contain group-hover:scale-105 transition-transform h-10 xl:h-12 w-auto"
            />
          </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-2">
                        <NavigationMenu viewport={false}>
                            <NavigationMenuList className="gap-2">
                                {mounted &&
                                    NAV_LINKS.map((link) => (
                                        <NavigationMenuItem key={link.label} className="relative">
                                            {'submenu' in link || 'featured' in link ? (
                                                <>
                                                    <NavigationMenuTrigger
                                                        className={cn(
                                                            'h-10 px-2 xl:px-4 text-[13px] font-black uppercase tracking-widest bg-transparent hover:text-brand-primary active:bg-transparent data-[state=open]:text-brand-primary transition-colors',
                                                            pathname === link.href &&
                                                                'text-brand-primary',
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
                                                >
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            'group inline-flex h-max w-max items-center justify-center rounded-sm bg-transparent px-2 xl:px-4 py-2 text-[13px] font-black uppercase tracking-widest transition-colors hover:text-brand-primary focus:outline-none',
                                                            pathname === link.href
                                                                ? 'text-brand-primary'
                                                                : 'text-foreground',
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
                        <div className="flex items-center gap-4 xl:gap-6   pl-4 xl:pl-8  dark:border-white/10">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center ml-2 border border-slate-100 dark:border-white/10 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-sm outline-none">
                                    <Globe size={16} className="mr-2 text-brand-primary" />
                                    <span className="text-[13px] font-black tracking-widest uppercase">
                                        {locale}
                                    </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/10"
                                >
                                    <DropdownMenuItem
                                        onClick={() => router.replace(pathname, { locale: 'vi' })}
                                        className="text-xs font-black tracking-widest cursor-pointer flex items-center justify-between uppercase"
                                    >
                                        {t('vi')}
                                        {locale === 'vi' && (
                                            <Check size={12} className="ml-2 text-brand-primary" />
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.replace(pathname, { locale: 'en' })}
                                        className="text-xs font-black tracking-widest cursor-pointer flex items-center justify-between uppercase"
                                    >
                                        {t('en')}
                                        {locale === 'en' && (
                                            <Check size={12} className="ml-2 text-brand-primary" />
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/10 overflow-y-auto origin-top"
                    >
                        <div className="container mx-auto px-6 py-8 space-y-6">
                            {/* Language Switcher for Mobile */}
                            <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/10">
                                <span className="text-[11px] font-black tracking-widest uppercase text-muted-foreground mr-2">
                                    Language:
                                </span>
                                <button
                                    onClick={() => router.replace(pathname, { locale: 'vi' })}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-sm border transition-all',
                                        locale === 'vi'
                                            ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-muted-foreground',
                                    )}
                                >
                                    {t('vi')}
                                </button>
                                <button
                                    onClick={() => router.replace(pathname, { locale: 'en' })}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-sm border transition-all',
                                        locale === 'en'
                                            ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 text-muted-foreground',
                                    )}
                                >
                                    {t('en')}
                                </button>
                            </div>

              {NAV_LINKS.map((link) => (
                <div key={link.label} className="space-y-4">
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-lg font-black uppercase tracking-tight hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                  {("submenu" in link || "featured" in link) && (
                    <div className="pl-4 grid grid-cols-1 gap-4 border-l-2 border-brand-primary/20">
                      {(link.submenu || link.featured)?.map((item: any) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-8 border-t border-slate-100 dark:border-white/10 space-y-6">
                 <a href={`tel:${COMPANY_INFO.hotlineRaw}`} className="flex items-center gap-6 text-muted-foreground group">
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-sm transition-colors group-hover:bg-brand-primary group-hover:text-white">
                       <Phone size={20} />
                    </div>
                    <span className="font-black text-sm tracking-widest">{COMPANY_INFO.hotline}</span>
                 </a>
                 <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-6 text-muted-foreground group">
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-brand-primary rounded-sm transition-colors group-hover:bg-brand-primary group-hover:text-white">
                       <Mail size={20} />
                    </div>
                    <span className="font-black text-sm tracking-widest uppercase">{COMPANY_INFO.email}</span>
                 </a>
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
