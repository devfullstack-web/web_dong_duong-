'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Loader2, Smile, Reply, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { $publicApi } from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { io, Socket } from 'socket.io-client';

interface Message {
    id: string;
    session_id: string;
    content: string;
    sender_type: 'guest' | 'admin';
    reply_to_id?: string;
    is_deleted: boolean;
    created_at: string;
}

interface ChatSession {
    id: string;
    admin_last_seen_at?: string;
    guest_last_seen_at?: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [guestId, setGuestId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionData, setSessionData] = useState<ChatSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Initialize Guest ID
    useEffect(() => {
        let id = localStorage.getItem('chat_guest_id');
        if (!id) {
            id =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            localStorage.setItem('chat_guest_id', id);
        }
        setGuestId(id);
    }, []);

    // Fetch or create session
    useEffect(() => {
        if (!guestId || !isOpen) return;

        const initSession = async () => {
            try {
                const res = await $publicApi.post(API_ROUTES.CHAT.SESSIONS, { guestId });
                const sessionPayload = res.data.data;
                setSessionId(sessionPayload.id);
                setSessionData(sessionPayload);

                const msgRes = await $publicApi.get(
                    `${API_ROUTES.CHAT.MESSAGES}?sessionId=${sessionPayload.id}`,
                );
                setMessages(msgRes.data.data || []);
                handleUpdateSeen(sessionPayload.id);
            } catch (error) {
                console.error('Failed to init chat session:', error);
            }
        };

        if (!sessionId) {
            initSession();
        } else {
            handleUpdateSeen(sessionId);
        }
    }, [guestId, isOpen, sessionId]);

    const handleUpdateSeen = async (id: string) => {
        try {
            await $publicApi.patch(`${API_ROUTES.CHAT.SESSIONS}/${id}`, { guestLastSeen: true });
        } catch (error) {
            // Silently fail
        }
    };

    // Real-time listener with Socket.io
    useEffect(() => {
        if (!sessionId || !isOpen) return;

        const socket = io({
            query: { sessionId },
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('message', (data: any) => {
            if (data.id && data.session_id === sessionId) {
                setMessages((prev) => {
                    if (prev.find((m) => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                if (data.sender_type === 'admin') {
                    handleUpdateSeen(sessionId);
                }
            }
        });

        socket.on('message_update', (data: any) => {
            if (data.session_id === sessionId) {
                setMessages((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            }
        });

        socket.on('typing', (data: any) => {
            if (data.sessionId === sessionId && data.senderType === 'admin') {
                setIsAdminTyping(data.isTyping);
            }
        });

        socket.on('session_update', (data: any) => {
            if (data.id === sessionId) {
                setSessionData(data);
            }
        });

        socket.on('session_removed', (data: any) => {
            if (data.sessionId === sessionId) {
                setSessionId(null);
                setMessages([]);
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Socket Error:', err);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [sessionId, isOpen]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (customContent?: string) => {
        const content = customContent || inputValue.trim();
        if (!content || !sessionId) return;

        const replyId = replyingTo?.id;

        if (!customContent) setInputValue('');
        setReplyingTo(null);
        setIsLoading(true);
        sendTypingStatus(false);

        try {
            const res = await $publicApi.post(API_ROUTES.CHAT.MESSAGES, {
                sessionId,
                content,
                isFromWidget: true,
                replyToId: replyId,
            });

            const newMessage = res.data.data;
            if (newMessage && newMessage.id) {
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

    const sendTypingStatus = (isTyping: boolean) => {
        if (!sessionId || !socketRef.current) return;
        socketRef.current.emit('typing', {
            sessionId,
            senderType: 'guest',
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

    const addEmoji = (emoji: string) => {
        setInputValue((prev) => prev + emoji);
        setShowEmojis(false);
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
                        className="mb-4 w-85 md:w-100 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col h-130 border border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="bg-linear-to-r from-[#002d6b] to-[#003d8f] p-5 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                            </div>

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                        <Headphones className="w-6 h-6 text-[#fbbf24]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-wider">
                                            Hỗ trợ trực tuyến
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                            <p className="text-[10px] text-white/70 font-medium uppercase tracking-widest">
                                                Đang hoạt động
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 h-9 w-9 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex flex-col gap-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-[#002d6b]/5 flex items-center justify-center mb-4 border border-[#002d6b]/10">
                                            <MessageCircle className="w-8 h-8 text-[#002d6b]/30" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">
                                            Xin chào!
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-50">
                                            Bạn cần chúng tôi hỗ trợ điều gì?
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isGuest = msg.sender_type === 'guest';
                                    const repliedMessage = messages.find(
                                        (m) => m.id === msg.reply_to_id,
                                    );

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isGuest ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            <div
                                                className={`flex items-end gap-2 max-w-[85%] ${isGuest ? 'flex-row-reverse' : ''}`}
                                            >
                                                {!isGuest && (
                                                    <div className="w-8 h-8 bg-[#002d6b] flex items-center justify-center shrink-0">
                                                        <User className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <div
                                                        className={cn(
                                                            'text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-1 flex items-center gap-2',
                                                            isGuest &&
                                                                'text-right flex-row-reverse',
                                                        )}
                                                    >
                                                        <span>{isGuest ? 'Bạn' : 'Admin'}</span>
                                                        {!msg.is_deleted && (
                                                            <button
                                                                onClick={() => setReplyingTo(msg)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#002d6b]"
                                                            >
                                                                <Reply className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {repliedMessage && !msg.is_deleted && (
                                                        <div
                                                            className={`text-[10px] bg-white dark:bg-slate-800 p-2 border-l-2 border-[#fbbf24] mb-1 opacity-80 truncate max-w-45 ${isGuest ? 'ml-auto text-right' : ''}`}
                                                        >
                                                            {repliedMessage.is_deleted
                                                                ? 'Tin nhắn đã bị gỡ'
                                                                : repliedMessage.content}
                                                        </div>
                                                    )}

                                                    <div
                                                        className={cn(
                                                            'px-4 py-2.5 text-sm',
                                                            isGuest
                                                                ? 'bg-[#002d6b] text-white'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
                                                            msg.is_deleted &&
                                                                'italic opacity-50 bg-transparent border-dashed border border-slate-300',
                                                        )}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <div
                                                        className={`text-[9px] font-medium text-slate-400 mt-1 px-1 flex items-center gap-1.5 ${isGuest ? 'justify-end' : ''}`}
                                                    >
                                                        {new Date(
                                                            msg.created_at,
                                                        ).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                        {isGuest && (
                                                            <span className="flex items-center gap-1">
                                                                •{' '}
                                                                <span
                                                                    className={cn(
                                                                        sessionData?.admin_last_seen_at &&
                                                                            new Date(
                                                                                sessionData.admin_last_seen_at,
                                                                            ) >=
                                                                                new Date(
                                                                                    msg.created_at,
                                                                                )
                                                                            ? 'text-emerald-500'
                                                                            : 'text-slate-400',
                                                                    )}
                                                                >
                                                                    {sessionData?.admin_last_seen_at &&
                                                                    new Date(
                                                                        sessionData.admin_last_seen_at,
                                                                    ) >= new Date(msg.created_at)
                                                                        ? 'Đã xem'
                                                                        : 'Đã gửi'}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {isAdminTyping && (
                                    <div className="flex justify-start">
                                        <div className="flex items-end gap-2">
                                            <div className="w-8 h-8 bg-[#002d6b] flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 flex gap-1 items-center">
                                                <span
                                                    className="w-1.5 h-1.5 bg-[#002d6b] rounded-full animate-bounce"
                                                    style={{ animationDelay: '0s' }}
                                                ></span>
                                                <span
                                                    className="w-1.5 h-1.5 bg-[#002d6b] rounded-full animate-bounce"
                                                    style={{ animationDelay: '0.15s' }}
                                                ></span>
                                                <span
                                                    className="w-1.5 h-1.5 bg-[#002d6b] rounded-full animate-bounce"
                                                    style={{ animationDelay: '0.3s' }}
                                                ></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={scrollRef} />
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 flex items-center justify-between border-l-4 border-[#fbbf24]"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[9px] text-[#002d6b] font-black uppercase tracking-widest">
                                                Trả lời{' '}
                                                {replyingTo.sender_type === 'guest'
                                                    ? 'Bạn'
                                                    : 'Admin'}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {replyingTo.content}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            onClick={() => setReplyingTo(null)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {showEmojis && (
                                <div className="absolute bottom-full left-4 mb-2 p-3 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex gap-3">
                                    {['😊', '❤️', '👍', '😂', '🔥', '🤔'].map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => addEmoji(e)}
                                            className="text-xl hover:scale-125 transition-transform"
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-slate-400 hover:text-[#fbbf24] hover:bg-[#fbbf24]/10 h-10 w-10"
                                    onClick={() => setShowEmojis(!showEmojis)}
                                >
                                    <Smile className="w-5 h-5" />
                                </Button>
                                <Input
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tin nhắn..."
                                    className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-[#002d6b] focus-visible:ring-offset-0 text-sm placeholder:text-slate-400"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="h-10 w-10 bg-[#002d6b] hover:bg-[#002d6b]/90 text-white shrink-0"
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
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-linear-to-br from-[#002d6b] to-[#003d8f] hover:from-[#001d4b] hover:to-[#002d6b] text-white shadow-xl shadow-[#002d6b]/30 transition-all relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-[#fbbf24] opacity-0 group-hover:opacity-10 transition-opacity" />
                    {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </Button>
            </motion.div>
        </div>
    );
}
