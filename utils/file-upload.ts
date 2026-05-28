export type UploadedFileKind = 'image' | 'document';

const IMAGE_TYPES: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
};

const DOCUMENT_TYPES: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
};

type FileValidationOptions = {
    allowedKinds: UploadedFileKind[];
    maxSize: number;
};

type FileValidationResult =
    | {
          ok: true;
          kind: UploadedFileKind;
          extension: string;
          mimeType: string;
      }
    | {
          ok: false;
          error: string;
      };

function extensionFromName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension.replace(/[^a-z0-9]/g, '');
}

function extensionAllowedForMime(mimeType: string, extension: string): boolean {
    const allowed = IMAGE_TYPES[mimeType] || DOCUMENT_TYPES[mimeType];
    return !!allowed?.includes(extension);
}

function kindFromMime(mimeType: string): UploadedFileKind | null {
    if (IMAGE_TYPES[mimeType]) return 'image';
    if (DOCUMENT_TYPES[mimeType]) return 'document';
    return null;
}

function hasSignature(header: Uint8Array, mimeType: string): boolean {
    if (mimeType === 'image/jpeg') {
        return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    }

    if (mimeType === 'image/png') {
        return (
            header[0] === 0x89 &&
            header[1] === 0x50 &&
            header[2] === 0x4e &&
            header[3] === 0x47 &&
            header[4] === 0x0d &&
            header[5] === 0x0a &&
            header[6] === 0x1a &&
            header[7] === 0x0a
        );
    }

    if (mimeType === 'image/gif') {
        const signature = String.fromCharCode(...header.slice(0, 6));
        return signature === 'GIF87a' || signature === 'GIF89a';
    }

    if (mimeType === 'image/webp') {
        const riff = String.fromCharCode(...header.slice(0, 4));
        const webp = String.fromCharCode(...header.slice(8, 12));
        return riff === 'RIFF' && webp === 'WEBP';
    }

    if (mimeType === 'application/pdf') {
        return String.fromCharCode(...header.slice(0, 4)) === '%PDF';
    }

    if (mimeType === 'application/msword') {
        return (
            header[0] === 0xd0 &&
            header[1] === 0xcf &&
            header[2] === 0x11 &&
            header[3] === 0xe0 &&
            header[4] === 0xa1 &&
            header[5] === 0xb1 &&
            header[6] === 0x1a &&
            header[7] === 0xe1
        );
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return header[0] === 0x50 && header[1] === 0x4b;
    }

    return false;
}

export async function validateUploadedFile(
    file: File,
    options: FileValidationOptions,
): Promise<FileValidationResult> {
    if (file.size <= 0) {
        return { ok: false, error: 'File rỗng hoặc không hợp lệ' };
    }

    if (file.size > options.maxSize) {
        return { ok: false, error: 'File vượt quá dung lượng cho phép' };
    }

    const mimeType = file.type.toLowerCase();
    const extension = extensionFromName(file.name);
    const kind = kindFromMime(mimeType);

    if (!kind || !options.allowedKinds.includes(kind)) {
        return { ok: false, error: 'Định dạng file không được phép' };
    }

    if (!extensionAllowedForMime(mimeType, extension)) {
        return { ok: false, error: 'Phần mở rộng file không khớp định dạng' };
    }

    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!hasSignature(header, mimeType)) {
        return { ok: false, error: 'Nội dung file không khớp định dạng khai báo' };
    }

    return { ok: true, kind, extension, mimeType };
}

export function createSafeFilename(extension: string): string {
    const id =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return `${Date.now()}-${id}.${extension}`;
}
