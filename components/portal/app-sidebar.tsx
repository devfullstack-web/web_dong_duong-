'use client';

import * as React from 'react';
import { icons, ChevronRight, User, LogOut, GripVertical, FileText } from 'lucide-react';
import Image from 'next/image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
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
import { usePathname, useRouter } from 'next/navigation';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { useAuth, SidebarModule } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';

import { cn } from '@/lib/utils';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import Link from 'next/link';

const DynamicIcon = React.memo(
    ({ name, className }: { name: string | null; className?: string }) => {
        if (!name) return <FileText className={className} />;

        const IconComponent = icons[name as keyof typeof icons];

        if (!IconComponent) {
            return <FileText className={className} />;
        }

        return <IconComponent className={className} />;
    },
);
DynamicIcon.displayName = 'DynamicIcon';

interface SortableMenuItemProps {
    module: SidebarModule;
    isActive: boolean;
}

function SortableMenuItem({ module, isActive }: SortableMenuItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: module.code,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="group/menu-item relative w-full flex justify-center list-none"
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
        >
            <SidebarMenuButton
                asChild
                tooltip={module.name}
                className={cn(
                    'text-[10px] font-black px-4 transition-none! uppercase tracking-widest rounded-none h-auto group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center relative',
                    isActive
                        ? 'bg-white text-brand hover:bg-white hover:text-brand'
                        : 'text-white/70 hover:bg-white/5 hover:text-white',
                )}
            >
                <div className="flex items-center gap-2 w-full">
                    {/* Drag Handle - only visible on hover and not in icon mode */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex items-center justify-center shrink-0 opacity-0 group-hover/menu-item:opacity-40 transition-opacity cursor-grab active:cursor-grabbing group-data-[collapsible=icon]:hidden"
                    >
                        <GripVertical className="size-3" />
                    </div>

                    <Link
                        href={module.route as string}
                        className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                    >
                        <div className="flex items-center justify-center shrink-0 size-5">
                            <DynamicIcon
                                name={module.icon}
                                className={cn('size-4', isActive ? 'text-brand' : 'text-[#fbbf24]')}
                            />
                        </div>
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                            {module.name}
                        </span>
                    </Link>
                </div>
            </SidebarMenuButton>
        </li>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isMounted, setIsMounted] = React.useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await $api.post(API_ROUTES.AUTH.LOGOUT);
            useAuthStore.getState().logout(); // Reset auth store state
            toast.success('Đã đăng xuất');
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
            toast.error('Lỗi khi đăng xuất');
        }
    };

    const navItems = React.useMemo(() => {
        if (!user?.modules) return [];

        return user.modules
            .filter((module: SidebarModule) => !!module.route)
            .map((module: SidebarModule) => ({
                title: module.name,
                url: module.route as string,
                iconName: module.icon,
                code: module.code,
            }));
    }, [user?.modules]);

    const filteredModules = React.useMemo(() => {
        return (user?.modules || []).filter((module: SidebarModule) => !!module.route);
    }, [user?.modules]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const modules = user?.modules || [];
            const oldIndex = modules.findIndex((m) => m.code === active.id);
            const newIndex = modules.findIndex((m) => m.code === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(modules, oldIndex, newIndex);
                useAuthStore.getState().setModulesOrder(newOrder);
                useAuthStore.getState().syncModulesOrder();
            }
        }
    };

    const isPathActive = (url: string) => {
        if (!url) return false;
        if (pathname === url) return true;

        if (pathname.startsWith(url + '/')) {
            const hasBetterMatch = navItems.some(
                (item) =>
                    item.url !== url &&
                    item.url.length > url.length &&
                    (pathname === item.url || pathname.startsWith(item.url + '/')),
            );
            return !hasBetterMatch;
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
                } as React.CSSProperties
            }
        >
            <SidebarHeader className="border-b border-white/5 flex items-center justify-start px-4 bg-brand shrink-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                <Link
                    href={PORTAL_ROUTES.dashboard}
                    className="flex items-center gap-3 group/logo relative w-full h-full justify-center px-4"
                >
                    <div className="relative flex items-center gap-3 group-data-[collapsible=icon]:hidden w-full px-1">
                        <div className="bg-white p-1 rounded-none flex items-center justify-center h-8 w-8 shrink-0">
                            <Image
                                src="/images/logo/logo.png"
                                alt="Logo"
                                width={22}
                                height={22}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-[11px] font-black tracking-tighter leading-none text-white whitespace-nowrap uppercase">
                            SÀI GÒN VALVE
                        </span>
                    </div>
                    <div className="hidden group-data-[collapsible=icon]:flex h-8 w-8 items-center justify-center rounded-none bg-white p-1 shrink-0">
                        <Image
                            src="/images/logo/logo.png"
                            alt="Logo"
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="scrollbar-hide bg-brand py-2 overflow-x-hidden">
                <SidebarGroup className="p-0">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredModules.map((m) => m.code)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul
                                className="flex w-full min-w-0 flex-col gap-1 group-data-[collapsible=icon]:items-center list-none p-0"
                                data-slot="sidebar-menu"
                                data-sidebar="menu"
                            >
                                {filteredModules.map((module: SidebarModule) => (
                                    <SortableMenuItem
                                        key={module.code}
                                        module={module}
                                        isActive={isPathActive(module.route as string)}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
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
                                    {user.avatarUrl ? (
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.fullName || user.username}
                                            width={32}
                                            height={32}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        (user.fullName || user.username || '?')
                                            .substring(0, 2)
                                            .toUpperCase()
                                    )}
                                </div>
                                <div className="flex flex-col items-start leading-none group-data-[collapsible=icon]:hidden overflow-hidden ms-1">
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate w-full">
                                        {user.fullName}
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
                                    Tài khoản
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
                                        Hồ sơ
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
                                    Đăng xuất
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
