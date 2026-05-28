import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable(
    'audit_logs',
    {
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
    },
    (table) => [
        index('idx_audit_logs_user_id').on(table.user_id),
        index('idx_audit_logs_module').on(table.module),
        index('idx_audit_logs_action').on(table.action),
        index('idx_audit_logs_target_id').on(table.target_id),
        index('idx_audit_logs_created_at').on(table.created_at.desc()),
    ],
);
