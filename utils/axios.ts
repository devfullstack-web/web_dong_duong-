import axios from 'axios';
import Cookies from 'js-cookie';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';

const $api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Public API instance - no auth headers, no refresh logic
// Use this for public endpoints like chat widget
export const $publicApi = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (
                originalRequest.url.includes(API_ROUTES.AUTH.LOGIN) ||
                originalRequest.url.includes(API_ROUTES.AUTH.REFRESH)
            ) {
                return Promise.reject(error);
            }

            try {
                const refreshRes = await axios.post('/api' + API_ROUTES.AUTH.REFRESH);

                if (refreshRes.data.success) {
                    return $api(originalRequest);
                }
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    const isPortal = window.location.pathname.startsWith('/portal');
                    if (isPortal) {
                        window.location.href = SITE_ROUTES.LOGIN;
                    }
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export default $api;
