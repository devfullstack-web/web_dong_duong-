import { db } from '@/db';
import { permissions, role_permissions } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { PERMISSIONS, ALL_SYSTEM_PERMISSIONS } from '@/constants/rbac';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { NextRequest } from 'next/server';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

export const GET = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const roleId = searchParams.get('roleId');

            // 1. Auto-sync permissions from static ALL_SYSTEM_PERMISSIONS to DB
            const dbPerms = await db.select().from(permissions);
            const dbCodes = new Set(dbPerms.map((p) => p.code));
            
            const toInsert = ALL_SYSTEM_PERMISSIONS.filter((p) => !dbCodes.has(p.code));
            if (toInsert.length > 0) {
                await db.insert(permissions).values(
                    toInsert.map((p) => ({
                        code: p.code,
                        name: p.name,
                        module: p.module,
                        action: p.action,
                        description: p.description,
                    }))
                );
            }

            // Generate list of modules dynamically from static sidebar config (and convert permission names to lowercase for module IDs)
            const allModules = SIDEBAR_ITEMS
                .filter((item) => item.permission !== null)
                .map((item) => {
                    const moduleCode = item.permission!.split('.')[0];
                    return {
                        id: moduleCode,
                        code: moduleCode,
                        name: item.name,
                        icon: item.icon,
                        route: item.route,
                    };
                });

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

            // Combine modules with dynamically mapped role permissions using format module.action
            const matrix = allModules.map((module) => {
                const moduleCode = module.code;
                return {
                    module: module,
                    permissions: {
                        can_view: assignedPermissionCodes.has(`${moduleCode}.view`),
                        can_create: assignedPermissionCodes.has(`${moduleCode}.create`),
                        can_update: assignedPermissionCodes.has(`${moduleCode}.update`),
                        can_delete: assignedPermissionCodes.has(`${moduleCode}.delete`),
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
