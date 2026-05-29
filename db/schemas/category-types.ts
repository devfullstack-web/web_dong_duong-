import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import type { CategoryType } from '@/constants/content';

export const categoryTypes = pgTable('category_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).$type<CategoryType>().notNull().unique(),
});
