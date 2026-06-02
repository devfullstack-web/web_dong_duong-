import { index, pgTable, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';

export const permissions = pgTable(
    'permissions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 100 }).notNull().unique(), // e.g. "BLOG:VIEW"
        name: varchar('name', { length: 255 }).notNull(),         // e.g. "Xem tin tức"
        module_code: varchar('module_code', { length: 50 }).notNull(), // Grouping module
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_permissions_code').on(table.code),
        index('idx_permissions_module_code').on(table.module_code),
    ],
);
