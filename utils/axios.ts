import axios from 'axios';
import Cookies from 'js-cookie';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

const $api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Public API instance - no auth headers, no refresh logic
// Use this for public endpoints like chat widget
export const $publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to clear auth and redirect to login
const clearAuthAndRedirect = () => {
    if (typeof window !== 'undefined') {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        const pathname = window.location.pathname;
        // Check for portal path with or without locale prefix (e.g., /portal, /vi/portal, /en/portal)
        const isPortal = pathname.includes('/portal');
        const isLoginPage = pathname.includes('/login');
        if (isPortal && !isLoginPage) {
            // Extract locale from pathname (e.g., /vi/portal -> vi)
            const localeMatch = pathname.match(/^\/(vi|en)\//);
            const locale = localeMatch ? localeMatch[1] : 'vi';
            window.location.href = `/${locale}${SITE_ROUTES.LOGIN}`;
        }
    }
};

$api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

$api.interceptors.response.use(
    (response) => {
        // Check for auth errors in successful HTTP responses
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
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Don't retry refresh for login/refresh endpoints
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
                    // Refresh failed (e.g., refresh token missing or expired)
                    clearAuthAndRedirect();
                    return Promise.reject(new Error(refreshRes.data.error || 'Session expired'));
                }
            } catch (refreshError: any) {
                // Refresh request failed (400, 401, network error, etc.)
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        // Handle 400 Bad Request with auth-related errors
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

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            clearAuthAndRedirect();
        }

        return Promise.reject(error);
    },
);

export default $api;
