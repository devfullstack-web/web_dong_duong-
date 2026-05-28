import { db } from '@/db';
import { roles, permissions } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';

export const GET = withAuth(
    async () => {
        try {
            const allRoles = await db.select().from(roles).orderBy(desc(roles.created_at));

            return apiResponse(allRoles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);

export const POST = withAuth(
    async (request) => {
        try {
            const { name, code, description, permissionsMatrix } = await request.json();

            if (!name) {
                return apiError('Role name is required', 400);
            }

            // Use a transaction to create role and its permissions
            const newRole = await db.transaction(async (tx) => {
                const [insertedRole] = await tx
                    .insert(roles)
                    .values({
                        name,
                        code: code || name.toUpperCase().replace(/\s+/g, '_'),
                        description,
                        is_super: false, // Default to false for security, can be changed via PATCH if needed
                    })
                    .returning();

                if (permissionsMatrix && Array.isArray(permissionsMatrix)) {
                    for (const pm of permissionsMatrix) {
                        await tx.insert(permissions).values({
                            role_id: insertedRole.id,
                            module_id: pm.moduleId,
                            can_view: pm.canView || false,
                            can_create: pm.canCreate || false,
                            can_update: pm.canUpdate || false,
                            can_delete: pm.canDelete || false,
                        });
                    }
                }

                return insertedRole;
            });

            return apiResponse(newRole, { status: 201 });
        } catch (error) {
            console.error('Error creating role:', error);
            if (error instanceof Error && error.message.includes('unique constraint')) {
                return apiError('Role name already exists', 400);
            }
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_CREATE] },
);
