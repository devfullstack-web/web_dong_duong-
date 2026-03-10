import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    query?: Record<string, any>;
    transports?: string[];
    reconnectionAttempts?: number;
}

/**
 * Custom hook to manage Socket.io connection.
 * Only connects when custom server is running (production or `npm run start`).
 * In dev mode (`next dev`), Socket.IO server is not available.
 */
export function useSocket(options: UseSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const queryStr = JSON.stringify(options.query || {});
    const transportsStr = JSON.stringify(options.transports || ['websocket', 'polling']);

    useEffect(() => {
        // Socket.IO chỉ khả dụng khi chạy qua custom server (production).
        // Khi chạy `next dev`, không có Socket.IO server → skip.
        if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_SOCKET) {
            return;
        }

        const socket = io({
            query: options.query,
            transports: options.transports || ['websocket', 'polling'],
            reconnectionAttempts: options.reconnectionAttempts || 3,
            timeout: 5000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('[Socket] Connected:', socket.id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('[Socket] Disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection Error:', error.message);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, [queryStr, transportsStr, options.reconnectionAttempts]);

    return {
        socket: socketRef.current,
        isConnected,
    };
}
