import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schemas';
import { desc, eq, sql, gt, and, ne } from 'drizzle-orm';
import { withAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';

export const GET = withAuth(async (req: NextRequest, session) => {
    const canViewChat =
        hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
        hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW);

    if (!canViewChat) {
        return apiError('Forbidden - Required chat permission', 403);
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // 'active' | 'resolved' | 'spam' | null (all)
        const search = searchParams.get('search');

        // Only get sessions that have at least one guest message (not system-only)
        const conditions = [
            sql`EXISTS (
                SELECT 1 FROM chat_messages cm 
                WHERE cm.session_id = chat_sessions.id 
                AND cm.sender_type = 'guest'
            )`,
        ];

        if (status) {
            conditions.push(eq(chatSessions.status, status as 'active' | 'resolved' | 'spam'));
        }

        if (search) {
            const searchLower = `%${search.toLowerCase()}%`;
            conditions.push(
                sql`(
                    LOWER(${chatSessions.guest_name}) LIKE ${searchLower}
                    OR LOWER(${chatSessions.guest_email}) LIKE ${searchLower}
                    OR ${chatSessions.guest_phone} LIKE ${searchLower}
                    OR LOWER(${chatSessions.guest_id}) LIKE ${searchLower}
                )`,
            );
        }

        const sessions = await db
            .select()
            .from(chatSessions)
            .where(and(...conditions))
            .orderBy(desc(chatSessions.last_message_at));

        return apiResponse(sessions);
    } catch (error) {
        console.error('Chat Sessions Admin Error:', error);
        return apiError('Internal Server Error', 500);
    }
});
