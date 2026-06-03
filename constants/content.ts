export const NEWS_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
} as const;

export const NEWS_STATUS_VALUES = [NEWS_STATUS.DRAFT, NEWS_STATUS.PUBLISHED] as const;
export type NewsStatus = (typeof NEWS_STATUS_VALUES)[number];

export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;

export const PRODUCT_STATUS_VALUES = [PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE] as const;
export type ProductStatus = (typeof PRODUCT_STATUS_VALUES)[number];

export const PROJECT_STATUS = {
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
} as const;

export const PROJECT_STATUS_VALUES = [PROJECT_STATUS.ONGOING, PROJECT_STATUS.COMPLETED] as const;
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];

export const JOB_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
} as const;

export const JOB_STATUS_VALUES = [JOB_STATUS.OPEN, JOB_STATUS.CLOSED] as const;
export type JobStatus = (typeof JOB_STATUS_VALUES)[number];

export const EMPLOYMENT_TYPE = {
    FULL_TIME: 'full_time',
    PART_TIME: 'part_time',
    CONTRACT: 'contract',
    INTERNSHIP: 'internship',
} as const;

export const EMPLOYMENT_TYPE_VALUES = [
    EMPLOYMENT_TYPE.FULL_TIME,
    EMPLOYMENT_TYPE.PART_TIME,
    EMPLOYMENT_TYPE.CONTRACT,
    EMPLOYMENT_TYPE.INTERNSHIP,
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE_VALUES)[number];

export const CONTACT_STATUS = {
    NEW: 'new',
    READ: 'read',
    REPLIED: 'replied',
    ARCHIVED: 'archived',
    PENDING: 'pending',
    PROCESSED: 'processed',
    SPAM: 'spam',
} as const;

export const CONTACT_STATUS_VALUES = [
    CONTACT_STATUS.NEW,
    CONTACT_STATUS.READ,
    CONTACT_STATUS.REPLIED,
    CONTACT_STATUS.ARCHIVED,
    CONTACT_STATUS.PENDING,
    CONTACT_STATUS.PROCESSED,
    CONTACT_STATUS.SPAM,
] as const;
export type ContactStatus = (typeof CONTACT_STATUS_VALUES)[number];

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    INTERVIEWED: 'interviewed',
    REJECTED: 'rejected',
    ACCEPTED: 'accepted',
} as const;

export const APPLICATION_STATUS_VALUES = [
    APPLICATION_STATUS.PENDING,
    APPLICATION_STATUS.REVIEWED,
    APPLICATION_STATUS.INTERVIEWED,
    APPLICATION_STATUS.REJECTED,
    APPLICATION_STATUS.ACCEPTED,
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export const CHAT_SESSION_STATUS = {
    ACTIVE: 'active',
    RESOLVED: 'resolved',
    SPAM: 'spam',
} as const;

export const CHAT_SESSION_STATUS_VALUES = [
    CHAT_SESSION_STATUS.ACTIVE,
    CHAT_SESSION_STATUS.RESOLVED,
    CHAT_SESSION_STATUS.SPAM,
] as const;
export type ChatSessionStatus = (typeof CHAT_SESSION_STATUS_VALUES)[number];

export const CHAT_MESSAGE_SENDER_TYPE = {
    GUEST: 'guest',
    ADMIN: 'admin',
    SYSTEM: 'system',
} as const;

export const CHAT_MESSAGE_SENDER_TYPE_VALUES = [
    CHAT_MESSAGE_SENDER_TYPE.GUEST,
    CHAT_MESSAGE_SENDER_TYPE.ADMIN,
    CHAT_MESSAGE_SENDER_TYPE.SYSTEM,
] as const;
export type ChatMessageSenderType = (typeof CHAT_MESSAGE_SENDER_TYPE_VALUES)[number];

export const CATEGORY_TYPE = {
    NEWS: 'news',
    PRODUCT: 'product',
    PROJECT: 'project',
} as const;

export const CATEGORY_TYPE_VALUES = [
    CATEGORY_TYPE.NEWS,
    CATEGORY_TYPE.PRODUCT,
    CATEGORY_TYPE.PROJECT,
] as const;
export type CategoryType = (typeof CATEGORY_TYPE_VALUES)[number];

export const PRODUCT_COMMENT_STATUS = {
    APPROVED: 'approved',
    PENDING: 'pending',
} as const;

export const PRODUCT_COMMENT_STATUS_VALUES = [
    PRODUCT_COMMENT_STATUS.APPROVED,
    PRODUCT_COMMENT_STATUS.PENDING,
] as const;
export type ProductCommentStatus = (typeof PRODUCT_COMMENT_STATUS_VALUES)[number];

export const FILTER_VALUE = {
    ALL: 'all',
    UNREAD: 'unread',
} as const;

export function isConstantValue<T extends readonly string[]>(
    values: T,
    value: unknown,
): value is T[number] {
    return typeof value === 'string' && values.includes(value);
}
