'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search,
    Send,
    User,
    Loader2,
    RefreshCw,
    Trash2,
    Reply,
    X,
    MessageSquare,
    Headphones,
    Clock,
    ArrowLeft,
    CheckCheck,
    Check,
    MoreVertical,
    Mail,
    Phone,
    CircleDot,
    Archive,
    Ban,
    Bot,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/use-socket';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { SimpleConfirmDialog } from '@/components/shared/simple-confirm-dialog';
import type { ChatSession, ChatMessage, ChatSessionStatus } from '@/types';

type FilterTab = 'all' | ChatSessionStatus;

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function statusLabel(status: ChatSessionStatus): string {
    const map: Record<ChatSessionStatus, string> = {
        active: 'Đang mở',
        resolved: 'Đã xử lý',
        spam: 'Spam',
    };
    return map[status] || status;
}

function statusColor(status: ChatSessionStatus): string {
    const map: Record<ChatSessionStatus, string> = {
        active: 'bg-emerald-500',
        resolved: 'bg-slate-400',
        spam: 'bg-rose-400',
    };
    return map[status] || 'bg-slate-400';
}

export default function ChatAdminPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [isDeletingSession, setIsDeletingSession] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

    // ─── Fetch sessions ─────────────────────────────────
    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const params = new URLSearchParams();
            if (filterTab !== 'all') params.set('status', filterTab);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());

            const res = await $api.get(`${API_ROUTES.CHAT.SESSIONS}/admin?${params}`);
            setSessions(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [filterTab]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => fetchSessions(), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // ─── Fetch messages ─────────────────────────────────
    useEffect(() => {
        if (!selectedSession) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await $api.get(
                    `${API_ROUTES.CHAT.MESSAGES}?sessionId=${selectedSession.id}`,
                );
                setMessages(res.data.data || []);
                handleMarkSeen(selectedSession.id);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedSession?.id]);

    const handleMarkSeen = async (sessionId: string) => {
        try {
            const res = await $api.patch(`${API_ROUTES.CHAT.SESSIONS}/${sessionId}`, {
                adminLastSeen: true,
            });
            // Update local session state
            const updated = res.data.data;
            if (updated) {
                setSessions((prev) =>
                    prev.map((s) =>
                        s.id === sessionId ? { ...s, unread_count: 0, admin_last_seen_at: updated.admin_last_seen_at } : s,
                    ),
                );
                if (selectedSession?.id === sessionId) {
                    setSelectedSession((prev) =>
                        prev ? { ...prev, unread_count: 0, admin_last_seen_at: updated.admin_last_seen_at } : prev,
                    );
                }
            }
        } catch (error) {
            // silent
        }
    };

    // ─── Socket ─────────────────────────────────────────
    const { socket } = useSocket({
        query: {
            isAdmin: 'true',
        },
        transports: ['websocket'],
    });

    useEffect(() => {
        if (!socket) return;

        const onMessage = (data: ChatMessage) => {
            // Update session list
            setSessions((prev) => {
                const index = prev.findIndex((s) => s.id === data.session_id);
                if (index === -1) return prev;
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    last_message_at: data.created_at,
                    last_message_preview: data.content.length > 100 ? data.content.slice(0, 100) + '...' : data.content,
                    unread_count:
                        data.sender_type === 'guest' && selectedSession?.id !== data.session_id
                            ? updated[index].unread_count + 1
                            : updated[index].unread_count,
                };
                const [moved] = updated.splice(index, 1);
                return [moved, ...updated];
            });

            // If current session, add message
            if (selectedSession?.id === data.session_id) {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === data.id)) return prev;
                    return [...prev, data];
                });

                if (data.sender_type === 'guest') {
                    handleMarkSeen(data.session_id);
                }
            }
        };

        const onMessageUpdate = (data: ChatMessage) => {
            if (selectedSession?.id === data.session_id) {
                setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            }
        };

        const onSessionUpdate = (data: ChatSession) => {
            setSessions((prev) => {
                const exists = prev.find((s) => s.id === data.id);
                if (exists) {
                    return prev.map((s) => (s.id === data.id ? { ...s, ...data } : s));
                }
                return [data, ...prev];
            });
            if (selectedSession?.id === data.id) {
                setSelectedSession((prev) => (prev ? { ...prev, ...data } : prev));
            }
        };

        const onSessionRemoved = (data: { sessionId: string }) => {
            setSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
            if (selectedSession?.id === data.sessionId) {
                setSelectedSession(null);
                setMessages([]);
                toast.info('Cuộc hội thoại đã bị xóa');
            }
        };

        socket.on('message', onMessage);
        socket.on('message_update', onMessageUpdate);
        socket.on('session_update', onSessionUpdate);
        socket.on('session_removed', onSessionRemoved);

        return () => {
            socket.off('message', onMessage);
            socket.off('message_update', onMessageUpdate);
            socket.off('session_update', onSessionUpdate);
            socket.off('session_removed', onSessionRemoved);
        };
    }, [socket, selectedSession?.id]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // ─── Actions ────────────────────────────────────────
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !selectedSession || isSending) return;

        const content = inputValue.trim();
        const replyId = replyingTo?.id;

        setInputValue('');
        setReplyingTo(null);
        setIsSending(true);

        try {
            await $api.post(API_ROUTES.CHAT.MESSAGES, {
                sessionId: selectedSession.id,
                content,
                replyToId: replyId,
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Không thể gửi tin nhắn');
        } finally {
            setIsSending(false);
        }
    };

    const handleUpdateStatus = async (sessionId: string, status: ChatSessionStatus) => {
        try {
            await $api.patch(`${API_ROUTES.CHAT.SESSIONS}/${sessionId}`, { status });
            toast.success(`Đã chuyển trạng thái: ${statusLabel(status)}`);
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setSessionToDelete(sessionId);
    };

    const confirmDeleteSession = async () => {
        if (!sessionToDelete) return;
        setIsDeletingSession(true);
        try {
            await $api.delete(`${API_ROUTES.CHAT.SESSIONS}/${sessionToDelete}`);
            setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
            if (selectedSession?.id === sessionToDelete) {
                setSelectedSession(null);
                setMessages([]);
            }
            toast.success('Đã xóa cuộc hội thoại');
            setSessionToDelete(null);
        } catch (error) {
            toast.error('Không thể xóa cuộc hội thoại');
        } finally {
            setIsDeletingSession(false);
        }
    };

    const handleDeleteMessage = (messageId: string) => setMessageToDelete(messageId);

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;
        try {
            await $api.delete(`${API_ROUTES.CHAT.MESSAGES}/${messageToDelete}`);
            setMessageToDelete(null);
        } catch (error) {
            toast.error('Không thể gỡ tin nhắn');
        }
    };

    // ─── Derived ────────────────────────────────────────
    const totalUnread = useMemo(() => sessions.reduce((sum, s) => sum + s.unread_count, 0), [sessions]);

    const tabCounts = useMemo(() => {
        const counts: Record<FilterTab, number> = { all: sessions.length, active: 0, resolved: 0, spam: 0 };
        // We need all sessions for tab counts, but filter is already applied server-side
        // So counts only reflect current filter results
        return counts;
    }, [sessions]);

    // ─── Render ─────────────────────────────────────────
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        Hỗ trợ khách hàng
                    </h1>
                    <p className="text-sm text-slate-500">
                        Quản lý các cuộc hội thoại và phản hồi khách hàng.
                        {totalUnread > 0 && (
                            <span className="ml-2 text-[#002d6b] font-semibold">
                                {totalUnread} tin nhắn chưa đọc
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="flex h-[calc(100vh-12rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                {/* ─── Session List ─────────────────────── */}
                <div
                    className={cn(
                        'border-r border-slate-200 dark:border-slate-800 flex-col w-full md:w-90 md:flex',
                        selectedSession ? 'hidden' : 'flex',
                    )}
                >
                    {/* Search + Filter */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm kiếm khách hàng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={fetchSessions}
                                disabled={isLoadingSessions}
                                className="h-9 w-9 shrink-0"
                            >
                                <RefreshCw className={cn('w-4 h-4', isLoadingSessions && 'animate-spin')} />
                            </Button>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-1">
                            {(['all', 'active', 'resolved', 'spam'] as FilterTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterTab(tab)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                        filterTab === tab
                                            ? 'bg-[#002d6b] text-white'
                                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                                    )}
                                >
                                    {tab === 'all' ? 'Tất cả' : statusLabel(tab)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Session List Content */}
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoadingSessions && sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-400">Đang tải...</span>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                                    <span className="text-sm font-medium">Chưa có hội thoại</span>
                                    <span className="text-xs mt-1">
                                        {filterTab !== 'all'
                                            ? 'Không có hội thoại nào với trạng thái này'
                                            : 'Các cuộc hội thoại sẽ hiện ở đây khi khách hàng nhắn tin'}
                                    </span>
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ')
                                                setSelectedSession(session);
                                        }}
                                        className={cn(
                                            'w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer outline-none',
                                            selectedSession?.id === session.id &&
                                                'bg-blue-50 dark:bg-slate-800 border-l-2 border-[#002d6b]',
                                            session.unread_count > 0 && 'bg-blue-50/50 dark:bg-slate-800/30',
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div
                                                className={cn(
                                                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                                                    statusColor(session.status),
                                                )}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span
                                                    className={cn(
                                                        'text-sm truncate',
                                                        session.unread_count > 0
                                                            ? 'font-bold text-slate-900 dark:text-white'
                                                            : 'font-medium text-slate-700 dark:text-slate-300',
                                                    )}
                                                >
                                                    {session.guest_name || 'Khách hàng'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                                    {formatTime(session.last_message_at)}
                                                </span>
                                            </div>

                                            {/* Contact info */}
                                            {(session.guest_phone || session.guest_email) && (
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {session.guest_phone && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                                            <Phone className="w-2.5 h-2.5" />
                                                            {session.guest_phone}
                                                        </span>
                                                    )}
                                                    {session.guest_email && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                                                            <Mail className="w-2.5 h-2.5" />
                                                            {session.guest_email}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Last message preview */}
                                            <p
                                                className={cn(
                                                    'text-xs mt-1 truncate',
                                                    session.unread_count > 0
                                                        ? 'text-slate-700 dark:text-slate-300 font-medium'
                                                        : 'text-slate-400',
                                                )}
                                            >
                                                {session.last_message_preview || 'Chưa có tin nhắn'}
                                            </p>
                                        </div>

                                        {/* Unread badge */}
                                        {session.unread_count > 0 && (
                                            <Badge className="bg-[#002d6b] text-white text-[10px] h-5 min-w-5 flex items-center justify-center shrink-0 rounded-full">
                                                {session.unread_count > 99 ? '99+' : session.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* ─── Chat Window ──────────────────────── */}
                <div
                    className={cn(
                        'flex-1 flex-col bg-slate-50/50 dark:bg-slate-950/30',
                        selectedSession ? 'flex' : 'hidden md:flex',
                    )}
                >
                    {selectedSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden h-8 w-8 shrink-0"
                                        onClick={() => setSelectedSession(null)}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 bg-[#002d6b] rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div
                                            className={cn(
                                                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900',
                                                statusColor(selectedSession.status),
                                            )}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                            {selectedSession.guest_name || 'Khách hàng'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-[10px] h-5 px-1.5 border-0',
                                                    selectedSession.status === 'active' && 'bg-emerald-50 text-emerald-600',
                                                    selectedSession.status === 'resolved' && 'bg-slate-100 text-slate-500',
                                                    selectedSession.status === 'spam' && 'bg-rose-50 text-rose-500',
                                                )}
                                            >
                                                {statusLabel(selectedSession.status)}
                                            </Badge>
                                            {selectedSession.guest_phone && (
                                                <span className="hidden sm:flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {selectedSession.guest_phone}
                                                </span>
                                            )}
                                            {selectedSession.guest_email && (
                                                <span className="hidden md:flex items-center gap-1 truncate">
                                                    <Mail className="w-3 h-3" /> {selectedSession.guest_email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => handleUpdateStatus(selectedSession.id, 'active')}
                                            disabled={selectedSession.status === 'active'}
                                        >
                                            <CircleDot className="w-4 h-4 mr-2 text-emerald-500" />
                                            Đánh dấu đang mở
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleUpdateStatus(selectedSession.id, 'resolved')}
                                            disabled={selectedSession.status === 'resolved'}
                                        >
                                            <Archive className="w-4 h-4 mr-2 text-slate-500" />
                                            Đánh dấu đã xử lý
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleUpdateStatus(selectedSession.id, 'spam')}
                                            disabled={selectedSession.status === 'spam'}
                                        >
                                            <Ban className="w-4 h-4 mr-2 text-rose-500" />
                                            Đánh dấu spam
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-rose-600"
                                            onClick={(e) => handleDeleteSession(e as any, selectedSession.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Xóa hội thoại
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4">
                                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                                    {isLoadingMessages ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-2" />
                                            <span className="text-xs text-slate-400">Đang tải tin nhắn...</span>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                                            <span className="text-sm">Chưa có tin nhắn</span>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isAdmin = msg.sender_type === 'admin';
                                            const isSystem = msg.sender_type === 'system';
                                            const repliedMessage = messages.find(
                                                (m) => m.id === msg.reply_to_id,
                                            );

                                            if (isSystem) {
                                                return (
                                                    <div key={msg.id} className="flex justify-start my-2">
                                                        <div className="flex items-start gap-2 max-w-md">
                                                            <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-5">
                                                                <Bot className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5 px-1">Tin nhắn tự động (Bot)</span>
                                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl rounded-bl-md px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 whitespace-pre-line leading-relaxed">
                                                                    {msg.content}
                                                                </div>
                                                                <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                                                                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={cn(
                                                        'flex group/msg',
                                                        isAdmin ? 'justify-end' : 'justify-start',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex items-end gap-2 max-w-[80%]',
                                                            isAdmin && 'flex-row-reverse',
                                                        )}
                                                    >
                                                        {!isAdmin && (
                                                            <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 mb-5">
                                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            {repliedMessage && !msg.is_deleted && (
                                                                <div
                                                                    className={cn(
                                                                        'text-[10px] bg-white dark:bg-slate-800 p-1.5 border-l-2 border-amber-400 mb-1 opacity-80 truncate max-w-55 rounded',
                                                                        isAdmin && 'ml-auto',
                                                                    )}
                                                                >
                                                                    {repliedMessage.is_deleted
                                                                        ? 'Tin nhắn đã bị gỡ'
                                                                        : repliedMessage.content}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                {isAdmin && !msg.is_deleted && (
                                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <button
                                                                                        onClick={() => setReplyingTo(msg)}
                                                                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                                                                                    >
                                                                                        <Reply className="w-3 h-3" />
                                                                                    </button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Trả lời</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <button
                                                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                                                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500"
                                                                                    >
                                                                                        <Trash2 className="w-3 h-3" />
                                                                                    </button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Gỡ tin nhắn</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={cn(
                                                                        'px-3.5 py-2 text-sm rounded-2xl',
                                                                        isAdmin
                                                                            ? 'bg-[#002d6b] text-white rounded-br-md'
                                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md',
                                                                        msg.is_deleted &&
                                                                            'italic opacity-50 bg-transparent border-dashed border border-slate-300 dark:border-slate-600 text-slate-400',
                                                                    )}
                                                                >
                                                                    {msg.content}
                                                                </div>
                                                                {!isAdmin && !msg.is_deleted && (
                                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <button
                                                                                        onClick={() => setReplyingTo(msg)}
                                                                                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                                                                                    >
                                                                                        <Reply className="w-3 h-3" />
                                                                                    </button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Trả lời</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div
                                                                className={cn(
                                                                    'text-[10px] text-slate-400 mt-1 flex items-center gap-1',
                                                                    isAdmin && 'justify-end',
                                                                )}
                                                            >
                                                                {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                                {isAdmin && (
                                                                    <>
                                                                        {selectedSession.guest_last_seen_at &&
                                                                        new Date(selectedSession.guest_last_seen_at) >=
                                                                            new Date(msg.created_at) ? (
                                                                            <CheckCheck className="w-3 h-3 text-blue-500" />
                                                                        ) : (
                                                                            <Check className="w-3 h-3 text-slate-400" />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="max-w-3xl mx-auto">
                                    <AnimatePresence>
                                        {replyingTo && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="mb-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between border-l-3 border-amber-400"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-[#002d6b] dark:text-blue-400 font-semibold">
                                                        Đang trả lời{' '}
                                                        {replyingTo.sender_type === 'guest' ? 'Khách' : 'Admin'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">{replyingTo.content}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => setReplyingTo(null)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Nhập tin nhắn..."
                                            className="flex-1 h-10 text-sm rounded-lg"
                                            autoFocus
                                        />
                                        <Button
                                            type="submit"
                                            className="h-10 px-4 bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-lg"
                                            disabled={!inputValue.trim() || isSending}
                                        >
                                            {isSending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 md:mr-1.5" />
                                                    <span className="hidden md:inline text-sm">Gửi</span>
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Headphones className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Chọn cuộc hội thoại
                            </h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ khách hàng.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                open={!!sessionToDelete}
                onOpenChange={(open) => !open && setSessionToDelete(null)}
                onConfirm={confirmDeleteSession}
                title="Xóa hội thoại"
                description="Hành động này sẽ xóa toàn bộ lịch sử tin nhắn của khách hàng này. Bạn không thể hoàn tác."
                itemLabel="Cuộc hội thoại"
                itemName={sessions.find((s) => s.id === sessionToDelete)?.guest_name || 'Khách'}
                loading={isDeletingSession}
            />

            <SimpleConfirmDialog
                open={!!messageToDelete}
                onOpenChange={(open) => !open && setMessageToDelete(null)}
                onConfirm={confirmDeleteMessage}
                title="Gỡ tin nhắn?"
                description="Tin nhắn này sẽ được gỡ bỏ đối với cả bạn và khách hàng."
                confirmText="Gỡ tin nhắn"
                variant="destructive"
            />
        </div>
    );
}
