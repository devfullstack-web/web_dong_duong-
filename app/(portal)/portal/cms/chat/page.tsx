'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Send,
    User,
    ChevronRight,
    Loader2,
    RefreshCw,
    Trash2,
    Reply,
    X,
    MessageSquare,
    Headphones,
    Clock,
    Users,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/use-socket';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';
import { SimpleConfirmDialog } from '@/components/shared/simple-confirm-dialog';

interface ChatSession {
    id: string;
    guest_id: string;
    guest_name: string;
    last_message_at: string;
    admin_last_seen_at?: string;
    guest_last_seen_at?: string;
    is_active: boolean;
    created_at: string;
}

interface Message {
    id: string;
    session_id: string;
    content: string;
    sender_type: 'guest' | 'admin';
    reply_to_id?: string;
    is_deleted: boolean;
    created_at: string;
}

export default function ChatAdminPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isGuestTyping, setIsGuestTyping] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
    const [isDeletingSession, setIsDeletingSession] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

    // Fetch sessions
    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const res = await $api.get(`${API_ROUTES.CHAT.SESSIONS}/admin`);
            setSessions(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Fetch messages when session selected
    useEffect(() => {
        if (!selectedSession) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await $api.get(
                    `${API_ROUTES.CHAT.MESSAGES}?sessionId=${selectedSession.id}`,
                );
                setMessages(res.data.data || []);
                // Mark as seen when opening
                handleUpdateSeen(selectedSession.id);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
        setIsGuestTyping(false); // Reset typing status for new session
    }, [selectedSession?.id]);

    const handleUpdateSeen = async (sessionId: string) => {
        try {
            await $api.patch(`${API_ROUTES.CHAT.SESSIONS}/${sessionId}`, { adminLastSeen: true });
        } catch (error) {
            console.error('Failed to update seen status:', error);
        }
    };

    const { socket } = useSocket({
        query: {
            isAdmin: 'true',
            sessionId: selectedSession?.id || '',
        },
        transports: ['websocket'],
    });

    // Real-time listener for admins with Socket.io
    useEffect(() => {
        if (!socket) return;

        socket.on('message', (data: any) => {
            // Update session list order/last message
            setSessions((prev) => {
                const index = prev.findIndex((s) => s.id === data.session_id);
                if (index === -1) {
                    // We'll let session_update handler add the new session
                    return prev;
                }
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    last_message_at: data.created_at,
                };
                // Move to top
                const [moved] = updated.splice(index, 1);
                return [moved, ...updated];
            });

            // If it's the current session, add to messages
            if (selectedSession?.id === data.session_id) {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === data.id)) return prev;
                    return [...prev, data];
                });

                // Auto-mark as seen if it's from guest
                if (data.sender_type === 'guest') {
                    handleUpdateSeen(data.session_id);
                }
            }
        });

        socket.on('message_update', (data: any) => {
            if (selectedSession?.id === data.session_id) {
                setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            }
        });

        socket.on('session_update', (data: any) => {
            setSessions((prev) => {
                const exists = prev.find((s) => s.id === data.id);
                if (exists) {
                    return prev.map((s) => (s.id === data.id ? data : s));
                }
                // Add new session to top
                return [data, ...prev];
            });
            if (selectedSession?.id === data.id) {
                setSelectedSession(data);
            }
        });

        socket.on('session_removed', (data: any) => {
            setSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
            if (selectedSession?.id === data.sessionId) {
                setSelectedSession(null);
                setMessages([]);
                toast.info('Cuộc hội thoại đã bị xóa');
            }
        });

        socket.on('typing', (data: any) => {
            if (selectedSession?.id === data.sessionId && data.senderType === 'guest') {
                setIsGuestTyping(data.isTyping);
            }
        });

        return () => {
            socket.off('message');
            socket.off('message_update');
            socket.off('session_update');
            socket.off('session_removed');
            socket.off('typing');
        };
    }, [socket, selectedSession?.id]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !selectedSession || isSending) return;

        const content = inputValue.trim();
        const replyId = replyingTo?.id;

        setInputValue('');
        setReplyingTo(null);
        setIsSending(true);
        sendTypingStatus(false);

        try {
            await $api.post(API_ROUTES.CHAT.MESSAGES, {
                sessionId: selectedSession.id,
                content,
                replyToId: replyId,
            });
        } catch (error) {
            console.error('Failed to send admin message:', error);
        } finally {
            setIsSending(false);
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
            // Optimistically update UI
            setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
            if (selectedSession?.id === sessionToDelete) {
                setSelectedSession(null);
                setMessages([]);
            }
            toast.success('Đã xóa cuộc hội thoại');
            setSessionToDelete(null);
        } catch (error) {
            console.error('Failed to delete session:', error);
            toast.error('Không thể xóa cuộc hội thoại');
        } finally {
            setIsDeletingSession(false);
        }
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessageToDelete(messageId);
    };

    const confirmDeleteMessage = async () => {
        if (!messageToDelete) return;
        try {
            await $api.delete(`${API_ROUTES.CHAT.MESSAGES}/${messageToDelete}`);
            setMessageToDelete(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error('Không thể gỡ tin nhắn');
        }
    };

    const sendTypingStatus = (isTyping: boolean) => {
        if (!selectedSession || !socket) return;
        socket.emit('typing', {
            sessionId: selectedSession.id,
            senderType: 'admin',
            isTyping,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        sendTypingStatus(true);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
        }, 3000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#002d6b] text-white text-[8px] font-black uppercase tracking-widest">
                            Customer Support
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />{' '}
                            Real-time Chat
                        </span>
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 border-l-8 border-[#002d6b] pl-6 leading-none">
                        Hỗ trợ Khách hàng
                    </h1>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Trung tâm hỗ trợ trực tuyến. Quản lý các cuộc hội thoại và phản hồi khách
                        hàng trong thời gian thực.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {sessions.length} cuộc hội thoại
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="flex h-[calc(100vh-16rem)] bg-white border border-slate-200 overflow-hidden shadow-sm">
                {/* Session List */}
                <div className="w-[340px] border-r border-slate-200 flex flex-col bg-slate-50/50">
                    {/* Session List Header */}
                    <div className="p-5 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                                Danh sách hội thoại
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={fetchSessions}
                                disabled={isLoadingSessions}
                                className="h-8 w-8 hover:bg-slate-100"
                            >
                                <RefreshCw
                                    className={cn(
                                        'w-4 h-4 text-slate-400',
                                        isLoadingSessions && 'animate-spin',
                                    )}
                                />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input
                                placeholder="TÌM KIẾM KHÁCH HÀNG..."
                                className="pl-10 h-10 bg-slate-50 border-slate-100 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-300 focus-visible:ring-[#002d6b] focus-visible:ring-offset-0"
                            />
                        </div>
                    </div>

                    {/* Session List Content */}
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-1">
                            {isLoadingSessions && sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#002d6b] mb-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Đang tải...
                                    </span>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        Chưa có hội thoại nào
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
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setSelectedSession(session);
                                            }
                                        }}
                                        className={cn(
                                            'w-full p-4 flex items-center gap-3 hover:bg-white transition-all group text-left cursor-pointer outline-none border border-transparent',
                                            selectedSession?.id === session.id
                                                ? 'bg-white border-slate-200 shadow-sm'
                                                : 'hover:border-slate-100',
                                        )}
                                    >
                                        <div className="w-10 h-10 bg-[#002d6b]/5 border border-[#002d6b]/10 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-[#002d6b]/50" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">
                                                    {session.guest_name || 'Khách'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(
                                                        session.last_message_at,
                                                    ).toLocaleDateString() ===
                                                    new Date().toLocaleDateString()
                                                        ? new Date(
                                                              session.last_message_at,
                                                          ).toLocaleTimeString([], {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })
                                                        : new Date(
                                                              session.last_message_at,
                                                          ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-400 truncate">
                                                ID: {session.guest_id.substring(0, 12)}...
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <ChevronRight
                                                className={cn(
                                                    'w-4 h-4 text-slate-200 transition-all',
                                                    selectedSession?.id === session.id &&
                                                        'text-[#002d6b]',
                                                    'group-hover:text-slate-400',
                                                )}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="w-7 h-7 text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={(e) => handleDeleteSession(e, session.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {selectedSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#002d6b] flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
                                            {selectedSession.guest_name || 'Khách'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                Đang hoạt động
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-50 border border-slate-100">
                                        Session: {selectedSession.id.substring(0, 8)}
                                    </span>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="flex flex-col gap-5">
                                    {isLoadingMessages ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <Loader2 className="w-10 h-10 animate-spin text-[#002d6b] mb-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Đang tải tin nhắn...
                                            </span>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                            <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Chưa có tin nhắn nào
                                            </span>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isAdmin = msg.sender_type === 'admin';
                                            const repliedMessage = messages.find(
                                                (m) => m.id === msg.reply_to_id,
                                            );

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group/msg`}
                                                >
                                                    <div
                                                        className={`flex items-end gap-3 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className={cn(
                                                                'w-9 h-9 flex items-center justify-center shrink-0',
                                                                isAdmin
                                                                    ? 'bg-[#002d6b]'
                                                                    : 'bg-slate-200',
                                                            )}
                                                        >
                                                            <User
                                                                className={cn(
                                                                    'w-4 h-4',
                                                                    isAdmin
                                                                        ? 'text-white'
                                                                        : 'text-slate-500',
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div
                                                                className={cn(
                                                                    'text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2',
                                                                    isAdmin && 'flex-row-reverse',
                                                                )}
                                                            >
                                                                <span>
                                                                    {isAdmin ? 'Admin' : 'Khách'}
                                                                </span>
                                                                {!msg.is_deleted && (
                                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() =>
                                                                                setReplyingTo(msg)
                                                                            }
                                                                            className="hover:text-[#002d6b] transition-colors"
                                                                        >
                                                                            <Reply className="w-3 h-3" />
                                                                        </button>
                                                                        {isAdmin && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleDeleteMessage(
                                                                                        msg.id,
                                                                                    )
                                                                                }
                                                                                className="hover:text-rose-500 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {repliedMessage && !msg.is_deleted && (
                                                                <div
                                                                    className={cn(
                                                                        'text-[10px] bg-white p-2 border-l-2 border-[#fbbf24] mb-1 opacity-80 truncate max-w-[220px]',
                                                                        isAdmin &&
                                                                            'ml-auto text-right',
                                                                    )}
                                                                >
                                                                    {repliedMessage.is_deleted
                                                                        ? 'Tin nhắn đã bị gỡ'
                                                                        : repliedMessage.content}
                                                                </div>
                                                            )}

                                                            <div
                                                                className={cn(
                                                                    'px-4 py-3 text-sm relative',
                                                                    isAdmin
                                                                        ? 'bg-[#002d6b] text-white'
                                                                        : 'bg-white text-slate-700 border border-slate-200',
                                                                    msg.is_deleted &&
                                                                        'italic opacity-50 bg-transparent border-dashed border border-slate-300',
                                                                )}
                                                            >
                                                                {msg.content}
                                                            </div>

                                                            <div
                                                                className={cn(
                                                                    'text-[9px] font-medium text-slate-400 mt-1.5 flex items-center gap-1.5',
                                                                    isAdmin && 'justify-end',
                                                                )}
                                                            >
                                                                {new Date(
                                                                    msg.created_at,
                                                                ).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}

                                                                {isAdmin && (
                                                                    <span
                                                                        className={cn(
                                                                            'flex items-center gap-1',
                                                                            selectedSession.guest_last_seen_at &&
                                                                                new Date(
                                                                                    selectedSession.guest_last_seen_at,
                                                                                ) >=
                                                                                    new Date(
                                                                                        msg.created_at,
                                                                                    )
                                                                                ? 'text-emerald-500'
                                                                                : 'text-slate-400',
                                                                        )}
                                                                    >
                                                                        •{' '}
                                                                        {selectedSession.guest_last_seen_at &&
                                                                        new Date(
                                                                            selectedSession.guest_last_seen_at,
                                                                        ) >=
                                                                            new Date(msg.created_at)
                                                                            ? 'Đã xem'
                                                                            : 'Đã gửi'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {isGuestTyping && (
                                        <div className="flex justify-start">
                                            <div className="flex items-end gap-3">
                                                <div className="w-9 h-9 bg-slate-200 flex items-center justify-center shrink-0">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="bg-white border border-slate-200 px-4 py-3 flex gap-1.5 items-center">
                                                    <span
                                                        className="w-2 h-2 bg-[#002d6b] rounded-full animate-bounce"
                                                        style={{ animationDelay: '0s' }}
                                                    ></span>
                                                    <span
                                                        className="w-2 h-2 bg-[#002d6b] rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.15s' }}
                                                    ></span>
                                                    <span
                                                        className="w-2 h-2 bg-[#002d6b] rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.3s' }}
                                                    ></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="p-5 border-t border-slate-200 bg-white">
                                <AnimatePresence>
                                    {replyingTo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="mb-4 p-4 bg-slate-50 flex items-center justify-between border-l-4 border-[#fbbf24]"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-[9px] text-[#002d6b] font-black uppercase tracking-widest">
                                                    Đang trả lời{' '}
                                                    {replyingTo.sender_type === 'guest'
                                                        ? 'Khách'
                                                        : 'Admin'}
                                                </p>
                                                <p className="text-sm text-slate-500 truncate mt-0.5">
                                                    {replyingTo.content}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 hover:bg-slate-200"
                                                onClick={() => setReplyingTo(null)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    className="flex gap-3"
                                >
                                    <Input
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        placeholder="Nhập câu trả lời cho khách hàng..."
                                        className="flex-1 h-12 bg-slate-50 border-slate-200 focus-visible:ring-[#002d6b] focus-visible:ring-offset-0 text-sm placeholder:text-slate-400"
                                    />
                                    <Button
                                        type="submit"
                                        className="h-12 px-8 bg-[#002d6b] hover:bg-[#002d6b]/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#002d6b]/20"
                                        disabled={!inputValue.trim() || isSending}
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Gửi
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-24 h-24 bg-[#002d6b]/5 border border-[#002d6b]/10 flex items-center justify-center mb-6">
                                <Headphones className="w-12 h-12 text-[#002d6b]/30" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-700 mb-2">
                                Trung tâm Hỗ trợ
                            </h3>
                            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                                Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ
                                khách hàng của bạn.
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
