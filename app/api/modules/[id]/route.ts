import { db } from '@/db';
import { modules } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { PERMISSIONS, PROTECTED_MODULES } from '@/constants/rbac';
import { eq } from 'drizzle-orm';
import { withAuth, isSuperAdmin } from '@/middlewares/middleware';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

export const GET = withAuth(
    async (request, session, { params }) => {
        try {
            const { id } = await params;
            const [module] = await db.select().from(modules).where(eq(modules.id, id));

            if (!module) {
                return apiError('Không tìm thấy module', 404);
            }

            return apiResponse(module);
        } catch (error) {
            console.error('Error fetching module:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);

export const PATCH = withAuth(
    async (request, session, { params }) => {
        try {
            const { id } = await params;
            const body = await request.json();
            const { name, code, icon, route, order } = body;

            const [module] = await db.select().from(modules).where(eq(modules.id, id));
            if (!module) return apiError('Không tìm thấy module', 404);

            // Protection: Only SuperAdmin can modify core modules
            if (PROTECTED_MODULES.includes(module.code) && !isSuperAdmin(session.user)) {
                return apiError('Chỉ SuperAdmin mới có quyền sửa đổi module hệ thống', 403);
            }

            const [updatedModule] = await db
                .update(modules)
                .set({
                    ...(name && { name }),
                    ...(code && {
                        code: code
                            .toUpperCase()
                            .replace(/\s+/g, '_')
                            .replace(/[^A-Z0-9_]/g, ''),
                    }),
                    ...(icon !== undefined && { icon: icon || null }),
                    ...(route !== undefined && { route: route || null }),
                    ...(order !== undefined && { order: parseInt(order) || 0 }),
                    updated_at: new Date(),
                })
                .where(eq(modules.id, id))
                .returning();

            if (!updatedModule) {
                return apiError('Không tìm thấy module', 404);
            }

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.UPDATE,
                module: AUDIT_MODULES.MODULES,
                targetId: id,
                description: `Cập nhật module: ${module.name} -> ${updatedModule.name}`,
                changes: {
                    old: module,
                    new: updatedModule,
                },
                request,
            });

            return apiResponse(updatedModule);
        } catch (error) {
            console.error('Error updating module:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);

export const DELETE = withAuth(
    async (request, session, { params }) => {
        try {
            const { id } = await params;

            // Fetch module info
            const [module] = await db.select().from(modules).where(eq(modules.id, id));

            if (!module) {
                return apiError('Không tìm thấy module', 404);
            }

            // Protection: Only SuperAdmin can delete system modules
            if (PROTECTED_MODULES.includes(module.code) && !isSuperAdmin(session.user)) {
                return apiError('Chỉ SuperAdmin mới có quyền xóa module hệ thống', 403);
            }

            const [deletedModule] = await db.delete(modules).where(eq(modules.id, id)).returning();

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.DELETE,
                module: AUDIT_MODULES.MODULES,
                targetId: id,
                description: `Xóa module: ${module.name}`,
                changes: { old: module },
                request,
            });

            return apiResponse(null, { status: 200 });
        } catch (error) {
            console.error('Error deleting module:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);
