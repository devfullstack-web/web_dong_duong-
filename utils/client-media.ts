export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateImageFile(
    file: File,
    maxSizeMb: number,
): { ok: true } | { ok: false; message: string } {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { ok: false, message: 'Định dạng không hợp lệ. Chỉ chấp nhận: JPEG, PNG, WebP, GIF' };
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
        return { ok: false, message: `Kích thước file vượt quá ${maxSizeMb}MB` };
    }

    return { ok: true };
}
