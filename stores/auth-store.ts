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
    refreshUser: () => Promise<void>;
    initialize: () => void;
    logout: () => void;
}

function toAuthUser(data: { user: Record<string, unknown>; roles: string[]; permissions: string[] }): AuthUser {
    const { user, roles, permissions } = data;
    return {
        id: user.id as string,
        email: user.email as string,
        username: ((user.email as string) ?? '').split('@')[0],
        full_name: (user.full_name as string) || '',
        is_active: user.is_active as boolean,
        is_system: Boolean(user.is_system),
        avatar_url: (user.avatar_url as string) || undefined,
        roles,
        permissions,
    };
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isInitialized: false,

    refreshUser: async () => {
        set({ isLoading: true });

        // Decode JWT for instant UI (trước khi fetch API)
        if (!get().isInitialized) {
            const token = Cookies.get('accessToken');
            if (token) {
                try {
                    const { user } = decodeJwt(token) as { user: AuthUser };
                    set({ user });
                } catch { /* token invalid, sẽ fetch API bên dưới */ }
            }
        }

        try {
            const res = await $api.get(API_ROUTES.AUTH.PROFILE);
            if (!res.data.success) {
                await get().logout();
                return;
            }

            set({ user: toAuthUser(res.data.data), isInitialized: true });

            // Sync server session
            $api.post(API_ROUTES.AUTH.REFRESH).catch(() => {});
        } catch (err) {
            const status = axios.isAxiosError(err) ? err.response?.status : null;
            if (status === 401 || status === 403 || status === 404) {
                await get().logout();
            } else {
                set({ user: null, isInitialized: true });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    initialize: () => {
        if (!get().isInitialized) get().refreshUser();
    },

    logout: async () => {
        set({ user: null, isInitialized: true, isLoading: false });
        Cookies.remove('accessToken', { path: '/' });

        try {
            await $api.post(API_ROUTES.AUTH.LOGOUT);
        } catch { /* ignore */ }

        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/portal')) {
            window.location.href = '/login';
        }
    },
}));
