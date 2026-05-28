import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { employmentTypeEnum, jobStatusEnum } from './enums';

export const jobPostings = pgTable(
    'job_postings',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        title: varchar('title', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        description: text('description').notNull(),
        requirements: text('requirements'), // Can be HTML or plain text
        benefits: text('benefits'), // Can be HTML or plain text
        location: varchar('location', { length: 255 }),
        employment_type: employmentTypeEnum('employment_type').default('full_time').notNull(),
        salary_range: varchar('salary_range', { length: 100 }), // e.g., "15-25 triệu VND"
        experience_level: varchar('experience_level', { length: 100 }), // e.g., "2-3 năm"
        department: varchar('department', { length: 255 }), // e.g., "Kỹ thuật", "Kinh doanh"
        status: jobStatusEnum('status').default('open').notNull(),
        deadline: timestamp('deadline'),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        deleted_at: timestamp('deleted_at'), // Soft delete
    },
    (table) => [
        index('idx_job_postings_status').on(table.status),
        index('idx_job_postings_employment_type').on(table.employment_type),
        index('idx_job_postings_deadline').on(table.deadline),
        index('idx_job_postings_created_at').on(table.created_at.desc()),
        index('idx_job_postings_deleted_at').on(table.deleted_at),
        index('idx_job_postings_status_deleted').on(table.status, table.deleted_at),
    ],
);
