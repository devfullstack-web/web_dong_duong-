import { NextRequest } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schemas';
import { desc, eq, sql } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';

// GET /api/portal/notifications - List notifications
export const GET = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);

            const { page, limit } = parsePaginationParams(searchParams, {
                limit: 20,
            });
            const offset = calculateOffset(page, limit);

            // Count total unread
            const [{ count: unreadCount }] = await db
                .select({ count: sql<number>`count(*)` })
                .from(notifications)
                .where(eq(notifications.is_read, false));

            // Fetch notifications
            const results = await db
                .select()
                .from(notifications)
                .orderBy(desc(notifications.created_at))
                .limit(limit)
                .offset(offset);

            return apiResponse(results, {
                meta: {
                    ...createPaginationMeta(page, limit, results.length), // Simplified meta
                    unreadCount,
                },
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [] },
);

// PATCH /api/portal/notifications - Mark as read
export const PATCH = withAuth(
    async (request: NextRequest) => {
        try {
            const body = await request.json();
            const { id, all } = body;

            if (all) {
                await db
                    .update(notifications)
                    .set({ is_read: true })
                    .where(eq(notifications.is_read, false));
                return apiResponse({ message: 'All notifications marked as read' });
            }

            if (!id) {
                return apiError('Notification ID is required', 400);
            }

            await db.update(notifications).set({ is_read: true }).where(eq(notifications.id, id));

            return apiResponse({ message: 'Notification marked as read' });
        } catch (error) {
            console.error('Error updating notification:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [] },
);
