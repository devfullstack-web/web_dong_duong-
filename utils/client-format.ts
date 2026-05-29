export function formatViDate(value: string | number | Date | null | undefined): string {
    if (!value) return '';

    return new Date(value).toLocaleDateString('vi-VN');
}

export function getYear(value: string | number | Date | null | undefined): string {
    if (!value) return '';

    return String(new Date(value).getFullYear());
}
