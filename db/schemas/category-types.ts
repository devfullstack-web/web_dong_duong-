import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const categoryTypes = pgTable('category_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(), // news, product, project
});
