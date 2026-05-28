import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const modules = pgTable(
    'modules',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        code: varchar('code', { length: 50 }).notNull().unique(),
        name: varchar('name', { length: 255 }).notNull(),
        icon: varchar('icon', { length: 100 }), // Lucide icon name
        route: varchar('route', { length: 255 }), // Portal route path
        order: integer('order').default(0).notNull(), // Display order in sidebar
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'),
    },
    (table) => [
        index('idx_modules_order').on(table.order),
        index('idx_modules_created_at').on(table.created_at.desc()),
        index('idx_modules_deleted_at').on(table.deleted_at),
    ],
);
