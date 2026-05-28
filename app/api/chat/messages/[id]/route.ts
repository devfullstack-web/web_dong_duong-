import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatMessages } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { withAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';

export const DELETE = withAuth(async (_req: NextRequest, session, context) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;

        const canManageChat =
            hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
            hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW);

        if (!canManageChat) {
            return apiError('Forbidden - Required chat permission', 403);
        }

        const [updatedMessage] = await db
            .update(chatMessages)
            .set({ is_deleted: true, content: 'Tin nhắn đã được gỡ' })
            .where(eq(chatMessages.id, id))
            .returning();

        if (!updatedMessage) {
            return apiError('Message not found', 404);
        }

        return apiResponse(updatedMessage);
    } catch (error) {
        console.error('Delete Message Error:', error);
        return apiError('Internal Server Error', 500);
    }
});
