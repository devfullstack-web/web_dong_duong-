import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { chatSessions } from './chat-sessions';
import type { ChatMessageSenderType } from '@/constants/content';

export const chatMessages = pgTable(
    'chat_messages',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        session_id: uuid('session_id')
            .references(() => chatSessions.id, { onDelete: 'cascade' })
            .notNull(),
        sender_type: varchar('sender_type', { length: 20 }).$type<ChatMessageSenderType>().notNull(),
        sender_id: uuid('sender_id'),
        content: text('content').notNull(),
        reply_to_id: uuid('reply_to_id'),
        is_deleted: boolean('is_deleted').default(false).notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_chat_messages_session_id').on(table.session_id),
        index('idx_chat_messages_session_created_at').on(table.session_id, table.created_at),
        index('idx_chat_messages_reply_to_id').on(table.reply_to_id),
        index('idx_chat_messages_created_at').on(table.created_at.desc()),
    ],
);
