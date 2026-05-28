import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }),
});
