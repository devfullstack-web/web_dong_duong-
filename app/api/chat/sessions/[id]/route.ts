import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { withAuth, withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';

type ChatSessionPatchBody = {
    adminLastSeen?: boolean;
    guestLastSeen?: boolean;
    status?: string;
    guest_name?: string | null;
    guest_email?: string | null;
    guest_phone?: string | null;
};

export const PATCH = withHybridAuth(async (req: NextRequest, session, context) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const body = (await req.json()) as ChatSessionPatchBody;

        const referer = req.headers.get('referer') || '';
        const isPortalRequest = referer.includes('/portal');

        if (isPortalRequest && session?.user) {
            const canUpdateChat =
                hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
                hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW);
            if (!canUpdateChat) {
                return apiError('Forbidden - Required chat permission', 403);
            }
        }

        const updateData: Partial<typeof chatSessions.$inferInsert> = { updated_at: new Date() };

        if (body.adminLastSeen) {
            updateData.admin_last_seen_at = new Date();
            updateData.unread_count = 0;
        }
        if (body.guestLastSeen) {
            updateData.guest_last_seen_at = new Date();
        }
        if (body.status && ['active', 'resolved', 'spam'].includes(body.status)) {
            updateData.status = body.status as 'active' | 'resolved' | 'spam';
        }
        if (body.guest_name !== undefined) updateData.guest_name = body.guest_name;
        if (body.guest_email !== undefined) updateData.guest_email = body.guest_email;
        if (body.guest_phone !== undefined) updateData.guest_phone = body.guest_phone;

        const [updatedSession] = await db
            .update(chatSessions)
            .set(updateData)
            .where(eq(chatSessions.id, id))
            .returning();

        if (!updatedSession) {
            return apiError('Session not found', 404);
        }

        return apiResponse(updatedSession);
    } catch (error) {
        console.error('Update Session Error:', error);
        return apiError('Internal Server Error', 500);
    }
});

export const DELETE = withAuth(async (_req: NextRequest, session, context) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;

        const canDeleteChat =
            hasPermission(session.user, PERMISSIONS.CHAT_DELETE) ||
            hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_DELETE);

        if (!canDeleteChat) {
            return apiError('Forbidden - Required chat delete permission', 403);
        }

        await db.delete(chatSessions).where(eq(chatSessions.id, id));

        return apiResponse({ success: true });
    } catch (error) {
        console.error('Delete Session Error:', error);
        return apiError('Internal Server Error', 500);
    }
});
