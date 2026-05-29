import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { projectStatusEnum } from './enums';
import { categories } from './categories';
import { PROJECT_STATUS } from '@/constants/content';

export const projects = pgTable(
    'projects',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        description: text('description').notNull(),
        client_name: varchar('client_name', { length: 255 }),
        start_date: timestamp('start_date'),
        end_date: timestamp('end_date'),
        category_id: uuid('category_id')
            .references(() => categories.id, { onDelete: 'restrict' })
            .notNull(),
        status: projectStatusEnum('status').default(PROJECT_STATUS.ONGOING).notNull(),
        image_url: varchar('image_url', { length: 255 }),
        gallery: jsonb('gallery'), // Array of image URLs
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'), // Soft delete
    },
    (table) => [
        index('idx_projects_status').on(table.status),
        index('idx_projects_category_id').on(table.category_id),
        index('idx_projects_deleted_at').on(table.deleted_at),
        index('idx_projects_created_at').on(table.created_at.desc()),
        index('idx_projects_status_deleted').on(table.status, table.deleted_at),
    ],
);
