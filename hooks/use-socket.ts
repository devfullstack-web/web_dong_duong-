import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    query?: Record<string, any>;
    transports?: string[];
    reconnectionAttempts?: number;
}

/**
 * Custom hook to manage Socket.io connection
 * @param options Connection options for socket.io-client
 * @returns Object containing the socket instance and connection status
 */
export function useSocket(options: UseSocketOptions = {}) {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const queryStr = JSON.stringify(options.query || {});
    const transportsStr = JSON.stringify(options.transports || ['websocket', 'polling']);

    useEffect(() => {
        const socket = io({
            query: options.query,
            transports: options.transports || ['websocket', 'polling'],
            reconnectionAttempts: options.reconnectionAttempts || 5,
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
            console.error('[Socket] Connection Error:', error);
        });

        // Cleanup on unmount
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
