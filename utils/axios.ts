import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';
import { getRequiredEnv } from '@/utils/env';

const BASE_URL = getRequiredEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const $api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const $publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const clearAuthAndRedirect = () => {
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const isPortal = pathname.includes('/portal');
        const isLoginPage = pathname.includes('/login');
        if (isPortal && !isLoginPage) {
            const localeMatch = pathname.match(/^\/(vi|en)\//);
            const locale = localeMatch ? localeMatch[1] : 'vi';
            window.location.href = `/${locale}${SITE_ROUTES.LOGIN}`;
        }
    }
};

$api.interceptors.response.use(
    (response) => {
        if (response.data?.success === false) {
            const errorMsg = response.data?.error?.toLowerCase() || '';
            if (
                errorMsg.includes('refresh token') ||
                errorMsg.includes('token expired') ||
                errorMsg.includes('invalid token') ||
                errorMsg.includes('unauthorized')
            ) {
                clearAuthAndRedirect();
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            if (
                originalRequest.url?.includes(API_ROUTES.AUTH.LOGIN) ||
                originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH)
            ) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                const refreshRes = await axios.post(BASE_URL + API_ROUTES.AUTH.REFRESH, {}, {
                    withCredentials: true
                });

                if (refreshRes.data.success) {
                    return $api(originalRequest);
                } else {
                    clearAuthAndRedirect();
                    return Promise.reject(new Error(refreshRes.data.error || 'Session expired'));
                }
            } catch (refreshError: unknown) {
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 400) {
            const errorMsg = error.response?.data?.error?.toLowerCase() || '';
            if (
                errorMsg.includes('refresh token') ||
                errorMsg.includes('token') ||
                errorMsg.includes('unauthorized')
            ) {
                clearAuthAndRedirect();
            }
        }

        if (error.response?.status === 403) {
            clearAuthAndRedirect();
        }

        return Promise.reject(error);
    },
);

export default $api;
