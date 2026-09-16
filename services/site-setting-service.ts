import { db } from '@/db';
import { systemSettings } from '@/db/schemas/system-settings';
import { COMPANY_INFO } from '@/constants/site-info';
import { eq, or } from 'drizzle-orm';

export interface HeroSlideSetting {
    id: string;
    title: string;
    title_en?: string;
    title_zh?: string;
    highlight?: string;
    highlight_en?: string;
    highlight_zh?: string;
    subtitle: string;
    subtitle_en?: string;
    subtitle_zh?: string;
    image_url: string;
    badge?: string;
    badge_en?: string;
    badge_zh?: string;
    cta_primary?: { text: string; text_en?: string; text_zh?: string; link: string };
    cta_secondary?: { text: string; text_en?: string; text_zh?: string; link: string };
}

export interface WhyChooseUsSetting {
    id: string;
    iconSrc: string;
    title: string;
    title_en?: string;
    title_zh?: string;
    desc: string;
    desc_en?: string;
    desc_zh?: string;
}

export interface WorkflowStepSetting {
    num: number;
    title: string;
    title_en?: string;
    title_zh?: string;
    icon: string;
}

export interface HomepageSettingsData {
    heroSlides: HeroSlideSetting[];
    whyChooseUs: WhyChooseUsSetting[];
    workflowSteps: WorkflowStepSetting[];
}

export interface SolutionItem {
    title: string;
    title_en?: string;
    title_zh?: string;
    desc: string;
    desc_en?: string;
    desc_zh?: string;
}

export interface SolutionData {
    brand: string;
    brand_en?: string;
    brand_zh?: string;
    title: string;
    title_en?: string;
    title_zh?: string;
    headerTitle: string;
    headerTitle_en?: string;
    headerTitle_zh?: string;
    description: string;
    description_en?: string;
    description_zh?: string;
    intro: string;
    intro_en?: string;
    intro_zh?: string;
    banner: string;
    image1: string;
    image2: string;
    core: {
        title: string;
        title_en?: string;
        title_zh?: string;
        intro: string;
        intro_en?: string;
        intro_zh?: string;
        items: SolutionItem[];
    };
    benefits: {
        title: string;
        title_en?: string;
        title_zh?: string;
        intro: string;
        intro_en?: string;
        intro_zh?: string;
        items: SolutionItem[];
        outro: string;
        outro_en?: string;
        outro_zh?: string;
    };
}

export interface BrandPartnerSetting {
    id?: string;
    name: string;
    shortName?: string;
    shortName_en?: string;
    shortName_zh?: string;
    sector: string;
    sector_en?: string;
    sector_zh?: string;
    category?: 'tiles' | 'hvac' | 'steel' | string;
    desc: string;
    desc_en?: string;
    desc_zh?: string;
    badge: string;
    badge_en?: string;
    badge_zh?: string;
    discount?: string;
    discount_en?: string;
    discount_zh?: string;
    logo?: string;
    website?: string;
    featured?: boolean;
}

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

            const weekdays = get(
                'site_working_hours_weekdays',
                COMPANY_INFO.workingHours.weekdays || '',
            );
            const saturday = get(
                'site_working_hours_saturday',
                COMPANY_INFO.workingHours.saturday || '',
            );
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

    async updateSettings(data: Record<string, string>): Promise<boolean> {
        return this.updateSiteInfo(data);
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

    async getHomepageData(locale: string = 'vi'): Promise<HomepageSettingsData> {
        try {
            const settings = await db
                .select()
                .from(systemSettings)
                .where(
                    or(
                        eq(systemSettings.key, 'homepage_hero_slides'),
                        eq(systemSettings.key, 'homepage_why_choose_us'),
                        eq(systemSettings.key, 'homepage_workflow_steps'),
                    ),
                );

            const map = new Map<string, string>();
            settings.forEach((s) => map.set(s.key, s.value));

            const rawHeroSlides: HeroSlideSetting[] = map.has('homepage_hero_slides')
                ? JSON.parse(map.get('homepage_hero_slides') || '[]')
                : [];

            const rawWhyChooseUs: WhyChooseUsSetting[] = map.has('homepage_why_choose_us')
                ? JSON.parse(map.get('homepage_why_choose_us') || '[]')
                : [];

            const rawWorkflowSteps: WorkflowStepSetting[] = map.has('homepage_workflow_steps')
                ? JSON.parse(map.get('homepage_workflow_steps') || '[]')
                : [];

            const isEn = locale === 'en';
            const isZh = locale === 'zh';

            const heroSlides: HeroSlideSetting[] = rawHeroSlides.map((s) => ({
                id: s.id,
                title: (isZh && s.title_zh) ? s.title_zh : (isEn && s.title_en) ? s.title_en : s.title,
                highlight: (isZh && s.highlight_zh) ? s.highlight_zh : (isEn && s.highlight_en) ? s.highlight_en : s.highlight,
                subtitle: (isZh && s.subtitle_zh) ? s.subtitle_zh : (isEn && s.subtitle_en) ? s.subtitle_en : s.subtitle,
                image_url: s.image_url,
                badge: (isZh && s.badge_zh) ? s.badge_zh : (isEn && s.badge_en) ? s.badge_en : s.badge,
                cta_primary: s.cta_primary ? {
                    text: (isZh && s.cta_primary.text_zh) ? s.cta_primary.text_zh : (isEn && s.cta_primary.text_en) ? s.cta_primary.text_en : s.cta_primary.text,
                    link: s.cta_primary.link,
                } : undefined,
                cta_secondary: s.cta_secondary ? {
                    text: (isZh && s.cta_secondary.text_zh) ? s.cta_secondary.text_zh : (isEn && s.cta_secondary.text_en) ? s.cta_secondary.text_en : s.cta_secondary.text,
                    link: s.cta_secondary.link,
                } : undefined,
            }));

            const whyChooseUs: WhyChooseUsSetting[] = rawWhyChooseUs.map((r) => ({
                id: r.id,
                iconSrc: r.iconSrc,
                title: (isZh && r.title_zh) ? r.title_zh : (isEn && r.title_en) ? r.title_en : r.title,
                desc: (isZh && r.desc_zh) ? r.desc_zh : (isEn && r.desc_en) ? r.desc_en : r.desc,
            }));

            const workflowSteps: WorkflowStepSetting[] = rawWorkflowSteps.map((st) => ({
                num: st.num,
                title: (isZh && st.title_zh) ? st.title_zh : (isEn && st.title_en) ? st.title_en : st.title,
                icon: st.icon,
            }));

            return {
                heroSlides,
                whyChooseUs,
                workflowSteps,
            };
        } catch (e) {
            console.error('[SiteSettingService] Error getting homepage data:', e);
            return {
                heroSlides: [],
                whyChooseUs: [],
                workflowSteps: [],
            };
        }
    }

    async getHeroSlides(locale: string = 'vi'): Promise<HeroSlideSetting[]> {
        const data = await this.getHomepageData(locale);
        return data.heroSlides;
    }

    async getWhyChooseUs(locale: string = 'vi'): Promise<WhyChooseUsSetting[]> {
        const data = await this.getHomepageData(locale);
        return data.whyChooseUs;
    }

    async getWorkflowSteps(locale: string = 'vi'): Promise<WorkflowStepSetting[]> {
        const data = await this.getHomepageData(locale);
        return data.workflowSteps;
    }

    async updateHomepageData(data: Partial<HomepageSettingsData>): Promise<boolean> {
        const updates: Record<string, string> = {};
        if (data.heroSlides !== undefined) {
            updates['homepage_hero_slides'] = JSON.stringify(data.heroSlides);
        }
        if (data.whyChooseUs !== undefined) {
            updates['homepage_why_choose_us'] = JSON.stringify(data.whyChooseUs);
        }
        if (data.workflowSteps !== undefined) {
            updates['homepage_workflow_steps'] = JSON.stringify(data.workflowSteps);
        }
        return this.updateSettings(updates);
    }

    async getSolutions(): Promise<Record<string, SolutionData>> {
        try {
            const [row] = await db
                .select()
                .from(systemSettings)
                .where(eq(systemSettings.key, 'site_solutions'));

            if (row && row.value) {
                return JSON.parse(row.value);
            }
            return {};
        } catch (e) {
            console.error('[SiteSettingService] Error getting solutions:', e);
            return {};
        }
    }

    async getSolutionBySlug(slug: string): Promise<SolutionData | null> {
        const solutions = await this.getSolutions();
        return solutions[slug] || null;
    }

    async updateSolutions(data: Record<string, SolutionData>): Promise<boolean> {
        return this.updateSettings({
            site_solutions: JSON.stringify(data),
        });
    }

    async getBrandPartners(locale: string = 'vi'): Promise<BrandPartnerSetting[]> {
        try {
            const [row] = await db
                .select()
                .from(systemSettings)
                .where(eq(systemSettings.key, 'site_brand_partners'));

            if (row && row.value) {
                const list: BrandPartnerSetting[] = JSON.parse(row.value);
                const isZh = locale === 'zh';
                const isEn = locale === 'en';
                return list.map((p) => ({
                    ...p,
                    shortName: (isZh && p.shortName_zh) ? p.shortName_zh : (isEn && p.shortName_en) ? p.shortName_en : (p.shortName || p.name),
                    sector: (isZh && p.sector_zh) ? p.sector_zh : (isEn && p.sector_en) ? p.sector_en : p.sector,
                    desc: (isZh && p.desc_zh) ? p.desc_zh : (isEn && p.desc_en) ? p.desc_en : p.desc,
                    badge: (isZh && p.badge_zh) ? p.badge_zh : (isEn && p.badge_en) ? p.badge_en : p.badge,
                    discount: (isZh && p.discount_zh) ? p.discount_zh : (isEn && p.discount_en) ? p.discount_en : p.discount,
                }));
            }
            return [];
        } catch (e) {
            console.error('[SiteSettingService] Error getting brand partners:', e);
            return [];
        }
    }

    async updateBrandPartners(partners: BrandPartnerSetting[]): Promise<boolean> {
        return this.updateSettings({
            site_brand_partners: JSON.stringify(partners),
        });
    }
}

export const siteSettingService = new SiteSettingService();
