import { NextRequest } from 'next/server';
import { withAuth } from '@/middlewares/middleware';
import { apiResponse, apiError } from '@/utils/api-response';
import { PERMISSIONS } from '@/constants/rbac';
import { hasPermission } from '@/middlewares/middleware';

/**
 * GET /api/chat/telegram-test
 * - Without ?send=1: Shows bot info + pending updates (to get your chat ID)
 * - With ?send=1: Sends a test message to the configured TELEGRAM_CHAT_ID
 *
 * Requires admin auth. Only works in development or for superadmin.
 */
export const GET = withAuth(async (req: NextRequest, session) => {
    const canManage =
        hasPermission(session.user, PERMISSIONS.CHAT_MANAGEMENT_VIEW) ||
        session.user.is_super;

    if (!canManage) {
        return apiError('Forbidden', 403);
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const { searchParams } = new URL(req.url);
    const shouldSend = searchParams.get('send') === '1';

    if (!BOT_TOKEN) {
        return apiError('TELEGRAM_BOT_TOKEN is not set in .env', 400);
    }

    try {
        // 1. Get bot info
        const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        const meData = await meRes.json();

        // 2. Get updates (to find chat IDs of users who messaged the bot)
        const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
        const updatesData = await updatesRes.json();

        const chatIds = updatesData.result?.map((u: any) => ({
            chat_id: u.message?.chat?.id,
            username: u.message?.chat?.username,
            first_name: u.message?.chat?.first_name,
            text: u.message?.text,
        })).filter((u: any) => u.chat_id) ?? [];

        let sendResult = null;
        if (shouldSend && CHAT_ID) {
            const sendRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: '✅ Test từ SGV CMS - Bot hoạt động bình thường!',
                }),
            });
            sendResult = await sendRes.json();
        }

        return apiResponse({
            bot: meData.result,
            configured_chat_id: CHAT_ID || '(chưa cấu hình)',
            instructions: chatIds.length === 0
                ? 'Chưa có ai nhắn tin cho bot. Hãy mở Telegram, tìm bot theo username và gửi /start, rồi gọi lại API này.'
                : 'Tìm chat_id của bạn trong danh sách bên dưới và cập nhật vào .env',
            recent_chats: chatIds,
            send_test_result: sendResult,
        });
    } catch (error: any) {
        return apiError(`Telegram API error: ${error.message}`, 500);
    }
});
