'use client';

/**
 * Inert Socket Hook.
 * Socket functionality has been disabled per user request.
 */
export function useSocket(_options?: any) {
    return {
        socket: null as any,
        isConnected: false,
    };
}
