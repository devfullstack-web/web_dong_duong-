import { index, pgTable, uuid } from 'drizzle-orm/pg-core';
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
    },
    (table) => [
        index('idx_user_roles_user_id').on(table.user_id),
        index('idx_user_roles_role_id').on(table.role_id),
    ],
);
