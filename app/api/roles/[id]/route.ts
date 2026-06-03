import { db } from '@/db';
import { roles, permissions, role_permissions } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { eq, inArray } from 'drizzle-orm';
import { withAuth, isSystemAdmin } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

export const GET = withAuth(
    async (request, session, { params }) => {
        try {
            const { id: roleId } = await params;

            const [role] = await db.select().from(roles).where(eq(roles.id, roleId));

            if (!role) return apiError('Role not found', 404);

            // Fetch associated permissions codes
            const rawRolePermissions = await db
                .select({
                    permCode: permissions.code,
                })
                .from(role_permissions)
                .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
                .where(eq(role_permissions.role_id, roleId));
            
            const permissionCodes = rawRolePermissions.map((rp) => rp.permCode);

            return apiResponse({ ...role, permissions: permissionCodes });
        } catch (error) {
            console.error('Error fetching role:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);

export const PATCH = withAuth(
    async (request, session, { params }) => {
        try {
            const { id: roleId } = await params;
            const { name, code, description, is_system, permissions: permissionCodes } = await request.json();

            const [existingRole] = await db.select().from(roles).where(eq(roles.id, roleId));
            if (!existingRole) return apiError('Role not found', 404);

            // Protection: Only SuperAdmin can modify a system role
            if (existingRole.is_system && !isSystemAdmin(session.user)) {
                return apiError('Chỉ SuperAdmin mới có quyền sửa đổi vai trò hệ thống', 403);
            }

            // Protection: Only SuperAdmin can change the is_system flag
            if (
                is_system !== undefined &&
                is_system !== existingRole.is_system &&
                !isSystemAdmin(session.user)
            ) {
                return apiError(
                    'Chỉ SuperAdmin mới có quyền thay đổi trạng thái vai trò hệ thống',
                    403,
                );
            }

            // Protection: Prevent renaming the code of system roles
            if (existingRole.is_system && code && code !== existingRole.code) {
                return apiError('Không thể thay đổi mã định danh của vai trò hệ thống', 400);
            }

            const updatedRole = await db.transaction(async (tx) => {
                const [role] = await tx
                    .update(roles)
                    .set({
                        name,
                        ...(existingRole.is_system ? {} : { code }),
                        description,
                        is_system: is_system !== undefined ? is_system : undefined,
                        updated_at: new Date(),
                    })
                    .where(eq(roles.id, roleId))
                    .returning();

                if (!role) throw new Error('Role not found');

                if (permissionCodes && Array.isArray(permissionCodes)) {
                    // Delete old permissions for this role from role_permissions
                    await tx.delete(role_permissions).where(eq(role_permissions.role_id, roleId));

                    // Query the matching permission records from the database
                    if (permissionCodes.length > 0) {
                        const dbPermissions = await tx
                            .select({ id: permissions.id })
                            .from(permissions)
                            .where(inArray(permissions.code, permissionCodes));

                        if (dbPermissions.length > 0) {
                            await tx.insert(role_permissions).values(
                                dbPermissions.map((dp) => ({
                                    role_id: roleId,
                                    permission_id: dp.id,
                                }))
                            );
                        }
                    }
                }

                return role;
            });

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.UPDATE,
                module: AUDIT_MODULES.ROLES,
                targetId: roleId,
                description: `Cập nhật vai trò: ${existingRole.name} -> ${updatedRole.name || existingRole.name}`,
                changes: {
                    old: existingRole,
                    new: updatedRole,
                },
                request,
            });

            return apiResponse(updatedRole);
        } catch (error: unknown) {
            console.error('Error updating role:', error);
            if (error instanceof Error && error.message === 'Role not found') return apiError('Role not found', 404);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_UPDATE] },
);

export const DELETE = withAuth(
    async (request, session, { params }) => {
        try {
            const { id: roleId } = await params;

            const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
            if (!role) return apiError('Role not found', 404);

            // Protection: Prevent deleting system roles
            if (role.is_system) {
                return apiError('Không thể xóa vai trò hệ thống cốt lõi', 400);
            }

            const [deletedRole] = await db.delete(roles).where(eq(roles.id, roleId)).returning();

            if (!deletedRole) return apiError('Role not found', 404);

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.DELETE,
                module: AUDIT_MODULES.ROLES,
                targetId: roleId,
                description: `Xóa vai trò: ${deletedRole.name}`,
                changes: { old: deletedRole },
                request,
            });

            return apiResponse({ message: 'Role deleted successfully' });
        } catch (error) {
            console.error('Error deleting role:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_DELETE] },
);
