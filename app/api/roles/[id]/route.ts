import { db } from '@/db';
import { roles, permissions, modules } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { eq } from 'drizzle-orm';
import { withAuth, isSuperAdmin } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

export const GET = withAuth(
    async (request, session, { params }) => {
        try {
            const { id: roleId } = await params;

            const [role] = await db.select().from(roles).where(eq(roles.id, roleId));

            if (!role) return apiError('Role not found', 404);

            // Fetch associated permissions
            const rolePermissions = await db
                .select({
                    id: permissions.id,
                    canView: permissions.can_view,
                    canCreate: permissions.can_create,
                    canUpdate: permissions.can_update,
                    canDelete: permissions.can_delete,
                    module: {
                        id: modules.id,
                        code: modules.code,
                        name: modules.name,
                    },
                })
                .from(permissions)
                .innerJoin(modules, eq(permissions.module_id, modules.id))
                .where(eq(permissions.role_id, roleId));

            return apiResponse({ ...role, permissions: rolePermissions });
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
            const { name, code, description, is_super, permissionsMatrix } = await request.json();

            const [existingRole] = await db.select().from(roles).where(eq(roles.id, roleId));
            if (!existingRole) return apiError('Role not found', 404);

            // Protection: Only SuperAdmin can modify a system role
            if (existingRole.is_super && !isSuperAdmin(session.user)) {
                return apiError('Chỉ SuperAdmin mới có quyền sửa đổi vai trò hệ thống', 403);
            }

            // Protection: Only SuperAdmin can change the is_super flag
            if (
                is_super !== undefined &&
                is_super !== existingRole.is_super &&
                !isSuperAdmin(session.user)
            ) {
                return apiError(
                    'Chỉ SuperAdmin mới có quyền thay đổi trạng thái SuperAdmin của vai trò',
                    403,
                );
            }

            // Protection: Prevent renaming the code of system roles
            if (existingRole.is_super && code && code !== existingRole.code) {
                return apiError('Không thể thay đổi mã định danh của vai trò hệ thống', 400);
            }

            const updatedRole = await db.transaction(async (tx) => {
                const [role] = await tx
                    .update(roles)
                    .set({
                        name,
                        ...(existingRole.is_super ? {} : { code }),
                        description,
                        is_super: is_super !== undefined ? is_super : undefined,
                        updated_at: new Date(),
                    })
                    .where(eq(roles.id, roleId))
                    .returning();

                if (!role) throw new Error('Role not found');

                if (permissionsMatrix && Array.isArray(permissionsMatrix)) {
                    // Delete old permissions for this role
                    await tx.delete(permissions).where(eq(permissions.role_id, roleId));

                    // Insert new ones
                    for (const pm of permissionsMatrix) {
                        await tx.insert(permissions).values({
                            role_id: roleId,
                            module_id: pm.moduleId,
                            can_view: pm.canView || false,
                            can_create: pm.canCreate || false,
                            can_update: pm.canUpdate || false,
                            can_delete: pm.canDelete || false,
                        });
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
        } catch (error: any) {
            console.error('Error updating role:', error);
            if (error.message === 'Role not found') return apiError('Role not found', 404);
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

            // Protection: Prevent deleting protected roles (is_super)
            if (role.is_super) {
                return apiError('Không thể xóa vai trò hệ thống cốt lõi', 400);
            }

            // Additional Protection: Only SuperAdmin can delete any system-related roles if needed
            // (Already blocked above for is_super roles)

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
