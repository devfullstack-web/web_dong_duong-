import { db } from '@/db';
import { productComments } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { sanitizePlainText } from '@/utils/sanitize';

// GET /api/portal/comments/[id] - Get single comment
export const GET = withAuth(
    async (request, session, context) => {
        try {
            const { id } = await (context as { params: Promise<{ id: string }> }).params;
            const [comment] = await db
                .select()
                .from(productComments)
                .where(eq(productComments.id, id));

            if (!comment) {
                return apiError('Comment not found', 404);
            }

            return apiResponse(comment);
        } catch (error) {
            console.error('Error fetching comment:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.COMMENTS_VIEW] },
);

// PATCH /api/portal/comments/[id] - Update comment (Approve/Reply)
export const PATCH = withAuth(
    async (request, session, context) => {
        try {
            const { id } = await (context as { params: Promise<{ id: string }> }).params;
            const body = await request.json();
            const { is_approved, reply_content } = body;

            const updates: Record<string, unknown> = { updated_at: new Date() };

            if (is_approved !== undefined) {
                updates.is_approved = is_approved;
            }

            if (reply_content !== undefined) {
                updates.reply_content = sanitizePlainText(reply_content, 2000);
                updates.replied_at = new Date();
                updates.replied_by_id = session.user.id;
                // Automatically approve if replying? Usually yes.
                if (updates.reply_content.trim() !== '') {
                    updates.is_approved = true;
                }
            }

            const [updatedComment] = await db
                .update(productComments)
                .set(updates)
                .where(eq(productComments.id, id))
                .returning();

            if (!updatedComment) {
                return apiError('Comment not found', 404);
            }

            return apiResponse(updatedComment);
        } catch (error) {
            console.error('Error updating comment:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.COMMENTS_UPDATE] },
);

export const PUT = PATCH;

// DELETE /api/portal/comments/[id] - Soft delete comment
export const DELETE = withAuth(
    async (request, session, context) => {
        try {
            const { id } = await (context as { params: Promise<{ id: string }> }).params;

            const [deletedComment] = await db
                .update(productComments)
                .set({
                    deleted_at: new Date(),
                    updated_at: new Date(),
                })
                .where(eq(productComments.id, id))
                .returning();

            if (!deletedComment) {
                return apiError('Comment not found', 404);
            }

            return apiResponse({ message: 'Comment deleted successfully' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.COMMENTS_DELETE] },
);
