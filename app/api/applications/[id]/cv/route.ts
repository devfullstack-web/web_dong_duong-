import { readFile, stat } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { jobApplications } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiError } from '@/utils/api-response';
import { getCvContentType, resolveCvPath } from '@/utils/private-files';

export const GET = withAuth(
    async (_request: NextRequest, _session, { params }) => {
        try {
            const { id } = await params;
            const [application] = await db
                .select({
                    full_name: jobApplications.full_name,
                    cv_url: jobApplications.cv_url,
                })
                .from(jobApplications)
                .where(eq(jobApplications.id, id))
                .limit(1);

            if (!application) return apiError('Không tìm thấy hồ sơ ứng tuyển', 404);

            const filePath = resolveCvPath(application.cv_url);
            await stat(filePath);
            const file = await readFile(filePath);
            const safeName = application.full_name
                .replace(/[^\p{L}\p{N}_-]+/gu, '_')
                .replace(/^_+|_+$/g, '')
                .slice(0, 80);
            const filename = `${safeName || 'cv'}${path.extname(filePath).toLowerCase()}`;

            return new Response(new Uint8Array(file), {
                status: 200,
                headers: {
                    'Content-Type': getCvContentType(filePath),
                    'Content-Disposition': `inline; filename="${filename}"`,
                    'Cache-Control': 'private, no-store, max-age=0',
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        } catch (error) {
            if ((error as { code?: string }).code === 'ENOENT') {
                return apiError('Không tìm thấy file CV', 404);
            }
            console.error('Error serving CV:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.APPLICATIONS_VIEW] },
);
