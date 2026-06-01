import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { statusEnum } from './enums';
import { authors } from './authors';
import { categories } from './categories';
import { NEWS_STATUS } from '@/constants/content';
import type { LocalizedText } from '@/types/i18n';

export const newsArticles = pgTable(
    'news_articles',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        title: varchar('title', { length: 255 }).notNull(),
        title_localized: jsonb('title_localized').$type<LocalizedText>(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        summary: text('summary').notNull(),
        summary_localized: jsonb('summary_localized').$type<LocalizedText>(),
        content: text('content').notNull(),
        content_localized: jsonb('content_localized').$type<LocalizedText>(),
        category_id: uuid('category_id')
            .references(() => categories.id, { onDelete: 'restrict' })
            .notNull(),
        author_id: uuid('author_id').references(() => authors.id, { onDelete: 'set null' }),
        status: statusEnum('status').default(NEWS_STATUS.DRAFT).notNull(),
        image_url: varchar('image_url', { length: 255 }),
        gallery: jsonb('gallery'), // Array of image URLs
        published_at: timestamp('published_at'),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'), // Soft delete
    },
    (table) => [
        index('idx_news_articles_status').on(table.status),
        index('idx_news_articles_category_id').on(table.category_id),
        index('idx_news_articles_author_id').on(table.author_id),
        index('idx_news_articles_deleted_at').on(table.deleted_at),
        index('idx_news_articles_created_at').on(table.created_at.desc()),
        index('idx_news_articles_published_at').on(table.published_at.desc()),
        index('idx_news_articles_status_deleted').on(table.status, table.deleted_at),
        index('idx_news_articles_status_published').on(table.status, table.published_at.desc()),
    ],
);
