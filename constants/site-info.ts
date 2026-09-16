/**
 * Thong tin cong ty - lay tu bien moi truong de dung chung toan bo website.
 */

import { getOptionalEnv } from '@/utils/env';

const companyWebsite = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE) || 'https://saigonvalve.vn';
const companyWebsiteLabel = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE_LABEL) || 'saigonvalve.vn';
const companyHotline = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE) || '090 695 54 59';
const companyHotlineRaw = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE_RAW) || '0906955459';
const companyFullName = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FULL_NAME) || 'CÔNG TY CỔ PHẦN ĐẦU TƯ & THƯƠNG MẠI ĐÔNG DƯƠNG';
const companyCopyrightName = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_NAME) || 'ĐÔNG DƯƠNG CORPORATION';
const companyCopyrightText = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_TEXT) || 'BẢO LƯU TẤT CẢ QUYỀN.';
const companyCopyright = [`© ${new Date().getFullYear()}`, companyCopyrightName, companyCopyrightText]
    .filter(Boolean)
    .join(' ')
    .trim();

export const COMPANY_INFO = {
    name: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_NAME) || 'Đông Dương Corporation',
    shortName: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME) || 'Đông Dương',
    fullName: companyFullName,

    // Dia chi
    address: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS) || 'Số 124/16-18 Võ Văn Hát, Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh',

    // Lien he
    phone: companyHotline,
    phoneRaw: companyHotlineRaw,
    hotline: companyHotline,
    hotlineRaw: companyHotlineRaw,

    email: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL) || 'info@saigonvalve.vn',
    supportEmail: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL) || 'support@saigonvalve.vn',

    // Website
    website: companyWebsite,
    websiteLabel: companyWebsiteLabel,

    // Mang xa hoi
    social: {
        facebook: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FACEBOOK) || 'https://www.facebook.com/saigon.valve.2024',
        linkedin: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_LINKEDIN) || 'https://linkedin.com/company/saigonvalve',
        youtube: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_YOUTUBE) || 'https://youtube.com/@saigonvalve',
        zalo: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_ZALO) || 'https://zalo.me/0906955459',
    },

    // Gio lam viec
    workingHours: {
        weekdays: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_WEEKDAYS) || '08:00 - 17:30',
        saturday: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SATURDAY) || '08:00 - 12:00',
        sunday: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SUNDAY) || 'Nghỉ',
    },

    // Thong tin phap ly
    taxCode: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_CODE) || '0312345678',
    foundedYear: Number(getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FOUNDED_YEAR)) || 2015,

    // Slogan / Mo ta
    slogan: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SLOGAN) || 'Tổng đại lý phân phối Gạch Men & Gạch Trang Trí, Hệ Thống Máy Lạnh Điều Hòa Trung Tâm VRV - Chiller Hàng Đầu Việt Nam.',

    // Copyright
    copyright: companyCopyright,
} as const;
