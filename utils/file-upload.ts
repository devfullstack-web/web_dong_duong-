export type UploadedFileKind = 'image' | 'document';

const IMAGE_TYPES: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/pjpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/x-png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'image/svg+xml': ['svg'],
    'image/avif': ['avif'],
};

const DOCUMENT_TYPES: Record<string, string[]> = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
};

const EXTENSION_MAP: Record<string, { mimeType: string; kind: UploadedFileKind }> = {
    jpg: { mimeType: 'image/jpeg', kind: 'image' },
    jpeg: { mimeType: 'image/jpeg', kind: 'image' },
    png: { mimeType: 'image/png', kind: 'image' },
    webp: { mimeType: 'image/webp', kind: 'image' },
    gif: { mimeType: 'image/gif', kind: 'image' },
    svg: { mimeType: 'image/svg+xml', kind: 'image' },
    avif: { mimeType: 'image/avif', kind: 'image' },
    pdf: { mimeType: 'application/pdf', kind: 'document' },
    doc: { mimeType: 'application/msword', kind: 'document' },
    docx: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' },
    xls: { mimeType: 'application/vnd.ms-excel', kind: 'document' },
    xlsx: { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: 'document' },
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
    const parts = fileName.split('.');
    if (parts.length < 2) return '';
    const extension = parts.pop()?.toLowerCase() || '';
    return extension.replace(/[^a-z0-9]/g, '');
}

function resolveMimeAndKind(
    rawMimeType: string,
    extension: string,
): { mimeType: string; kind: UploadedFileKind | null } {
    let mime = (rawMimeType || '').toLowerCase().trim();

    // Normalize common aliases
    if (mime === 'image/jpg' || mime === 'image/pjpeg') mime = 'image/jpeg';
    if (mime === 'image/x-png') mime = 'image/png';

    // If mimeType is empty or generic octet-stream, look up by extension
    if (!mime || mime === 'application/octet-stream') {
        if (EXTENSION_MAP[extension]) {
            return {
                mimeType: EXTENSION_MAP[extension].mimeType,
                kind: EXTENSION_MAP[extension].kind,
            };
        }
    }

    if (IMAGE_TYPES[mime]) {
        return { mimeType: mime, kind: 'image' };
    }
    if (DOCUMENT_TYPES[mime]) {
        return { mimeType: mime, kind: 'document' };
    }

    // Fallback: check extension if known
    if (EXTENSION_MAP[extension]) {
        return {
            mimeType: EXTENSION_MAP[extension].mimeType,
            kind: EXTENSION_MAP[extension].kind,
        };
    }

    return { mimeType: mime, kind: null };
}

function extensionAllowedForMime(mimeType: string, extension: string): boolean {
    const allowed = IMAGE_TYPES[mimeType] || DOCUMENT_TYPES[mimeType];
    if (allowed?.includes(extension)) return true;
    if (EXTENSION_MAP[extension]?.mimeType === mimeType) return true;
    return false;
}

function hasSignature(header: Uint8Array, mimeType: string): boolean {
    if (header.length < 2) return false;

    // JPEG SOI (0xFF 0xD8)
    if (mimeType === 'image/jpeg') {
        return header[0] === 0xff && header[1] === 0xd8;
    }

    // PNG (0x89 PNG)
    if (mimeType === 'image/png') {
        return (
            header[0] === 0x89 &&
            header[1] === 0x50 &&
            header[2] === 0x4e &&
            header[3] === 0x47
        );
    }

    // GIF (GIF87a / GIF89a)
    if (mimeType === 'image/gif') {
        if (header.length < 6) return false;
        const signature = String.fromCharCode(...header.slice(0, 6));
        return signature === 'GIF87a' || signature === 'GIF89a';
    }

    // WebP (RIFF .... WEBP)
    if (mimeType === 'image/webp') {
        if (header.length < 12) return false;
        const riff = String.fromCharCode(...header.slice(0, 4));
        const webp = String.fromCharCode(...header.slice(8, 12));
        return riff === 'RIFF' && webp === 'WEBP';
    }

    // SVG: Text XML containing <svg or <?xml
    if (mimeType === 'image/svg+xml') {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(header).toLowerCase();
        return text.includes('<svg') || text.includes('<?xml');
    }

    // AVIF: ISOBMFF ftyp
    if (mimeType === 'image/avif') {
        if (header.length < 12) return false;
        const ftyp = String.fromCharCode(...header.slice(4, 8));
        return ftyp === 'ftyp';
    }

    // PDF (%PDF)
    if (mimeType === 'application/pdf') {
        if (header.length < 4) return false;
        return String.fromCharCode(...header.slice(0, 4)) === '%PDF';
    }

    // DOC (OLE CFB: D0 CF 11 E0)
    if (mimeType === 'application/msword') {
        return (
            header[0] === 0xd0 &&
            header[1] === 0xcf &&
            header[2] === 0x11 &&
            header[3] === 0xe0
        );
    }

    // DOCX / XLSX (Zip archive: PK 0x50 0x4B)
    if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
        return header[0] === 0x50 && header[1] === 0x4b;
    }

    return true;
}

export async function validateUploadedFile(
    file: File,
    options: FileValidationOptions,
): Promise<FileValidationResult> {
    if (!file || file.size <= 0) {
        return { ok: false, error: 'File rỗng hoặc không hợp lệ' };
    }

    if (file.size > options.maxSize) {
        const maxMb = Math.round(options.maxSize / (1024 * 1024));
        return { ok: false, error: `File vượt quá dung lượng cho phép (tối đa ${maxMb}MB)` };
    }

    const extension = extensionFromName(file.name);
    if (!extension) {
        return { ok: false, error: 'File không có phần mở rộng hợp lệ' };
    }

    const { mimeType, kind } = resolveMimeAndKind(file.type, extension);

    if (!kind || !options.allowedKinds.includes(kind)) {
        return { ok: false, error: `Định dạng file không được phép (${file.type || extension})` };
    }

    if (!extensionAllowedForMime(mimeType, extension)) {
        return { ok: false, error: 'Phần mở rộng file không khớp định dạng' };
    }

    try {
        const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
        if (!hasSignature(header, mimeType)) {
            return { ok: false, error: 'Nội dung file không khớp định dạng khai báo' };
        }
    } catch (e) {
        console.warn('Could not read file slice for signature check:', e);
    }

    return { ok: true, kind, extension, mimeType };
}

export function createSafeFilename(extension: string): string {
    const id =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    return `${Date.now()}-${id}.${extension}`;
}
