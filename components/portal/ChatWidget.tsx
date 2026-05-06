'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Loader2, Headphones, Reply, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { $publicApi } from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, ChatSession } from '@/types';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [guestId, setGuestId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState<ChatSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [hasUnread, setHasUnread] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isOpenRef = useRef(isOpen);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                chatContainerRef.current &&
                !chatContainerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Initialize Guest ID
    useEffect(() => {
        let id = localStorage.getItem('chat_guest_id');
        if (!id) {
            id = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
            localStorage.setItem('chat_guest_id', id);
        }
        setGuestId(id);
    }, []);

    // Fetch or create session when widget opens
    useEffect(() => {
        if (!guestId || !isOpen) return;

        const initSession = async () => {
            try {
                const res = await $publicApi.post(API_ROUTES.CHAT.SESSIONS, { guestId });
                const session = res.data.data;
                setSessionId(session.id);
                setSessionData(session);

                const msgRes = await $publicApi.get(
                    `${API_ROUTES.CHAT.MESSAGES}?sessionId=${session.id}`,
                );
                setMessages(msgRes.data.data || []);
                handleUpdateSeen(session.id);
                setHasUnread(false);
            } catch (error) {
                console.error('Failed to init chat session:', error);
            }
        };

        if (!sessionId) {
            initSession();
        } else {
            handleUpdateSeen(sessionId);
            setHasUnread(false);
        }
    }, [guestId, isOpen, sessionId]);

    const handleUpdateSeen = async (id: string) => {
        try {
            await $publicApi.patch(`${API_ROUTES.CHAT.SESSIONS}/${id}`, { guestLastSeen: true });
        } catch {
            // silent
        }
    };

    // Socket connection
    useEffect(() => {
        if (!sessionId) return;

        const socket = io({
            query: { sessionId },
            transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('message', (data: ChatMessage) => {
            if (data.id && data.session_id === sessionId) {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                if (data.sender_type === 'admin' || data.sender_type === 'system') {
                    if (isOpenRef.current) {
                        handleUpdateSeen(sessionId);
                    } else {
                        setHasUnread(true);
                    }
                }
            }
        });

        socket.on('message_update', (data: ChatMessage) => {
            if (data.session_id === sessionId) {
                setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            }
        });

        socket.on('session_update', (data: ChatSession) => {
            if (data.id === sessionId) {
                setSessionData(data);
            }
        });

        socket.on('session_removed', (data: { sessionId: string }) => {
            if (data.sessionId === sessionId) {
                setSessionId(null);
                setSessionData(null);
                setMessages([]);
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [sessionId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        const content = inputValue.trim();
        if (!content || !sessionId) return;

        const replyId = replyingTo?.id;
        setInputValue('');
        setReplyingTo(null);
        setIsLoading(true);

        try {
            const res = await $publicApi.post(API_ROUTES.CHAT.MESSAGES, {
                sessionId,
                content,
                isFromWidget: true,
                replyToId: replyId,
            });

            const newMessage = res.data.data;
            if (newMessage?.id) {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={chatContainerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="mb-4 w-85 md:w-95 bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden flex flex-col h-130 border border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="bg-linear-to-r from-[#002d6b] to-[#003d8f] px-5 py-4 text-white relative">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                        <Headphones className="w-5 h-5 text-amber-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">Hỗ trợ trực tuyến</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            <p className="text-[10px] text-white/70">
                                                Đang hoạt động
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50 dark:bg-slate-950/50">
                            <div className="flex flex-col gap-3">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-14 h-14 bg-[#002d6b]/5 rounded-full flex items-center justify-center mb-3">
                                            <MessageCircle className="w-7 h-7 text-[#002d6b]/30" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            Xin chào!
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-50">
                                            Bạn cần chúng tôi hỗ trợ điều gì?
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isGuest = msg.sender_type === 'guest';
                                    const isSystem = msg.sender_type === 'system';
                                    const repliedMessage = messages.find(
                                        (m) => m.id === msg.reply_to_id,
                                    );

                                    if (isSystem) {
                                        return (
                                            <div key={msg.id} className="flex justify-start">
                                                <div className="flex items-end gap-2 max-w-[85%]">
                                                    <div className="w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mb-4">
                                                        <Bot className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5 px-1">Tin nhắn tự động</span>
                                                        <div className="px-3 py-2 text-[13px] rounded-2xl rounded-bl-md leading-relaxed bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-700 whitespace-pre-line">
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
                                                'flex group',
                                                isGuest ? 'justify-end' : 'justify-start',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex items-end gap-2 max-w-[85%]',
                                                    isGuest && 'flex-row-reverse',
                                                )}
                                            >
                                                {!isGuest && (
                                                    <div className="w-7 h-7 bg-[#002d6b] rounded-full flex items-center justify-center shrink-0 mb-4">
                                                        <User className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    {repliedMessage && !msg.is_deleted && (
                                                        <div
                                                            className={cn(
                                                                'text-[10px] bg-white dark:bg-slate-800 p-1.5 border-l-2 border-amber-400 mb-1 opacity-80 truncate max-w-45 rounded',
                                                                isGuest && 'ml-auto',
                                                            )}
                                                        >
                                                            {repliedMessage.is_deleted
                                                                ? 'Tin nhắn đã bị gỡ'
                                                                : repliedMessage.content}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        {isGuest && !msg.is_deleted && (
                                                            <button
                                                                onClick={() => setReplyingTo(msg)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#002d6b]"
                                                            >
                                                                <Reply className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <div
                                                            className={cn(
                                                                'px-3 py-2 text-[13px] rounded-2xl leading-relaxed',
                                                                isGuest
                                                                    ? 'bg-[#002d6b] text-white rounded-br-md'
                                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md',
                                                                msg.is_deleted &&
                                                                    'italic opacity-50 bg-transparent border-dashed border border-slate-300',
                                                            )}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        {!isGuest && !msg.is_deleted && (
                                                            <button
                                                                onClick={() => setReplyingTo(msg)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#002d6b]"
                                                            >
                                                                <Reply className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'text-[9px] text-slate-400 mt-0.5 px-1 flex items-center gap-1',
                                                            isGuest && 'justify-end',
                                                        )}
                                                    >
                                                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                        {isGuest && sessionData?.admin_last_seen_at && (
                                                            <span
                                                                className={cn(
                                                                    new Date(sessionData.admin_last_seen_at) >=
                                                                        new Date(msg.created_at)
                                                                        ? 'text-emerald-500'
                                                                        : 'text-slate-400',
                                                                )}
                                                            >
                                                                {new Date(sessionData.admin_last_seen_at) >=
                                                                new Date(msg.created_at)
                                                                    ? '• Đã xem'
                                                                    : '• Đã gửi'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between border-l-3 border-amber-400"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-[#002d6b] font-semibold">
                                                Trả lời{' '}
                                                {replyingTo.sender_type === 'guest'
                                                    ? 'Bạn'
                                                    : 'Admin'}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {replyingTo.content}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
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
                                    className="h-9 text-sm rounded-lg bg-slate-50 dark:bg-slate-800"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="h-9 w-9 bg-[#002d6b] hover:bg-[#002d6b]/90 text-white rounded-lg shrink-0"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) setHasUnread(false);
                    }}
                    className="w-14 h-14 rounded-full bg-linear-to-br from-[#002d6b] to-[#003d8f] hover:from-[#001d4b] hover:to-[#002d6b] text-white shadow-xl shadow-[#002d6b]/30 transition-all relative"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                    {hasUnread && !isOpen && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </Button>
            </motion.div>
        </div>
    );
}
