import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { jobPostings } from './job-postings';
import { APPLICATION_STATUS, type ApplicationStatus } from '@/constants/content';

export const jobApplications = pgTable(
    'job_applications',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        job_id: uuid('job_id')
            .references(() => jobPostings.id, { onDelete: 'cascade' })
            .notNull(),
        full_name: varchar('full_name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        phone: varchar('phone', { length: 50 }).notNull(),
        cv_url: text('cv_url').notNull(), // URL to uploaded CV file
        cover_letter: text('cover_letter'),
        status: varchar('status', { length: 50 })
            .$type<ApplicationStatus>()
            .default(APPLICATION_STATUS.PENDING)
            .notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_job_applications_job_id').on(table.job_id),
        index('idx_job_applications_status').on(table.status),
        index('idx_job_applications_email').on(table.email),
        index('idx_job_applications_created_at').on(table.created_at.desc()),
    ],
);
