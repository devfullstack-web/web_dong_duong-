import { sql } from 'drizzle-orm';
import {
    pgTable,
    varchar,
    text,
    timestamp,
    decimal,
    integer,
    pgEnum,
    bigint,
    uuid,
    boolean,
    jsonb,
} from 'drizzle-orm/pg-core';
import type { LocalizedText, LocalizedArray } from '@/types/i18n';

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

export const categoryTypes = pgTable('category_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(), // news, product, project
});

export const categories = pgTable('categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    name_localized: jsonb('name_localized').$type<LocalizedText>(),
    category_type_id: uuid('category_type_id')
        .references(() => categoryTypes.id, { onDelete: 'restrict' })
        .notNull(),
    parent_id: uuid('parent_id'),
    display_order: integer('display_order').default(0).notNull(),
    is_visible: boolean('is_visible').default(true).notNull(),
});

export const authors = pgTable('authors', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }),
});

export const newsArticles = pgTable('news_articles', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    category_id: uuid('category_id')
        .references(() => categories.id, { onDelete: 'restrict' })
        .notNull(),
    author_id: uuid('author_id').references(() => authors.id, { onDelete: 'set null' }),
    status: statusEnum('status').default('draft').notNull(),
    image_url: varchar('image_url', { length: 255 }),
    gallery: jsonb('gallery'), // Array of image URLs
    published_at: timestamp('published_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'), // Soft delete
});

export const products = pgTable('products', {
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
});

export const projects = pgTable('projects', {
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
    status: projectStatusEnum('status').default('ongoing').notNull(),
    image_url: varchar('image_url', { length: 255 }),
    gallery: jsonb('gallery'), // Array of image URLs
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'), // Soft delete
});

export const media = pgTable('media', {
    id: uuid('id').primaryKey().defaultRandom(),
    file_name: varchar('file_name', { length: 255 }).notNull(),
    file_url: varchar('file_url', { length: 255 }).notNull(),
    file_type: varchar('file_type', { length: 50 }), // image, document, etc.
    file_size: bigint('file_size', { mode: 'number' }),
    uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).unique(),
    password: text('password').notNull(),
    full_name: varchar('full_name', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    is_active: boolean('is_active').default(true).notNull(),
    is_locked: boolean('is_locked').default(false).notNull(),
    is_super: boolean('is_super').default(false).notNull(),
    avatar_url: varchar('avatar_url', { length: 255 }),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

export const contacts = pgTable('contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    subject: varchar('subject', { length: 255 }),
    message: text('message').notNull(),
    status: varchar('status', { length: 50 }).default('new').notNull(), // new, read, replied, archived
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Job Postings for Recruitment
export const jobPostings = pgTable('job_postings', {
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
});

// Job Applications for Candidates
export const jobApplications = pgTable('job_applications', {
    id: uuid('id').primaryKey().defaultRandom(),
    job_id: uuid('job_id')
        .references(() => jobPostings.id, { onDelete: 'cascade' })
        .notNull(),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    cv_url: text('cv_url').notNull(), // URL to uploaded CV file
    cover_letter: text('cover_letter'),
    status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, reviewed, interviewed, rejected, accepted
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// RBAC System Tables
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    is_super: boolean('is_super').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

export const modules = pgTable('modules', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 100 }), // Lucide icon name
    route: varchar('route', { length: 255 }), // Portal route path
    order: integer('order').default(0).notNull(), // Display order in sidebar
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

export const permissions = pgTable('permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    role_id: uuid('role_id')
        .references(() => roles.id, { onDelete: 'cascade' })
        .notNull(),
    module_id: uuid('module_id')
        .references(() => modules.id, { onDelete: 'cascade' })
        .notNull(),
    can_view: boolean('can_view').default(false).notNull(),
    can_create: boolean('can_create').default(false).notNull(),
    can_update: boolean('can_update').default(false).notNull(),
    can_delete: boolean('can_delete').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deleted_at: timestamp('deleted_at'),
});

export const user_roles = pgTable(
    'user_roles',
    {
        user_id: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        role_id: uuid('role_id')
            .references(() => roles.id, { onDelete: 'cascade' })
            .notNull(),
    },
    (table) => ({
        pk: sql`PRIMARY KEY (${table.user_id}, ${table.role_id})`,
    }),
);

// Product Comments & Questions
export const productComments = pgTable('product_comments', {
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
});

// Real-time Chat System
export const chatSessionStatusEnum = pgEnum('chat_session_status', ['active', 'resolved', 'spam']);

export const chatSessions = pgTable('chat_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    guest_id: varchar('guest_id', { length: 255 }).notNull(),
    guest_name: varchar('guest_name', { length: 255 }),
    guest_email: varchar('guest_email', { length: 255 }),
    guest_phone: varchar('guest_phone', { length: 50 }),
    status: chatSessionStatusEnum('status').default('active').notNull(),
    last_message_at: timestamp('last_message_at').defaultNow().notNull(),
    last_message_preview: text('last_message_preview'),
    unread_count: integer('unread_count').default(0).notNull(),
    admin_last_seen_at: timestamp('admin_last_seen_at'),
    guest_last_seen_at: timestamp('guest_last_seen_at'),
    telegram_notified_at: timestamp('telegram_notified_at'),
    is_active: boolean('is_active').default(true).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    session_id: uuid('session_id')
        .references(() => chatSessions.id, { onDelete: 'cascade' })
        .notNull(),
    sender_type: varchar('sender_type', { length: 20 }).notNull(), // 'guest', 'admin', or 'system'
    sender_id: uuid('sender_id'),
    content: text('content').notNull(),
    reply_to_id: uuid('reply_to_id'),
    is_deleted: boolean('is_deleted').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Admin Notification System
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 50 }).notNull(), // 'comment', 'contact', 'application'
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    link: varchar('link', { length: 255 }),
    is_read: boolean('is_read').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});

// Audit Logs System
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 50 }).notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc.
    module: varchar('module', { length: 50 }).notNull(), // 'USERS', 'ROLES', 'NEWS', etc.
    target_id: varchar('target_id', { length: 255 }), // ID of the affected record
    description: text('description'),
    changes: jsonb('changes'), // { old: {}, new: {} }
    ip_address: varchar('ip_address', { length: 50 }),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
