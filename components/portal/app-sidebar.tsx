'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { icons, ChevronRight, User, LogOut, FileText } from 'lucide-react';
import Image from 'next/image';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenuButton,
    SidebarRail,
    SidebarFooter,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuthStore } from '@/stores/auth-store';

import { cn } from '@/lib/utils';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

const DynamicIcon = memo(function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconComponent = icons[name as keyof typeof icons];
    if (!IconComponent) return <FileText className={className} />;
    return <IconComponent className={className} />;
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('Portal.Sidebar');
    const { user, can } = usePermissions();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await $api.post(API_ROUTES.AUTH.LOGOUT);
            useAuthStore.getState().logout();
            toast.success(t('logoutSuccess'));
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
            toast.error(t('logoutError'));
        }
    };

    // Filter sidebar items theo permission — static config, không cần API
    const visibleItems = useMemo(() => {
        if (!user) return [];
        return SIDEBAR_ITEMS.filter((item) => {
            if (!item.permission) return true;
            return can(item.permission);
        });
    }, [user, can]);

    const isPathActive = (url: string) => {
        if (!url) return false;
        if (pathname === url) return true;
        if (pathname.startsWith(url + '/')) {
            return !visibleItems.some(
                (item) =>
                    item.route !== url &&
                    item.route.length > url.length &&
                    (pathname === item.route || pathname.startsWith(item.route + '/')),
            );
        }
        return false;
    };

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            className="border-none bg-brand"
            style={
                {
                    '--sidebar-background': '#004395',
                    '--sidebar-foreground': 'white',
                    '--sidebar-primary': 'white',
                    '--sidebar-primary-foreground': '#004395',
                    '--sidebar-accent': 'rgba(255, 255, 255, 0.08)',
                    '--sidebar-accent-foreground': 'white',
                    '--sidebar-border': 'rgba(255, 255, 255, 0.05)',
                    '--sidebar-ring': '#fbbf24',
                } as import('react').CSSProperties
            }
        >
            <SidebarHeader className="border-b border-white/5 flex items-center justify-start px-4 bg-brand shrink-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                <Link
                    href={PORTAL_ROUTES.dashboard}
                    className="flex items-center gap-3 group/logo relative w-full h-full justify-center "
                >
                    <div className="relative flex items-center gap-3 group-data-[collapsible=icon]:hidden w-full px-1">
                        <div className="bg-white p-1 rounded-none flex items-center justify-center h-8 w-8 shrink-0">
                            <Image
                                src="/images/logo/logo.png"
                                alt="Logo"
                                width={22}
                                height={22}
                                unoptimized
                                className="object-contain"
                                style={{ width: 'auto', height: 'auto' }}
                            />
                        </div>
                        <span className="text-[11px] font-black tracking-tighter leading-none text-white whitespace-nowrap uppercase">
                            {t('companyName')}
                        </span>
                    </div>
                    <div className="hidden group-data-[collapsible=icon]:flex h-8 w-8 items-center justify-center rounded-none bg-white p-1 shrink-0">
                        <Image
                            src="/images/logo/logo.png"
                            alt="Logo"
                            width={20}
                            height={20}
                            unoptimized
                            className="object-contain"
                            style={{ width: 'auto', height: 'auto' }}
                        />
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="scrollbar-hide bg-brand py-2 overflow-x-hidden">
                <SidebarGroup className="p-0">
                    <ul
                        className="flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:items-center list-none p-0"
                        data-slot="sidebar-menu"
                        data-sidebar="menu"
                    >
                        {visibleItems.map((item) => {
                            const active = isPathActive(item.route);
                            return (
                                <li
                                    key={item.code}
                                    className="relative w-full flex justify-center list-none"
                                    data-slot="sidebar-menu-item"
                                    data-sidebar="menu-item"
                                >
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={t(item.code.toLowerCase() as never)}
                                        className={cn(
                                            'text-[10px] font-black px-4 transition-none! uppercase tracking-widest rounded-none h-auto group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center relative',
                                            active
                                                ? 'bg-white text-brand hover:bg-white hover:text-brand'
                                                : 'text-white/70 hover:bg-white/5 hover:text-white',
                                        )}
                                    >
                                        <Link
                                            href={item.route}
                                            className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                                        >
                                            <div className="flex items-center justify-center shrink-0 size-5">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className={cn(
                                                        'size-4',
                                                        active ? 'text-brand' : 'text-[#fbbf24]',
                                                    )}
                                                />
                                            </div>
                                            <span className="truncate group-data-[collapsible=icon]:hidden">
                                                {t(item.code.toLowerCase() as never)}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </li>
                            );
                        })}
                    </ul>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-0 bg-brand gap-0 border-t border-white/5 shrink-0 flex flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:py-2">
                {!isMounted || !user ? (
                    <div className="w-full h-14 flex items-center gap-3 px-4 bg-black/20 text-white group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-white/20 animate-pulse shrink-0" />
                        <div className="flex flex-col items-start leading-none group-data-[collapsible=icon]:hidden overflow-hidden ms-1 gap-1.5">
                            <div className="h-2.5 w-20 bg-white/20 rounded animate-pulse" />
                            <div className="h-2 w-28 bg-white/10 rounded animate-pulse" />
                        </div>
                    </div>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="w-full h-14 items-center gap-3 px-4 bg-black/20 hover:bg-black/30 text-white rounded-none group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center cursor-pointer"
                            >
                                <div className="flex h-8 w-8  items-center justify-center rounded-none  bg-[#fbbf24] text-[10px] font-black text-brand shrink-0 overflow-hidden">
                                    {user.avatar_url ? (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.full_name || user.username}
                                            width={32}
                                            height={32}
                                            unoptimized
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        (user.full_name || user.username || '?')
                                            .substring(0, 2)
                                            .toUpperCase()
                                    )}
                                </div>
                                <div className="flex flex-col items-start leading-none group-data-[collapsible=icon]:hidden overflow-hidden ms-1">
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate w-full">
                                        {user.full_name}
                                    </span>
                                    <span className="text-[8px] font-medium text-white/30 lowercase mt-0.5 truncate w-full">
                                        {user.username}@saigonvalve.vn
                                    </span>
                                </div>
                                <ChevronRight className="ml-auto size-3 text-white/20 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            align="center"
                            sideOffset={4}
                            className="w-60 p-0 rounded-none border border-white/10 bg-brand-secondary text-white shadow-2xl"
                        >
                            <DropdownMenuLabel className="px-5 py-3 bg-black/40 ">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                                    {t('account')}
                                </p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 m-0" />
                            <DropdownMenuItem
                                asChild
                                className="px-5 py-3 focus:bg-white/10 focus:text-white cursor-pointer rounded-none group border-none outline-none"
                            >
                                <Link
                                    href={PORTAL_ROUTES.settings}
                                    className="flex items-center w-full"
                                >
                                    <User className="size-4 text-[#fbbf24] mr-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {t('profile')}
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 m-0" />
                            <DropdownMenuItem
                                onSelect={handleLogout}
                                className="px-5 py-3 focus:bg-rose-500/10 focus:text-rose-500 text-rose-500 cursor-pointer rounded-none group border-none outline-none"
                            >
                                <LogOut className="size-4 mr-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {t('logout')}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
