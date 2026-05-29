'use client';
import { AppSidebar } from '@/components/portal/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Search, HelpCircle, Globe, Check } from 'lucide-react';
import { PORTAL_ROUTES } from '@/constants/routes';
import { RouteGuard } from '@/components/portal/route-guard';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);
    const t = useTranslations('Portal.Layout');
    const activeLocale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        initialize();
    }, [initialize]);

    const switchLocale = (nextLocale: 'vi' | 'en') => {
        if (nextLocale === activeLocale) return;
        document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        router.replace(pathname + window.location.search + window.location.hash, {
            locale: nextLocale,
            scroll: false,
        });
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-slate-50/50 overflow-auto">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-3 md:px-8 sticky top-0 z-10 transition-all">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                        <SidebarTrigger className="-ml-1 md:-ml-2 text-slate-500 hover:text-brand-primary transition-all hover:bg-slate-50 rounded-none size-9 md:size-10 shrink-0" />
                        <Separator orientation="vertical" className="h-6 bg-slate-200" />
                        <Breadcrumb className="hidden sm:block">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={PORTAL_ROUTES.dashboard}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
                                    >
                                        {t('system')}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-slate-300" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                                        {t('dashboard')}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6">
                        <div className="hidden md:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                placeholder={t('searchPlaceholder')}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-none text-xs font-bold text-slate-900 w-64 focus:ring-1 focus:ring-brand-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 border-l border-slate-100 pl-2 md:pl-6 ml-1 md:ml-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 gap-2 px-2 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-primary hover:bg-slate-50 rounded-none transition-all hover:cursor-pointer"
                                    >
                                        <Globe size={15} className="text-slate-400" />
                                        <span>{activeLocale}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32 rounded-none border border-slate-100 p-1 bg-white">
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer flex justify-between items-center"
                                        onClick={() => switchLocale('vi')}
                                    >
                                        <span>Tiếng Việt</span>
                                        {activeLocale === 'vi' && <Check size={12} className="text-brand-primary" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-[10px] font-black uppercase tracking-widest rounded-none px-3 py-2 cursor-pointer flex justify-between items-center"
                                        onClick={() => switchLocale('en')}
                                    >
                                        <span>English</span>
                                        {activeLocale === 'en' && <Check size={12} className="text-brand-primary" />}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-none transition-all">
                                <HelpCircle size={18} />
                            </button>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-8 bg-slate-50/50">
                    <RouteGuard>{children}</RouteGuard>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
