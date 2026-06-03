import { pgTable, primaryKey, uuid, timestamp } from 'drizzle-orm/pg-core';
import { roles } from './roles';
import { permissions } from './permissions';

export const role_permissions = pgTable(
    'role_permissions',
    {
        role_id: uuid('role_id')
            .references(() => roles.id, { onDelete: 'cascade' })
            .notNull(),
        permission_id: uuid('permission_id')
            .references(() => permissions.id, { onDelete: 'cascade' })
            .notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.role_id, table.permission_id] }),
    ],
);
