import { pgEnum } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['draft', 'published']);
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive']);
export const projectStatusEnum = pgEnum('project_status', ['ongoing', 'completed']);
export const jobStatusEnum = pgEnum('job_status', ['open', 'closed']);
export const employmentTypeEnum = pgEnum('employment_type', [
    'full_time',
    'part_time',
    'contract',
    'internship',
]);
export const chatSessionStatusEnum = pgEnum('chat_session_status', ['active', 'resolved', 'spam']);
