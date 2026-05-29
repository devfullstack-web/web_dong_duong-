import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schemas';
import { eq, asc, sql, type SQL } from 'drizzle-orm';
import { withHybridAuth, hasPermission, type UserSession } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';
import { checkRateLimit } from '@/utils/rate-limiter';
import { sanitizePlainText } from '@/utils/sanitize';
import {
    CHAT_MESSAGE_SENDER_TYPE,
    type ChatMessageSenderType,
} from '@/constants/content';

const WELCOME_MESSAGE = `Xin chào! Cảm ơn bạn đã liên hệ với Sài Gòn Valve.

Để chúng tôi có thể hỗ trợ bạn tốt nhất, vui lòng cung cấp thông tin sau:

• Họ và tên
• Số điện thoại
• Email
• Nhu cầu cần hỗ trợ

Đội ngũ tư vấn sẽ phản hồi bạn trong thời gian sớm nhất. Xin cảm ơn!`;

function canAccessChat(session: UserSession | null): boolean {
    return (
        !!session?.user &&
        (hasPermission(session.user, PERMISSIONS.CHAT_VIEW) ||
            hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW))
    );
}

async function guestOwnsSession(sessionId: string, guestId: string): Promise<boolean> {
    if (!guestId) return false;

    const session = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, sessionId),
        columns: {
            id: true,
            guest_id: true,
            is_active: true,
        },
    });

    return !!session && session.is_active && session.guest_id === guestId;
}

export const GET = withHybridAuth(async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const guestId = sanitizePlainText(searchParams.get('guestId'), 255);

    if (!sessionId) {
        return apiError('sessionId is required', 400);
    }

    if (!canAccessChat(session) && !(await guestOwnsSession(sessionId, guestId))) {
        return apiError('Forbidden - Invalid chat session owner', 403);
    }

    const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.session_id, sessionId),
        orderBy: [asc(chatMessages.created_at)],
    });

    return apiResponse(messages);
});

export const POST = withHybridAuth(async (req: NextRequest, session) => {
    try {
        const { sessionId, content, isFromWidget, replyToId, guestId } = await req.json();

        if (!sessionId || !content) {
            return apiError('sessionId and content are required', 400);
        }

        // Sanitize content
        const sanitizedContent = sanitizePlainText(content, 5000);
        if (!sanitizedContent) {
            return apiError('Content cannot be empty', 400);
        }

        let senderType: ChatMessageSenderType = CHAT_MESSAGE_SENDER_TYPE.GUEST;
        let senderId: string | null = null;

        if (!isFromWidget && session && canAccessChat(session)) {
            senderType = CHAT_MESSAGE_SENDER_TYPE.ADMIN;
            senderId = session.user.id;
        } else {
            const sanitizedGuestId = sanitizePlainText(guestId, 255);
            if (!(await guestOwnsSession(sessionId, sanitizedGuestId))) {
                return apiError('Forbidden - Invalid chat session owner', 403);
            }

            const ip =
                req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                req.headers.get('x-real-ip') ||
                'unknown';
            const rateLimit = checkRateLimit(
                `chat-message:${ip}:${sanitizedGuestId}`,
                30,
                60 * 1000,
            );
            if (rateLimit.isLimited) return apiError('Too many chat messages', 429);
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

        if (senderType === CHAT_MESSAGE_SENDER_TYPE.GUEST) {
            // Increment unread count for admin
            sessionUpdateData.unread_count = sql`${chatSessions.unread_count} + 1`;
        }

        await db
            .update(chatSessions)
            .set(sessionUpdateData)
            .where(eq(chatSessions.id, sessionId));

        // Auto-reply with welcome message after the first guest message in session
        if (senderType === CHAT_MESSAGE_SENDER_TYPE.GUEST) {
            const guestMsgCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(chatMessages)
                .where(
                    sql`${chatMessages.session_id} = ${sessionId} AND ${chatMessages.sender_type} = ${CHAT_MESSAGE_SENDER_TYPE.GUEST}`,
            );

            if (Number(guestMsgCount[0]?.count) === 1) {
                await db
                    .insert(chatMessages)
                    .values({
                        session_id: sessionId,
                        content: WELCOME_MESSAGE,
                        sender_type: CHAT_MESSAGE_SENDER_TYPE.SYSTEM,
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
