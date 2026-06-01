import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';
import { getRequiredEnv } from '@/utils/env';

const BASE_URL = getRequiredEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const AUTH_ERROR_KEYWORDS = ['refresh token', 'token expired', 'invalid token', 'unauthorized', 'token'];

type AxiosRequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

const axiosConfig = { baseURL: BASE_URL, headers: JSON_HEADERS };
const $api = axios.create(axiosConfig);
export const $publicApi = axios.create(axiosConfig);

const isAuthError = (msg: string) => AUTH_ERROR_KEYWORDS.some(k => msg.includes(k));

const clearAuthAndRedirect = () => {
    if (typeof window === 'undefined') return;
    const { pathname } = window.location;
    if (!pathname.includes('/portal') || pathname.includes('/login')) return;
    const locale = pathname.match(/^\/(vi|en)\//)?.[1] ?? 'vi';
    window.location.href = `/${locale}${SITE_ROUTES.LOGIN}`;
};

$api.interceptors.response.use(
    (response) => {
        if (response.data?.success === false && isAuthError(response.data?.error?.toLowerCase() ?? '')) {
            clearAuthAndRedirect();
        }
        return response;
    },
    async (error) => {
        const { response, config: originalRequest } = error;
        const status = response?.status;
        const errorMsg = response?.data?.error?.toLowerCase() ?? '';

        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            const isAuthRoute = [API_ROUTES.AUTH.LOGIN, API_ROUTES.AUTH.REFRESH]
                .some(route => originalRequest.url?.includes(route));

            if (isAuthRoute) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(BASE_URL + API_ROUTES.AUTH.REFRESH, {}, { withCredentials: true });
                if (data.success) return $api(originalRequest);
                clearAuthAndRedirect();
                return Promise.reject(new Error(data.error || 'Session expired'));
            } catch (err) {
                clearAuthAndRedirect();
                return Promise.reject(err);
            }
        }

        if ((status === 400 && isAuthError(errorMsg)) || status === 403) {
            clearAuthAndRedirect();
        }

        return Promise.reject(error);
    },
);

export default $api;