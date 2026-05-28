import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schemas';
import { eq, asc, sql, type SQL } from 'drizzle-orm';
import { withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';

const WELCOME_MESSAGE = `Xin chào! Cảm ơn bạn đã liên hệ với Sài Gòn Valve.

Để chúng tôi có thể hỗ trợ bạn tốt nhất, vui lòng cung cấp thông tin sau:

• Họ và tên
• Số điện thoại
• Email
• Nhu cầu cần hỗ trợ

Đội ngũ tư vấn sẽ phản hồi bạn trong thời gian sớm nhất. Xin cảm ơn!`;

export const GET = withHybridAuth(async (req: NextRequest, session) => {
    const referer = req.headers.get('referer') || '';
    const isPortalRequest = referer.includes('/portal');

    if (isPortalRequest && session?.user) {
        const canViewChat =
            hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
            hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW);
        if (!canViewChat) {
            return apiError('Forbidden - Required chat permission', 403);
        }
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return apiError('sessionId is required', 400);
    }

    const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.session_id, sessionId),
        orderBy: [asc(chatMessages.created_at)],
    });

    return apiResponse(messages);
});

export const POST = withHybridAuth(async (req: NextRequest, session) => {
    try {
        const { sessionId, content, isFromWidget, replyToId } = await req.json();

        if (!sessionId || !content) {
            return apiError('sessionId and content are required', 400);
        }

        // Sanitize content
        const sanitizedContent = content.trim().slice(0, 5000);
        if (!sanitizedContent) {
            return apiError('Content cannot be empty', 400);
        }

        let senderType: 'guest' | 'admin' = 'guest';
        let senderId: string | null = null;

        if (!isFromWidget && session?.user) {
            const referer = req.headers.get('referer') || '';
            const isPortalRequest = referer.includes('/portal');

            if (isPortalRequest) {
                const canViewChat =
                    hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
                    hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW);
                if (!canViewChat) {
                    return apiError('Forbidden - Required chat permission', 403);
                }
            }

            senderType = 'admin';
            senderId = session.user.id;
        }

        // Save message
        const [newMessage] = await db
            .insert(chatMessages)
            .values({
                session_id: sessionId,
                content: sanitizedContent,
                sender_type: senderType,
                sender_id: senderId,
                reply_to_id: replyToId || null,
            })
            .returning();

        // Build session update data
        const preview = sanitizedContent.length > 100
            ? sanitizedContent.slice(0, 100) + '...'
            : sanitizedContent;

        const sessionUpdateData: {
            last_message_at: Date;
            last_message_preview: string;
            updated_at: Date;
            unread_count?: SQL;
        } = {
            last_message_at: new Date(),
            last_message_preview: preview,
            updated_at: new Date(),
        };

        if (senderType === 'guest') {
            // Increment unread count for admin
            sessionUpdateData.unread_count = sql`${chatSessions.unread_count} + 1`;
        }

        await db
            .update(chatSessions)
            .set(sessionUpdateData)
            .where(eq(chatSessions.id, sessionId));

        // Auto-reply with welcome message after the first guest message in session
        if (senderType === 'guest') {
            const guestMsgCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(chatMessages)
                .where(
                    sql`${chatMessages.session_id} = ${sessionId} AND ${chatMessages.sender_type} = 'guest'`,
            );

            if (Number(guestMsgCount[0]?.count) === 1) {
                await db
                    .insert(chatMessages)
                    .values({
                        session_id: sessionId,
                        content: WELCOME_MESSAGE,
                        sender_type: 'system',
                        sender_id: null,
                    })
                    .returning();
            }
        }

        return apiResponse(newMessage);
    } catch (error) {
        console.error('Chat Message Error:', error);
        return apiError('Internal Server Error', 500);
    }
});
