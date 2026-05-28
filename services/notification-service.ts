import { db } from '@/db';
import { notifications } from '@/db/schemas';
import { Server } from 'socket.io';

export type NotificationType = 'comment' | 'contact' | 'application';

interface CreateNotificationParams {
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
}

class NotificationService {
    private get io(): Server | null {
        return (global as any).notificationIo || null;
    }

    private set io(val: Server | null) {
        (global as any).notificationIo = val;
    }

    setIo(io: Server) {
        this.io = io;
        console.log('[NotificationService] Socket.io instance attached');
    }

    async createNotification({ type, title, content, link }: CreateNotificationParams) {
        try {
            console.log(`[NotificationService] Creating ${type} notification: ${title}`);
            // 1. Save to database
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

            if (this.io) {
                const adminSockets = await this.io.in('admins').fetchSockets();
                console.log(
                    `[NotificationService] Emitting to ${adminSockets.length} admins: ${title}`,
                );

                this.io.to('admins').emit('new-notification', newNotification);
            } else {
                console.warn('[NotificationService] Socket.io not initialized, cannot broadcast');
            }

            return newNotification;
        } catch (error) {
            console.error('[NotificationService] Error creating notification:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();
