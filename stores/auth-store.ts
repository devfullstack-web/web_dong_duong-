import { create } from 'zustand';
import Cookies from 'js-cookie';
import { decodeJwt } from 'jose';
import $api from '@/utils/axios';
import axios from 'axios';
import { API_ROUTES } from '@/constants/routes';

export interface AuthUser {
    id: string;
    username: string;
    fullName?: string;
    email?: string;
    isActive?: boolean;
    is_system?: boolean;
    avatarUrl?: string;
    phone?: string;
    roles: string[];
    permissions: string[];
}

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isInitialized: boolean;
    setUser: (user: AuthUser | null) => void;
    setLoading: (isLoading: boolean) => void;
    refreshUser: () => Promise<void>;
    initialize: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isInitialized: false,

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),

    refreshUser: async () => {
        set({ isLoading: true });

        // 1. First try to get initial state from JWT if not initialized
        if (!get().isInitialized) {
            const token = Cookies.get('accessToken');
            if (token) {
                try {
                    const decoded = decodeJwt(token) as { user: AuthUser };
                    set({ user: decoded.user });
                } catch (error) {
                    console.error('Failed to decode token', error);
                }
            }
        }

        // 2. Fetch fresh data from server
        try {
            const response = await $api.get(API_ROUTES.AUTH.PROFILE);
            if (response.data.success) {
                const { user, roles, permissions } = response.data.data;

                const roleCodes = roles.map((r: { code: string }) => r.code);

                const synchronizedUser: AuthUser = {
                    id: user.id,
                    username: user.email.split('@')[0],
                    fullName: user.fullName || '',
                    email: user.email,
                    isActive: user.status === 'active',
                    is_system: !!user.is_system,
                    avatarUrl: user.avatarUrl || undefined,
                    roles: roleCodes,
                    permissions: permissions || [],
                };

                set({ user: synchronizedUser, isInitialized: true });

                // Resync server-side session cookie so API middleware has fresh permissions
                await $api.post(API_ROUTES.AUTH.REFRESH).catch(() => {
                    // Non-fatal — session will self-refresh on next token expiry
                });
            } else {
                await get().logout();
            }
        } catch (error: unknown) {
            console.error('Auth check failed:', error);
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 401 ||
                    error.response?.status === 404 ||
                    error.response?.status === 403)
            ) {
                await get().logout();
            } else {
                set({ user: null, isInitialized: true });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    initialize: () => {
        if (!get().isInitialized) {
            get().refreshUser();
        }
    },

    logout: async () => {
        set({ user: null, isInitialized: true, isLoading: false });
        Cookies.remove('accessToken', { path: '/' });

        try {
            await $api.post(API_ROUTES.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout API failed:', error);
        }

        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/portal')) {
            window.location.href = '/login';
        }
    },
}));
