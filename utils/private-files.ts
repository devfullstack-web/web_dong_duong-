import path from 'path';

const CV_MIME_TYPES: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function assertInside(baseDir: string, filePath: string): string {
    const resolvedBase = path.resolve(baseDir);
    const resolvedFile = path.resolve(filePath);
    const relative = path.relative(resolvedBase, resolvedFile);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error('INVALID_FILE_PATH');
    }

    return resolvedFile;
}

export function resolveCvPath(storedCvPath: string): string {
    const normalized = storedCvPath.replace(/^\/+/, '').split('/').join(path.sep);

    if (normalized.startsWith(`uploads${path.sep}cvs${path.sep}`)) {
        const baseDir = path.resolve(process.cwd(), 'public', 'uploads', 'cvs');
        return assertInside(baseDir, path.resolve(process.cwd(), 'public', normalized));
    }

    if (normalized.startsWith(`cvs${path.sep}`)) {
        const baseDir = path.resolve(process.cwd(), 'storage', 'uploads', 'cvs');
        return assertInside(baseDir, path.resolve(process.cwd(), 'storage', 'uploads', normalized));
    }

    throw new Error('INVALID_FILE_PATH');
}

export function getCvContentType(filePath: string): string {
    return CV_MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}
