import { db } from '@/db';
import { notifications } from '@/db/schemas';

export type NotificationType = 'comment' | 'contact' | 'application';

interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
}

class NotificationService {
    async createNotification({ type, title, content, link }: CreateNotificationParams) {
        try {
            const [newNotification] = await db
                .insert(notifications)
                .values({
                    type,
                    title,
                    content,
                    link: link || null,
                    is_read: false,
                })
                .returning();

            return newNotification;
        } catch (error) {
            console.error('[NotificationService] Error creating notification:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
