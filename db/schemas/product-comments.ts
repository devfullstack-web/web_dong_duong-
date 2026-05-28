import { boolean, index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { products } from './products';
import { users } from './users';

export const productComments = pgTable(
    'product_comments',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        product_id: uuid('product_id')
            .references(() => products.id, { onDelete: 'cascade' })
            .notNull(),
        guest_name: varchar('guest_name', { length: 255 }).notNull(),
        guest_email: varchar('guest_email', { length: 255 }).notNull(),
        content: text('content').notNull(),
        reply_content: text('reply_content'),
        replied_at: timestamp('replied_at'),
        replied_by_id: uuid('replied_by_id').references(() => users.id, { onDelete: 'set null' }),
        is_approved: boolean('is_approved').default(false).notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'),
    },
    (table) => [
        index('idx_product_comments_product_id').on(table.product_id),
        index('idx_product_comments_replied_by_id').on(table.replied_by_id),
        index('idx_product_comments_is_approved').on(table.is_approved),
        index('idx_product_comments_created_at').on(table.created_at.desc()),
        index('idx_product_comments_deleted_at').on(table.deleted_at),
        index('idx_product_comments_product_approved_created_at').on(
            table.product_id,
            table.is_approved,
            table.created_at.desc(),
        ),
    ],
);
