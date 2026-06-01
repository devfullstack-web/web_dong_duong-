import { db } from '@/db';
import { systemSettings } from '@/db/schemas/system-settings';
import { COMPANY_INFO } from '@/constants/site-info';

export interface SiteInfo {
    name: string;
    shortName: string;
    fullName: string;
    address: string;
    phone: string;
    phoneRaw: string;
    hotline: string;
    hotlineRaw: string;
    email: string;
    supportEmail: string;
    website: string;
    websiteLabel: string;
    social: {
        facebook: string;
        linkedin: string;
        youtube: string;
        zalo: string;
    };
    workingHours: {
        weekdays: string;
        saturday: string;
        sunday: string;
    };
    taxCode: string;
    foundedYear?: number;
    slogan: string;
    copyright: string;
    raw: Record<string, string>;
}

class SiteSettingService {
    async getSiteInfo(): Promise<SiteInfo> {
        try {
            const settings = await db.select().from(systemSettings);
            const map = new Map<string, string>();
            const raw: Record<string, string> = {};
            settings.forEach((s) => {
                map.set(s.key, s.value);
                raw[s.key] = s.value;
            });

            const get = (key: string, fb: string) => map.get(key) ?? fb;

            const name = get('site_name', COMPANY_INFO.name || '');
            const shortName = get('site_short_name', COMPANY_INFO.shortName || '');
            const fullName = get('site_full_name', COMPANY_INFO.fullName || '');
            const address = get('site_address', COMPANY_INFO.address || '');
            const phone = get('site_phone', COMPANY_INFO.phone || '');
            const phoneRaw = get('site_phone_raw', COMPANY_INFO.phoneRaw || '');
            const email = get('site_email', COMPANY_INFO.email || '');
            const supportEmail = get('site_support_email', COMPANY_INFO.supportEmail || '');
            const website = get('site_website', COMPANY_INFO.website || '');
            const websiteLabel = get('site_website_label', COMPANY_INFO.websiteLabel || '');

            const facebook = get('site_facebook', COMPANY_INFO.social.facebook || '');
            const linkedin = get('site_linkedin', COMPANY_INFO.social.linkedin || '');
            const youtube = get('site_youtube', COMPANY_INFO.social.youtube || '');
            const zalo = get('site_zalo', COMPANY_INFO.social.zalo || '');

            const weekdays = get('site_working_hours_weekdays', COMPANY_INFO.workingHours.weekdays || '');
            const saturday = get('site_working_hours_saturday', COMPANY_INFO.workingHours.saturday || '');
            const sunday = get('site_working_hours_sunday', COMPANY_INFO.workingHours.sunday || '');

            const taxCode = get('site_tax_code', COMPANY_INFO.taxCode || '');
            const foundedYearStr = map.get('site_founded_year');
            const foundedYear = foundedYearStr ? Number(foundedYearStr) : COMPANY_INFO.foundedYear;
            const slogan = get('site_slogan', COMPANY_INFO.slogan || '');

            let copyright = map.get('site_copyright');
            if (!copyright) {
                const copName = map.get('site_copyright_name');
                const copText = map.get('site_copyright_text');
                if (copName || copText) {
                    copyright = [`© ${new Date().getFullYear()}`, copName, copText]
                        .filter(Boolean)
                        .join(' ')
                        .trim();
                } else {
                    copyright = COMPANY_INFO.copyright;
                }
            }

            return {
                name,
                shortName,
                fullName,
                address,
                phone,
                phoneRaw,
                hotline: phone,
                hotlineRaw: phoneRaw,
                email,
                supportEmail,
                website,
                websiteLabel,
                social: { facebook, linkedin, youtube, zalo },
                workingHours: { weekdays, saturday, sunday },
                taxCode,
                foundedYear,
                slogan,
                copyright: copyright || '',
                raw,
            };
        } catch (e) {
            console.error('[SiteSettingService] Error getting settings:', e);
            return {
                ...(COMPANY_INFO as unknown as Omit<SiteInfo, 'raw'>),
                raw: {},
            } as SiteInfo;
        }
    }

    async updateSiteInfo(data: Record<string, string>): Promise<boolean> {
        try {
            const keys = Object.keys(data);
            if (keys.length === 0) return true;

            for (const key of keys) {
                const val = data[key] || '';
                await db
                    .insert(systemSettings)
                    .values({
                        key,
                        value: val,
                        updated_at: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: systemSettings.key,
                        set: {
                            value: val,
                            updated_at: new Date(),
                        },
                    });
            }
            return true;
        } catch (e) {
            console.error('[SiteSettingService] Error updating settings:', e);
            throw e;
        }
    }
}

export const siteSettingService = new SiteSettingService();
