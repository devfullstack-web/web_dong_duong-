import { create } from 'zustand';
import Cookies from 'js-cookie';
import { decodeJwt } from 'jose';
import $api from '@/utils/axios';
import axios from 'axios';
import { API_ROUTES } from '@/constants/routes';

export interface AuthUser {
    id: string;
    username: string;
    full_name?: string;
    email?: string;
    is_active?: boolean;
    is_system?: boolean;
    avatar_url?: string;
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

                const roleCodes = Array.isArray(roles)
                    ? roles.map((r: string | { code: string }) => typeof r === 'string' ? r : r.code)
                    : [];

                const synchronizedUser: AuthUser = {
                    id: user.id,
                    username: user.email.split('@')[0],
                    full_name: user.full_name || '',
                    email: user.email,
                    is_active: user.status === 'active' || user.is_active,
                    is_system: !!user.is_system,
                    avatar_url: user.avatar_url || undefined,
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
