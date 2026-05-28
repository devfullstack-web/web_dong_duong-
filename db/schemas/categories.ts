import { boolean, index, integer, jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import type { LocalizedText } from '@/types/i18n';
import { categoryTypes } from './category-types';

export const categories = pgTable(
    'categories',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        name_localized: jsonb('name_localized').$type<LocalizedText>(),
        category_type_id: uuid('category_type_id')
            .references(() => categoryTypes.id, { onDelete: 'restrict' })
            .notNull(),
        parent_id: uuid('parent_id'),
        display_order: integer('display_order').default(0).notNull(),
        is_visible: boolean('is_visible').default(true).notNull(),
    },
    (table) => [
        index('idx_categories_type_id').on(table.category_type_id),
        index('idx_categories_parent_id').on(table.parent_id),
        index('idx_categories_display_order').on(table.display_order),
        index('idx_categories_type_parent').on(table.category_type_id, table.parent_id),
        index('idx_categories_is_visible').on(table.is_visible),
    ],
);
