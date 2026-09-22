export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif';

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/x-png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
];

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(
    file: File,
    maxSizeMb: number = 25,
): { ok: true } | { ok: false; message: string } {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const typeMatches = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
    const extMatches = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (!typeMatches && !extMatches) {
        return { ok: false, message: 'Định dạng không hợp lệ. Chỉ chấp nhận: JPG, JPEG, PNG, WebP, GIF, SVG, AVIF' };
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
        return { ok: false, message: `Kích thước file vượt quá ${maxSizeMb}MB` };
    }

    return { ok: true };
}
