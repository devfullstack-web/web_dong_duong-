import {
    boolean,
    decimal,
    index,
    integer,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import type { LocalizedArray, LocalizedText } from '@/types/i18n';
import { productStatusEnum } from './enums';
import { categories } from './categories';

export const products = pgTable(
    'products',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        name_localized: jsonb('name_localized').$type<LocalizedText>(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        description: text('description').notNull(),
        description_localized: jsonb('description_localized').$type<LocalizedText>(),
        price: decimal('price', { precision: 12, scale: 2 }).notNull().default('0.00'),
        sku: varchar('sku', { length: 100 }).notNull().unique(),
        stock: integer('stock').notNull().default(0),
        category_id: uuid('category_id')
            .references(() => categories.id, { onDelete: 'restrict' })
            .notNull(),
        status: productStatusEnum('status').default('active').notNull(),
        image_url: varchar('image_url', { length: 255 }),

        // New Enhanced Fields
        is_featured: boolean('is_featured').default(false).notNull(),
        tech_specs: jsonb('tech_specs'), // JSON format for flexible specifications
        tech_specs_localized: jsonb('tech_specs_localized'),
        features: jsonb('features'), // Array of highlighting features
        features_localized: jsonb('features_localized').$type<LocalizedArray>(),
        gallery: jsonb('gallery'), // Array of image URLs
        tech_summary: text('tech_summary'),
        tech_summary_localized: jsonb('tech_summary_localized').$type<LocalizedText>(),
        catalog_url: varchar('catalog_url', { length: 255 }),
        warranty: varchar('warranty', { length: 100 }),
        origin: varchar('origin', { length: 255 }),
        availability: varchar('availability', { length: 255 }),
        delivery_info: varchar('delivery_info', { length: 255 }),

        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'), // Soft delete
    },
    (table) => [
        index('idx_products_status').on(table.status),
        index('idx_products_category_id').on(table.category_id),
        index('idx_products_deleted_at').on(table.deleted_at),
        index('idx_products_created_at').on(table.created_at.desc()),
        index('idx_products_is_featured').on(table.is_featured),
        index('idx_products_status_deleted').on(table.status, table.deleted_at),
        index('idx_products_category_status').on(table.category_id, table.status),
        index('idx_products_status_featured').on(table.status, table.is_featured),
    ],
);
