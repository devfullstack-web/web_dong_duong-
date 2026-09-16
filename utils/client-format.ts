export function formatViDate(value: string | number | Date | null | undefined, locale: string = 'vi'): string {
    if (!value) return '';

    try {
        const d = new Date(value);
        if (locale === 'zh') {
            return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
        }
        if (locale === 'en') {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return d.toLocaleDateString('vi-VN');
    } catch {
        return '';
    }
}

export function formatDateByLocale(value: string | number | Date | null | undefined, locale: string = 'vi'): string {
    return formatViDate(value, locale);
}

export function getYear(value: string | number | Date | null | undefined): string {
    if (!value) return '';

    return String(new Date(value).getFullYear());
}
