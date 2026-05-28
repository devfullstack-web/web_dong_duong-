import { NextRequest } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { UPLOAD } from '@/constants/app';
import { createSafeFilename, validateUploadedFile } from '@/utils/file-upload';

interface UploadedFile {
    filename: string;
    url: string;
    size: number;
    createdAt: Date;
}

// GET /api/upload - List uploaded images with pagination & search
export const GET = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
            const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
            const search = searchParams.get('search')?.toLowerCase() || '';

            const baseDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(baseDir, { recursive: true });

            const getAllFiles = async (dirPath: string): Promise<UploadedFile[]> => {
                const files = await readdir(dirPath);
                let results: UploadedFile[] = [];

                for (const file of files) {
                    const fullPath = path.join(dirPath, file);
                    const fileStat = await stat(fullPath);

                    if (fileStat.isDirectory()) {
                        const nested = await getAllFiles(fullPath);
                        results = results.concat(nested);
                    } else {
                        const relativePublic = path.relative(
                            path.join(process.cwd(), 'public'),
                            fullPath,
                        );
                        const relativeFromUploads = path.relative(
                            path.join(process.cwd(), 'public', 'uploads'),
                            fullPath,
                        );
                        const allowedExtensions = [
                            '.jpg',
                            '.jpeg',
                            '.png',
                            '.webp',
                            '.gif',
                            '.pdf',
                            '.doc',
                            '.docx',
                        ];
                        if (allowedExtensions.some((ext) => file.toLowerCase().endsWith(ext))) {
                            // Normalize path to use forward slashes for URL
                            const normalizedUrlPath = relativePublic.split(path.sep).join('/');
                            results.push({
                                filename: relativeFromUploads.split(path.sep).join('/'),
                                url: `/${normalizedUrlPath}`,
                                size: fileStat.size,
                                createdAt: fileStat.birthtime,
                            });
                        }
                    }
                }
                return results;
            };

            let images = await getAllFiles(baseDir);
            images.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

            // Filter by search term
            if (search) {
                images = images.filter((img) =>
                    img.filename.toLowerCase().includes(search),
                );
            }

            const total = images.length;

            // Paginate
            const startIndex = (page - 1) * limit;
            const paginatedImages = images.slice(startIndex, startIndex + limit);

            return apiResponse(paginatedImages, {
                meta: { total, page, limit },
            });
        } catch (error) {
            console.error('Error listing uploads:', error);
            return apiError('Failed to list uploads', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.MEDIA_VIEW] },
);

export const POST = withAuth(
    async (request: NextRequest) => {
        try {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;

            if (!file) {
                return apiError('No file uploaded', 400);
            }

            const validation = await validateUploadedFile(file, {
                allowedKinds: ['image', 'document'],
                maxSize: UPLOAD.MAX_FILE_SIZE,
            });
            if (!validation.ok) return apiError(validation.error, 400);

            // Determine target directory with date-based organization
            const category = validation.kind === 'document' ? 'documents' : 'images';
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // 01-12
            const day = String(now.getDate()).padStart(2, '0'); // 01-31
            const uploadsDir = path.join(
                process.cwd(),
                'public',
                'uploads',
                category,
                year,
                month,
                day,
            );
            await mkdir(uploadsDir, { recursive: true });

            // Generate unique filename
            const filename = createSafeFilename(validation.extension);
            const filepath = path.join(uploadsDir, filename);

            // Write file to disk
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            // Return public URL
            const publicUrl = `/uploads/${category}/${year}/${month}/${day}/${filename}`;

            return apiResponse({ url: publicUrl, filename }, { status: 201 });
        } catch (error) {
            console.error('--- UPLOAD DEBUG START ---');
            console.error('Error uploading file:', error);
            console.error('Current working directory:', process.cwd());
            console.error('--- UPLOAD DEBUG END ---');
            return apiError('Failed to upload file. Check server logs for details.', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.MEDIA_CREATE] },
);

// DELETE /api/upload - Delete an uploaded file
export const DELETE = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const filename = searchParams.get('filename');

            if (!filename) {
                return apiError('Filename is required', 400);
            }

            const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
            const filepath = path.resolve(uploadsDir, filename.split('/').join(path.sep));
            const relativePath = path.relative(uploadsDir, filepath);

            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
                return apiError('Invalid filename', 400);
            }

            const allowedExtensions = new Set([
                '.jpg',
                '.jpeg',
                '.png',
                '.webp',
                '.gif',
                '.pdf',
                '.doc',
                '.docx',
            ]);
            if (!allowedExtensions.has(path.extname(filepath).toLowerCase())) {
                return apiError('Invalid file type', 400);
            }

            const { unlink } = await import('fs/promises');
            await unlink(filepath);

            return apiResponse({ message: 'File deleted successfully' });
        } catch (error) {
            if ((error as { code?: string }).code === 'ENOENT') {
                return apiError('File not found', 404);
            }
            console.error('Error deleting file:', error);
            return apiError('Failed to delete file', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.MEDIA_DELETE] },
);
