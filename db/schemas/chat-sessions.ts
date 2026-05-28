import { boolean, index, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { chatSessionStatusEnum } from './enums';

export const chatSessions = pgTable(
    'chat_sessions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        guest_id: varchar('guest_id', { length: 255 }).notNull(),
        guest_name: varchar('guest_name', { length: 255 }),
        guest_email: varchar('guest_email', { length: 255 }),
        guest_phone: varchar('guest_phone', { length: 50 }),
        status: chatSessionStatusEnum('status').default('active').notNull(),
        last_message_at: timestamp('last_message_at').defaultNow().notNull(),
        last_message_preview: text('last_message_preview'),
        unread_count: integer('unread_count').default(0).notNull(),
        admin_last_seen_at: timestamp('admin_last_seen_at'),
        guest_last_seen_at: timestamp('guest_last_seen_at'),
        telegram_notified_at: timestamp('telegram_notified_at'),
        is_active: boolean('is_active').default(true).notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_chat_sessions_guest_id').on(table.guest_id),
        index('idx_chat_sessions_guest_active').on(table.guest_id, table.is_active),
        index('idx_chat_sessions_status').on(table.status),
        index('idx_chat_sessions_last_message_at').on(table.last_message_at.desc()),
        index('idx_chat_sessions_created_at').on(table.created_at.desc()),
    ],
);
