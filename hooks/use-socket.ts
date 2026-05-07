'use client';

/**
 * Inert Socket Hook.
 * Socket functionality has been disabled per user request.
 */
export function useSocket() {
    return {
        socket: null,
        isConnected: false,
    };
}
