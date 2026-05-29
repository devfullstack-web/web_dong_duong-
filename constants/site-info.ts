/**
 * Thong tin cong ty - lay tu bien moi truong de dung chung toan bo website.
 */

import { getOptionalEnv } from '@/utils/env';

const companyWebsite = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE);
const companyWebsiteLabel = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE_LABEL);
const companyHotline = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE);
const companyHotlineRaw = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE_RAW);
const companyFullName = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FULL_NAME);
const companyCopyrightName = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_NAME);
const companyCopyrightText = getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_TEXT);
const companyCopyright = [`© ${new Date().getFullYear()}`, companyCopyrightName, companyCopyrightText]
    .filter(Boolean)
    .join(' ')
    .trim();

export const COMPANY_INFO = {
    name: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_NAME),
    shortName: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME),
    fullName: companyFullName,

    // Dia chi
    address: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),

    // Lien he
    phone: companyHotline,
    phoneRaw: companyHotlineRaw,
    hotline: companyHotline,
    hotlineRaw: companyHotlineRaw,

    email: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
    supportEmail: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL),

    // Website
    website: companyWebsite,
    websiteLabel: companyWebsiteLabel,

    // Mang xa hoi
    social: {
        facebook: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FACEBOOK),
        linkedin: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_LINKEDIN),
        youtube: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_YOUTUBE),
        zalo: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_ZALO),
    },

    // Gio lam viec
    workingHours: {
        weekdays: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_WEEKDAYS),
        saturday: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SATURDAY),
        sunday: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SUNDAY),
    },

    // Thong tin phap ly
    taxCode: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_CODE),
    foundedYear: Number(getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_FOUNDED_YEAR)) || undefined,

    // Slogan / Mo ta
    slogan: getOptionalEnv(process.env.NEXT_PUBLIC_COMPANY_SLOGAN),

    // Copyright
    copyright: companyCopyright,
} as const;
