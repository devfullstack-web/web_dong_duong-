import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const contacts = pgTable(
    'contacts',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        phone: varchar('phone', { length: 20 }),
        address: text('address'),
        subject: varchar('subject', { length: 255 }),
        message: text('message').notNull(),
        status: varchar('status', { length: 50 }).default('new').notNull(), // new, read, replied, archived
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_contacts_status').on(table.status),
        index('idx_contacts_created_at').on(table.created_at.desc()),
        index('idx_contacts_email').on(table.email),
    ],
);
