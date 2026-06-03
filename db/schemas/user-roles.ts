import { pgTable, primaryKey, uuid, timestamp } from 'drizzle-orm/pg-core';
import { roles } from './roles';
import { users } from './users';

export const user_roles = pgTable(
    'user_roles',
    {
        user_id: uuid('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        role_id: uuid('role_id')
            .references(() => roles.id, { onDelete: 'cascade' })
            .notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.user_id, table.role_id] }),
    ],
);
