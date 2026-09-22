import { NextRequest, NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain; charset=utf-8',
    '.csv': 'text/csv; charset=utf-8',
    // Videos
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mov': 'video/quicktime',
};

function resolveUploadFilePath(pathSegments: string[]): string | null {
    // Prevent directory traversal attacks
    for (const seg of pathSegments) {
        if (seg === '..' || seg.includes('/') || seg.includes('\\')) {
            return null;
        }
    }

    const candidateRoots = [
        path.resolve(process.cwd(), 'public', 'uploads'),
        path.resolve('/app', 'public', 'uploads'),
        path.resolve(process.cwd(), '.next', 'standalone', 'public', 'uploads'),
    ];

    for (const root of candidateRoots) {
        const resolved = path.resolve(root, ...pathSegments);
        if (resolved.startsWith(root)) {
            return resolved;
        }
    }

    return null;
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
) {
    try {
        const { path: pathSegments } = await context.params;
        if (!pathSegments || pathSegments.length === 0) {
            return new NextResponse('File not found', { status: 404 });
        }

        const candidateRoots = [
            path.resolve(process.cwd(), 'public', 'uploads'),
            path.resolve('/app', 'public', 'uploads'),
            path.resolve(process.cwd(), '.next', 'standalone', 'public', 'uploads'),
        ];

        let targetFilePath: string | null = null;
        let fileStat = null;

        for (const root of candidateRoots) {
            // Safety check against traversal
            const resolved = path.resolve(root, ...pathSegments);
            if (!resolved.startsWith(root)) continue;

            try {
                const s = await stat(resolved);
                if (s.isFile()) {
                    targetFilePath = resolved;
                    fileStat = s;
                    break;
                }
            } catch {
                // Not found in this candidate root, try next
            }
        }

        if (!targetFilePath || !fileStat) {
            return new NextResponse('File not found', { status: 404 });
        }

        const ext = path.extname(targetFilePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // HTTP Caching & ETag validation
        const etag = `"${fileStat.size}-${fileStat.mtime.getTime()}"`;
        const ifNoneMatch = request.headers.get('if-none-match');
        if (ifNoneMatch === etag) {
            return new NextResponse(null, { status: 304 });
        }

        // Stream file directly to client
        const nodeStream = createReadStream(targetFilePath);
        const webStream = Readable.toWeb(nodeStream) as ReadableStream;

        return new NextResponse(webStream, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileStat.size.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'ETag': etag,
                'Last-Modified': fileStat.mtime.toUTCString(),
            },
        });
    } catch (error) {
        console.error('Error serving runtime upload asset:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
