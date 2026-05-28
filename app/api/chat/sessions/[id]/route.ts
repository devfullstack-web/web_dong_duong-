import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { withAuth, withHybridAuth, hasPermission, type UserSession } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';
import { sanitizePlainText } from '@/utils/sanitize';

type ChatSessionPatchBody = {
    adminLastSeen?: boolean;
    guestLastSeen?: boolean;
    status?: string;
    guest_name?: string | null;
    guest_email?: string | null;
    guest_phone?: string | null;
    guestId?: string;
};

function canAccessChat(session: UserSession | null): boolean {
    return (
        !!session?.user &&
        (hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
            hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW))
    );
}

export const PATCH = withHybridAuth(async (req: NextRequest, session, context) => {
    try {
        const { id } = await (context as { params: Promise<{ id: string }> }).params;
        const body = (await req.json()) as ChatSessionPatchBody;

        const isChatAdmin = canAccessChat(session);
        if (!isChatAdmin) {
            const guestId = sanitizePlainText(body.guestId, 255);
            const existingSession = await db.query.chatSessions.findFirst({
                where: eq(chatSessions.id, id),
                columns: {
                    guest_id: true,
                    is_active: true,
                },
            });

            if (!existingSession || !existingSession.is_active || existingSession.guest_id !== guestId) {
                return apiError('Forbidden - Invalid chat session owner', 403);
            }
        }

        const updateData: Partial<typeof chatSessions.$inferInsert> = { updated_at: new Date() };

        if (isChatAdmin && body.adminLastSeen) {
            updateData.admin_last_seen_at = new Date();
            updateData.unread_count = 0;
        }
        if (body.guestLastSeen) {
            updateData.guest_last_seen_at = new Date();
        }
        if (isChatAdmin && body.status && ['active', 'resolved', 'spam'].includes(body.status)) {
            updateData.status = body.status as 'active' | 'resolved' | 'spam';
        }
        if (body.guest_name !== undefined) updateData.guest_name = sanitizePlainText(body.guest_name, 255);
        if (body.guest_email !== undefined) updateData.guest_email = sanitizePlainText(body.guest_email, 255);
        if (body.guest_phone !== undefined) updateData.guest_phone = sanitizePlainText(body.guest_phone, 50);

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
