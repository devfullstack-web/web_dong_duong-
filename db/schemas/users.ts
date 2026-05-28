import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        username: varchar('username', { length: 255 }).notNull().unique(),
        email: varchar('email', { length: 255 }).unique(),
        password: text('password').notNull(),
        full_name: varchar('full_name', { length: 255 }),
        phone: varchar('phone', { length: 20 }),
        is_active: boolean('is_active').default(true).notNull(),
        is_locked: boolean('is_locked').default(false).notNull(),
        is_super: boolean('is_super').default(false).notNull(),
        avatar_url: varchar('avatar_url', { length: 255 }),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'),
    },
    (table) => [
        index('idx_users_is_active').on(table.is_active),
        index('idx_users_created_at').on(table.created_at.desc()),
        index('idx_users_deleted_at').on(table.deleted_at),
    ],
);
