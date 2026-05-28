import { db } from '@/db';
import { media } from '@/db/schemas';
import { desc } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';

// GET /api/media - List media files
export const GET = withAuth(
    async () => {
        try {
            const results = await db.select().from(media).orderBy(desc(media.uploaded_at));
            return apiResponse(results);
        } catch (error) {
            console.error('Error fetching media:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.MEDIA_VIEW] },
);

// POST /api/media - Register a new media file (metadata only)
export const POST = withAuth(
    async (request) => {
        try {
            const body = await request.json();
            const { file_name, file_url, file_type, file_size } = body;

            if (!file_name || !file_url) {
                return apiError('Missing required fields', 400);
            }

            const [newMedia] = await db
                .insert(media)
                .values({
                    file_name,
                    file_url,
                    file_type,
                    file_size,
                })
                .returning();

            return apiResponse(newMedia, { status: 201 });
        } catch (error) {
            console.error('Error creating media record:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.MEDIA_CREATE] },
);
