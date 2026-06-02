import { db } from '@/db';
import { permissions, role_permissions } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { PERMISSIONS } from '@/constants/rbac';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { NextRequest } from 'next/server';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

export const GET = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const roleId = searchParams.get('roleId');

            // Generate list of modules dynamically from static sidebar config
            const allModules = SIDEBAR_ITEMS
                .filter((item) => item.permission !== null)
                .map((item) => ({
                    id: item.permission,
                    code: item.permission,
                    name: item.name,
                    icon: item.icon,
                    route: item.route,
                }));

            // Fetch permissions assigned to the role
            const assignedPermissionCodes = new Set<string>();
            if (roleId) {
                const assigned = await db
                    .select({ code: permissions.code })
                    .from(role_permissions)
                    .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
                    .where(eq(role_permissions.role_id, roleId));
                
                assigned.forEach((ap) => assignedPermissionCodes.add(ap.code));
            }

            // Combine modules with dynamically mapped role permissions
            const matrix = allModules.map((module) => {
                const moduleCode = module.code!.toUpperCase();
                return {
                    module: module,
                    permissions: {
                        can_view: assignedPermissionCodes.has(`${moduleCode}:VIEW`),
                        can_create: assignedPermissionCodes.has(`${moduleCode}:CREATE`),
                        can_update: assignedPermissionCodes.has(`${moduleCode}:UPDATE`),
                        can_delete: assignedPermissionCodes.has(`${moduleCode}:DELETE`),
                    },
                };
            });

            return apiResponse(matrix);
        } catch (error) {
            console.error('Error fetching permissions matrix:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);
