import { db } from '@/db';
import { roles, permissions, role_permissions } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, inArray } from 'drizzle-orm';
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
                        is_system: false, // Default to false for security
                    })
                    .returning();

                if (permissionsMatrix && Array.isArray(permissionsMatrix)) {
                    // Build permission codes to assign
                    const permissionCodesToAssign: string[] = [];

                    for (const pm of permissionsMatrix) {
                        const moduleCode = pm.moduleId.toLowerCase();
                        if (pm.canView) permissionCodesToAssign.push(`${moduleCode}.view`);
                        if (pm.canCreate) permissionCodesToAssign.push(`${moduleCode}.create`);
                        if (pm.canUpdate) permissionCodesToAssign.push(`${moduleCode}.update`);
                        if (pm.canDelete) permissionCodesToAssign.push(`${moduleCode}.delete`);
                    }

                    // Query the matching permission records from the database
                    if (permissionCodesToAssign.length > 0) {
                        const dbPermissions = await tx
                            .select({ id: permissions.id })
                            .from(permissions)
                            .where(inArray(permissions.code, permissionCodesToAssign));

                        if (dbPermissions.length > 0) {
                            await tx.insert(role_permissions).values(
                                dbPermissions.map((dp) => ({
                                    role_id: insertedRole.id,
                                    permission_id: dp.id,
                                }))
                            );
                        }
                    }
                }

                return insertedRole;
            });

            return apiResponse(newRole, { status: 201 });
        } catch (error) {
            console.error('Error creating role:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_CREATE] },
);
