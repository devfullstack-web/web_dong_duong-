import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions } from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { chatStreamManager } from '@/services/chat-stream';
import { telegramService } from '@/services/telegram-service';
import { PERMISSIONS } from '@/constants/rbac';
import { apiResponse, apiError } from '@/utils/api-response';

// Telegram notify cooldown: 5 minutes between notifications per session
const TELEGRAM_COOLDOWN_MS = 5 * 60 * 1000;

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

        const sessionUpdateData: Record<string, any> = {
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

        // Broadcast message via socket
        chatStreamManager.broadcastMessage(newMessage);

        // Auto-reply with welcome message after the first guest message in session
        if (senderType === 'guest') {
            const guestMsgCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(chatMessages)
                .where(
                    sql`${chatMessages.session_id} = ${sessionId} AND ${chatMessages.sender_type} = 'guest'`,
                );

            if (Number(guestMsgCount[0]?.count) === 1) {
                // First guest message → send auto welcome reply
                const [welcomeMsg] = await db
                    .insert(chatMessages)
                    .values({
                        session_id: sessionId,
                        content: WELCOME_MESSAGE,
                        sender_type: 'system',
                        sender_id: null,
                    })
                    .returning();

                chatStreamManager.broadcastMessage(welcomeMsg);
            }
        }

        // Update session in admin panel
        if (senderType === 'guest') {
            const sessionData = await db.query.chatSessions.findFirst({
                where: eq(chatSessions.id, sessionId),
            });

            if (sessionData) {
                chatStreamManager.broadcastSessionUpdate(sessionData);

                // Telegram notification logic (CRM-like):
                // 1. First guest message ever → always notify
                // 2. Admin replied since last notify → notify again (new conversation turn)
                // 3. Cooldown expired (5 min) → notify (guest still active)
                const lastNotified = sessionData.telegram_notified_at
                    ? new Date(sessionData.telegram_notified_at).getTime()
                    : 0;
                const cooldownExpired = (Date.now() - lastNotified) > TELEGRAM_COOLDOWN_MS;
                const neverNotified = !sessionData.telegram_notified_at;

                // Check if admin replied since last telegram notification
                let adminRepliedSinceLastNotify = false;
                if (sessionData.telegram_notified_at) {
                    const adminReply = await db
                        .select({ count: sql<number>`count(*)` })
                        .from(chatMessages)
                        .where(
                            sql`${chatMessages.session_id} = ${sessionId}
                                AND ${chatMessages.sender_type} = 'admin'
                                AND ${chatMessages.created_at} > ${sessionData.telegram_notified_at}`,
                        );
                    adminRepliedSinceLastNotify = Number(adminReply[0]?.count) > 0;
                }

                if (neverNotified || cooldownExpired || adminRepliedSinceLastNotify) {
                    telegramService.notifyNewChat({
                        guestName: sessionData.guest_name,
                        guestPhone: sessionData.guest_phone,
                        guestEmail: sessionData.guest_email,
                        firstMessage: sanitizedContent,
                        sessionId,
                        isFollowUp: !neverNotified,
                    });

                    await db
                        .update(chatSessions)
                        .set({ telegram_notified_at: new Date() })
                        .where(eq(chatSessions.id, sessionId));
                }
            }
        }

        return apiResponse(newMessage);
    } catch (error) {
        console.error('Chat Message Error:', error);
        return apiError('Internal Server Error', 500);
    }
});
