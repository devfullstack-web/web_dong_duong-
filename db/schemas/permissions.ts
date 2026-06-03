import { index, pgTable, timestamp, varchar, uuid, text } from 'drizzle-orm/pg-core';

export const permissions = pgTable(
    'permissions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 100 }).notNull().unique(), // e.g. "dashboard.view"
        name: varchar('name', { length: 255 }).notNull(),         // e.g. "Xem Dashboard"
        module: varchar('module', { length: 50 }).notNull(),       // e.g. "dashboard"
        action: varchar('action', { length: 50 }).notNull(),       // e.g. "view"
        description: text('description'),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_permissions_code').on(table.code),
        index('idx_permissions_module').on(table.module),
    ],
);
