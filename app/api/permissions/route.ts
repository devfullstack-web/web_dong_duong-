import { db } from '@/db';
import { permissions, modules } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import {  PERMISSIONS } from '@/constants/rbac';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { NextRequest } from 'next/server';

export const GET = withAuth(
    async (request: NextRequest) => {
        try {
            const { searchParams } = new URL(request.url);
            const roleId = searchParams.get('roleId');

            const allModules = await db.select().from(modules);

            let rolePermissions: (typeof permissions.$inferSelect)[] = [];
            if (roleId) {
                rolePermissions = await db
                    .select()
                    .from(permissions)
                    .where(eq(permissions.role_id, roleId));
            }

            // Combine modules with role permissions for a matrix view
            const matrix = allModules.map((module) => {
                const perm = rolePermissions.find((p) => p.module_id === module.id);
                return {
                    module: module,
                    permissions: perm || {
                        can_view: false,
                        can_create: false,
                        can_update: false,
                        can_delete: false,
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
