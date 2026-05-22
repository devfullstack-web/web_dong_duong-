/**
 * Thong tin cong ty - lay tu bien moi truong de dung chung toan bo website.
 */

const getEnv = (value: string | undefined) => value?.trim() || '';
const companyWebsite = getEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE) || getEnv(process.env.NEXT_PUBLIC_SITE_URL);
const companyWebsiteLabel =
    getEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE_LABEL) ||
    companyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '');
const companyHotline = getEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE);
const companyHotlineRaw =
    getEnv(process.env.NEXT_PUBLIC_COMPANY_HOTLINE_RAW) || companyHotline.replace(/[^\d+]/g, '');
const companyFullName = getEnv(process.env.NEXT_PUBLIC_COMPANY_FULL_NAME);
const companyCopyrightName = getEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_NAME) || companyFullName;
const companyCopyrightText = getEnv(process.env.NEXT_PUBLIC_COMPANY_COPYRIGHT_TEXT);

export const COMPANY_INFO = {
    name: getEnv(process.env.NEXT_PUBLIC_COMPANY_NAME),
    shortName: getEnv(process.env.NEXT_PUBLIC_COMPANY_SHORT_NAME),
    fullName: companyFullName,

    // Dia chi
    address: getEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),

    // Lien he
    phone: companyHotline,
    phoneRaw: companyHotlineRaw,
    hotline: companyHotline,
    hotlineRaw: companyHotlineRaw,

    email: getEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
    supportEmail: getEnv(process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL),

    // Website
    website: companyWebsite,
    websiteLabel: companyWebsiteLabel,

    // Mang xa hoi
    social: {
        facebook: getEnv(process.env.NEXT_PUBLIC_COMPANY_FACEBOOK),
        linkedin: getEnv(process.env.NEXT_PUBLIC_COMPANY_LINKEDIN),
        youtube: getEnv(process.env.NEXT_PUBLIC_COMPANY_YOUTUBE),
        zalo: getEnv(process.env.NEXT_PUBLIC_COMPANY_ZALO),
    },

    // Gio lam viec
    workingHours: {
        weekdays: getEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_WEEKDAYS),
        saturday: getEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SATURDAY),
        sunday: getEnv(process.env.NEXT_PUBLIC_COMPANY_WORKING_HOURS_SUNDAY),
    },

    // Thong tin phap ly
    taxCode: getEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_CODE),
    foundedYear: Number(getEnv(process.env.NEXT_PUBLIC_COMPANY_FOUNDED_YEAR)) || undefined,

    // Slogan / Mo ta
    slogan: getEnv(process.env.NEXT_PUBLIC_COMPANY_SLOGAN),

    // Copyright
    copyright: `© ${new Date().getFullYear()} ${companyCopyrightName}. ${companyCopyrightText}`.trim(),
} as const;
