import { COMPANY_INFO } from '@/constants/site-info';

export const MAIL_BRAND = {
    primary: '#004395',
    secondary: '#00112b',
    accent: '#fbbf24',
    background: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#e11d48',
};

export const MAIL_ASSETS = {
    logo: '/images/logo/logo.png',
    website: COMPANY_INFO.website,
    websiteLabel: COMPANY_INFO.websiteLabel,
    facebook: COMPANY_INFO.social.facebook,
};

export const MAIL_CONTACT = {
    hotline: COMPANY_INFO.phone,
    hotlineRaw: COMPANY_INFO.phoneRaw,
    address: COMPANY_INFO.address,
    company: COMPANY_INFO.fullName,
};
