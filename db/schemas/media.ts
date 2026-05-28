import { bigint, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const media = pgTable(
    'media',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        file_name: varchar('file_name', { length: 255 }).notNull(),
        file_url: varchar('file_url', { length: 255 }).notNull(),
        file_type: varchar('file_type', { length: 50 }), // image, document, etc.
        file_size: bigint('file_size', { mode: 'number' }),
        uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_media_file_type').on(table.file_type),
        index('idx_media_uploaded_at').on(table.uploaded_at.desc()),
    ],
);
