import { COMPANY_INFO } from '@/constants/site-info';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;

interface TelegramNotifyParams {
    guestName?: string | null;
    guestPhone?: string | null;
    guestEmail?: string | null;
    firstMessage: string;
    sessionId: string;
    isFollowUp?: boolean;
}

class TelegramService {
    private get enabled(): boolean {
        return !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
    }

    async notifyNewChat({
        guestName,
        guestPhone,
        guestEmail,
        firstMessage,
        sessionId,
        isFollowUp = false,
    }: TelegramNotifyParams): Promise<boolean> {
        if (!this.enabled) {
            console.warn('[Telegram] Bot token or chat ID not configured, skipping notification');
            return false;
        }

        const now = new Date();
        const timeStr = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const adminLink = `${SITE_URL}/vi/portal/cms/chat?session=${sessionId}`;

        const header = isFollowUp
            ? '💬 *KHÁCH HÀNG TIẾP TỤC NHẮN TIN*'
            : '🆕 *KHÁCH HÀNG MỚI NHẮN TIN*';

        const lines = [
            header,
            '',
            `👤 *Tên:* ${guestName || 'Chưa cung cấp'}`,
        ];

        if (guestPhone) lines.push(`📞 *SĐT:* ${guestPhone}`);
        if (guestEmail) lines.push(`📧 *Email:* ${guestEmail}`);

        lines.push(
            '',
            `💬 *Tin nhắn:*`,
            this.escapeMarkdown(firstMessage.length > 200 ? firstMessage.slice(0, 200) + '...' : firstMessage),
            '',
            `🕐 *Thời gian:* ${timeStr}`,
            '',
            `[👉 Trả lời khách hàng](${adminLink})`,
        );

        const text = lines.join('\n');

        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                }),
            });

            if (!res.ok) {
                const body = await res.text();
                console.error('[Telegram] Failed to send:', res.status, body);
                return false;
            }

            console.log('[Telegram] Notification sent for session:', sessionId);
            return true;
        } catch (error) {
            console.error('[Telegram] Error sending notification:', error);
            return false;
        }
    }

    private escapeMarkdown(text: string): string {
        return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    }
}

export const telegramService = new TelegramService();
