import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const systemSettings = pgTable('system_settings', {
    key: varchar('key', { length: 255 }).primaryKey(),
    value: text('value').notNull(),
    description: text('description'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});
