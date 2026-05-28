import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roles = pgTable(
    'roles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 50 }).notNull().unique(),
        name: varchar('name', { length: 255 }).notNull(),
        description: text('description'),
        is_super: boolean('is_super').default(false).notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'),
    },
    (table) => [
        index('idx_roles_created_at').on(table.created_at.desc()),
        index('idx_roles_deleted_at').on(table.deleted_at),
    ],
);
