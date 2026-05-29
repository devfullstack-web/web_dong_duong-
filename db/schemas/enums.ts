import { pgEnum } from 'drizzle-orm/pg-core';
import {
    CHAT_SESSION_STATUS_VALUES,
    EMPLOYMENT_TYPE_VALUES,
    JOB_STATUS_VALUES,
    NEWS_STATUS_VALUES,
    PRODUCT_STATUS_VALUES,
    PROJECT_STATUS_VALUES,
} from '@/constants/content';

export const statusEnum = pgEnum('status', NEWS_STATUS_VALUES);
export const productStatusEnum = pgEnum('product_status', PRODUCT_STATUS_VALUES);
export const projectStatusEnum = pgEnum('project_status', PROJECT_STATUS_VALUES);
export const jobStatusEnum = pgEnum('job_status', JOB_STATUS_VALUES);
export const employmentTypeEnum = pgEnum('employment_type', EMPLOYMENT_TYPE_VALUES);
export const chatSessionStatusEnum = pgEnum('chat_session_status', CHAT_SESSION_STATUS_VALUES);
