import { boolean, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { modules } from './modules';
import { roles } from './roles';

export const permissions = pgTable(
    'permissions',
    {
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
    },
    (table) => [
        uniqueIndex('idx_permissions_role_module_unique').on(table.role_id, table.module_id),
        index('idx_permissions_module_id').on(table.module_id),
        index('idx_permissions_deleted_at').on(table.deleted_at),
    ],
);
