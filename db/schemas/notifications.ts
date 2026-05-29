import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import type { NotificationType } from '@/constants/content';

export const notifications = pgTable(
    'notifications',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        type: varchar('type', { length: 50 }).$type<NotificationType>().notNull(),
        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        link: varchar('link', { length: 255 }),
        is_read: boolean('is_read').default(false).notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_notifications_is_read').on(table.is_read),
        index('idx_notifications_created_at').on(table.created_at.desc()),
        index('idx_notifications_unread_created_at').on(table.is_read, table.created_at.desc()),
    ],
);
