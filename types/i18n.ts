// Supported locales
export type Locale = 'vi' | 'en' | 'zh';
export const DEFAULT_LOCALE: Locale = 'vi';
export const SUPPORTED_LOCALES: Locale[] = ['vi', 'en', 'zh'];

// Generic multilingual text type
export type LocalizedText = {
    vi: string;
    en: string;
    zh?: string;
};

// Partial localized text (for forms where not all languages are required)
export type PartialLocalizedText = Partial<LocalizedText>;

// Multilingual array type (for features, etc.)
export type LocalizedArray = {
    vi: string[];
    en: string[];
    zh?: string[];
};

/**
 * Get localized value with fallback to Vietnamese
 */
export function getLocalizedValue(
    field: LocalizedText | string | null | undefined,
    locale: Locale
): string {
    if (!field) return '';
    if (typeof field === 'string') return field; // Legacy support
    return field[locale] || field[DEFAULT_LOCALE] || '';
}

/**
 * Get localized array with fallback to Vietnamese
 */
export function getLocalizedArray(
    field: LocalizedArray | string[] | null | undefined,
    locale: Locale
): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field; // Legacy support
    return field[locale] || field[DEFAULT_LOCALE] || [];
}

/**
 * Create empty localized text
 */
export function createEmptyLocalizedText(): LocalizedText {
    return { vi: '', en: '', zh: '' };
}

/**
 * Create empty localized array
 */
export function createEmptyLocalizedArray(): LocalizedArray {
    return { vi: [], en: [], zh: [] };
}

/**
 * Check if value is LocalizedText
 */
export function isLocalizedText(value: unknown): value is LocalizedText {
    return (
        typeof value === 'object' &&
        value !== null &&
        'vi' in value &&
        typeof (value as LocalizedText).vi === 'string'
    );
}

/**
 * Convert legacy string to LocalizedText
 */
export function toLocalizedText(
    value: string | LocalizedText | null | undefined
): LocalizedText {
    if (!value) return createEmptyLocalizedText();
    if (typeof value === 'string') return { vi: value, en: '', zh: '' };
    return {
        vi: value.vi || '',
        en: value.en || '',
        zh: value.zh || '',
    };
}

