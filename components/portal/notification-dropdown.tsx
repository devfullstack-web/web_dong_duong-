'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, MessageSquare, Mail, UserPlus, CheckCheck, ChevronRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import $api from '@/utils/axios';
import Link from 'next/link';
import { API_ROUTES, PORTAL_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'comment' | 'contact' | 'application';
    title: string;
    content: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);


    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await $api.get(API_ROUTES.NOTIFICATIONS);
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.meta.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    const markAsRead = async (id: string) => {
        try {
            await $api.patch(API_ROUTES.NOTIFICATIONS, { id });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await $api.patch(API_ROUTES.NOTIFICATIONS, { all: true });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!isMounted) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-none transition-all relative group h-10 w-10 flex items-center justify-center">
                    <Bell size={18} className="group-hover:animate-ring" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-brand-accent text-brand-primary text-[8px] font-black flex items-center justify-center rounded-none shadow-sm border border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-85 p-0 rounded-none border-slate-200 shadow-2xl overflow-hidden"
                sideOffset={8}
            >
                <DropdownMenuLabel className="p-4 bg-brand-primary flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Thông báo hệ thống
                    </span>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                            className="text-[8px] font-black uppercase tracking-widest text-brand-accent hover:text-white transition-colors flex items-center gap-1"
                        >
                            <CheckCheck size={10} /> Đọc tất cả
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0 bg-white/10" />
                <ScrollArea className="h-[400px] bg-white">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="size-16 bg-slate-50 flex items-center justify-center rounded-none mb-4 border border-slate-100">
                                <Bell size={24} className="text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] italic">
                                Danh sách trống
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100/50">
                            {notifications.map((n) => (
                                <DropdownMenuItem
                                    key={n.id}
                                    className={cn(
                                        'p-4 cursor-pointer focus:bg-slate-50 transition-all flex flex-col items-start gap-1 rounded-none border-l-2',
                                        !n.is_read
                                            ? 'bg-slate-50/50 border-brand-accent'
                                            : 'border-transparent',
                                    )}
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        if (!n.is_read) markAsRead(n.id);
                                        if (n.link) {
                                            window.location.href = n.link;
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <div
                                            className={cn(
                                                'size-8 shrink-0 flex items-center justify-center border transition-colors',
                                                !n.is_read
                                                    ? 'bg-brand-primary border-brand-primary text-white'
                                                    : 'bg-slate-50 border-slate-100 text-slate-400',
                                            )}
                                        >
                                            <NotificationIcon type={n.type} />
                                        </div>
                                        <div className="flex-1 space-y-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        'text-[10px] uppercase tracking-tight line-clamp-1',
                                                        !n.is_read
                                                            ? 'font-black text-slate-900'
                                                            : 'font-bold text-slate-500',
                                                    )}
                                                >
                                                    {n.title}
                                                </p>
                                                {!n.is_read && (
                                                    <span className="size-1.5 bg-brand-accent rounded-none shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
                                                {n.content}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full mt-2 pt-2 border-t border-slate-100/50 flex items-center justify-between">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                            <span className="size-1 bg-slate-200 rounded-none" />
                                            {formatDistanceToNow(new Date(n.created_at), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                        {!n.is_read && (
                                            <button
                                                className="text-[8px] font-black text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-widest"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(n.id);
                                                }}
                                            >
                                                Đánh dấu đọc
                                            </button>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <DropdownMenuSeparator className="m-0 border-slate-100" />
                <div className="p-1 bg-slate-50 border-t border-slate-100">
                    <Link
                        href={PORTAL_ROUTES.notifications || '#'}
                        className="flex items-center justify-center w-full py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-primary transition-colors group"
                        onClick={() => setIsOpen(false)}
                    >
                        Xem tất cả thông báo
                        <ChevronRight className="size-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationIcon({ type }: { type: string }) {
    switch (type) {
        case 'comment':
            return <MessageSquare size={14} />;
        case 'contact':
            return <Mail size={14} />;
        case 'application':
            return <UserPlus size={14} />;
        default:
            return <Bell size={14} />;
    }
}
