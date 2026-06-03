import { db } from '@/db';
import { users, user_roles, roles } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { eq, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { withAuth, isSystemAdmin } from '@/middlewares/middleware';
import { AUTH } from '@/constants/app';
import { PERMISSIONS } from '@/constants/rbac';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

// GET /api/users/[id] - Get a single user
export const GET = withAuth(
    async (request: Request, session, { params }) => {
        try {
            const { id: userId } = await params;
            const [user] = await db
                .select({
                    id: users.id,
                    username: users.username,
                    full_name: users.full_name,
                    email: users.email,
                    is_active: users.is_active,
                    is_locked: users.is_locked,
                    created_at: users.created_at,
                })
                .from(users)
                .where(eq(users.id, userId));

            if (!user) return apiError('User not found', 404);

            // Fetch user roles
            const userRoles = await db
                .select({
                    id: roles.id,
                    code: roles.code,
                    name: roles.name,
                    is_system: roles.is_system,
                })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            const isSystem = userRoles.some(r => r.is_system || r.code === 'admin' || r.code === 'superadmin');

            return apiResponse({ ...user, roles: userRoles, is_system: isSystem });
        } catch (error) {
            console.error('Error fetching user:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.USERS_VIEW] },
);

// PATCH /api/users/[id] - Update a user
export const PATCH = withAuth(
    async (request: Request, session, { params }) => {
        try {
            const { id: userId } = await params;
            const body = await request.json();
            const { username, password, full_name, email, role_ids, is_active, is_locked } = body;

            // 1. Fetch the user being updated
            const [targetUser] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    is_active: users.is_active,
                    is_locked: users.is_locked,
                })
                .from(users)
                .where(eq(users.id, userId));

            if (!targetUser) return apiError('User not found', 404);

            const currentUserRoles = await db
                .select({ is_system: roles.is_system, code: roles.code })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            const targetIsSystemAdmin = currentUserRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');
            const isActorSystem = isSystemAdmin(session.user);

            // Protection: Only SuperAdmin can modify another SuperAdmin
            if (targetIsSystemAdmin && !isActorSystem) {
                return apiError(
                    'Chỉ SuperAdmin mới có quyền sửa đổi tài khoản SuperAdmin khác',
                    403,
                );
            }

            // 2. If changing roles, check for SuperAdmin role ganting/revoking
            if (role_ids && Array.isArray(role_ids)) {
                // Check if NEW roles include a SuperAdmin role
                const newRoles = await db
                    .select({ is_system: roles.is_system, code: roles.code })
                    .from(roles)
                    .where(inArray(roles.id, role_ids));

                const assigningSuperAdminRole = newRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');
                const revokingSuperAdminRole = targetIsSystemAdmin && !assigningSuperAdminRole;

                if ((assigningSuperAdminRole || revokingSuperAdminRole) && !isActorSystem) {
                    return apiError(
                        'Chỉ SuperAdmin mới có quyền gán hoặc tước vai trò hệ thống',
                        403,
                    );
                }
            }

            // Protection for is_locked flag
            if (is_locked !== undefined) {
                // Cannot lock your own account
                if (userId === session.user.id) {
                    return apiError('Bạn không thể khóa tài khoản của chính mình', 400);
                }
                // Only SuperAdmin can lock/unlock another SuperAdmin
                if (targetIsSystemAdmin && !isActorSystem) {
                    return apiError('Chỉ SuperAdmin mới có quyền khóa/mở khóa tài khoản SuperAdmin', 403);
                }
            }

            const [oldUser] = await db
                .select({
                    id: users.id,
                    username: users.username,
                    full_name: users.full_name,
                    email: users.email,
                })
                .from(users)
                .where(eq(users.id, userId));

            const updatedUser = await db.transaction(async (tx) => {
                const updateData: Record<string, unknown> = {};
                if (username !== undefined) updateData.username = username ? username.toLowerCase().trim() : null;
                if (full_name !== undefined) updateData.full_name = full_name;
                if (email !== undefined) updateData.email = email;
                if (is_active !== undefined) updateData.is_active = is_active;
                if (is_locked !== undefined) updateData.is_locked = is_locked;
                if (password) {
                    updateData.password_hash = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);
                }
                updateData.updated_at = new Date();

                const [user] = await tx
                    .update(users)
                    .set(updateData)
                    .where(eq(users.id, userId))
                    .returning({
                        id: users.id,
                        username: users.username,
                        full_name: users.full_name,
                        email: users.email,
                        is_active: users.is_active,
                        is_locked: users.is_locked,
                    });

                if (!user) throw new Error('User not found');

                if (role_ids && Array.isArray(role_ids)) {
                    await tx.delete(user_roles).where(eq(user_roles.user_id, userId));
                    if (role_ids.length > 0) {
                        await tx.insert(user_roles).values(
                            role_ids.map((rId: string) => ({
                                user_id: userId,
                                role_id: rId,
                            })),
                        );
                    }
                }

                return user;
            });

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.UPDATE,
                module: AUDIT_MODULES.USERS,
                targetId: userId,
                description: is_locked !== undefined
                    ? `${is_locked ? 'Khóa' : 'Mở khóa'} tài khoản người dùng: ${updatedUser.email}`
                    : `Cập nhật thông tin người dùng: ${updatedUser.email}`,

                changes: {
                    old: oldUser,
                    new: updatedUser,
                },
                request,
            });

            return apiResponse(updatedUser);
        } catch (error: unknown) {
            console.error('Error updating user:', error);

            if (error instanceof Error && error.message === 'User not found') {
                return apiError('Không tìm thấy người dùng', 404);
            }

            const pgError = error as { code?: string; detail?: string };
            if (pgError?.code === '23505') {
                return apiError('Email này đã được sử dụng bởi một tài khoản khác', 400);
            }

            return apiError('Lỗi máy chủ nội bộ', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.USERS_UPDATE] },
);

// DELETE /api/users/[id] - Delete a user
export const DELETE = withAuth(
    async (request: Request, session, { params }) => {
        try {
            const { id: userId } = await params;

            // 1. Fetch user roles
            const targetUserRoles = await db
                .select({ is_system: roles.is_system, code: roles.code })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            const targetIsSystemAdmin = targetUserRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');
            const isActorSystem = isSystemAdmin(session.user);

            // Protection: Only SuperAdmin can delete another SuperAdmin
            if (targetIsSystemAdmin && !isActorSystem) {
                return apiError('Chỉ SuperAdmin mới có quyền xóa tài khoản SuperAdmin', 403);
            }

            // Prevent self-deletion
            if (userId === session.user.id) {
                return apiError('Bạn không thể xóa chính tài khoản của mình', 400);
            }

            const [deletedUser] = await db.delete(users).where(eq(users.id, userId)).returning();

            if (!deletedUser) return apiError('User not found', 404);

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.DELETE,
                module: AUDIT_MODULES.USERS,
                targetId: userId,
                description: `Xóa tài khoản người dùng: ${deletedUser.email}`,
                changes: { old: deletedUser },
                request,
            });

            return apiResponse({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.USERS_DELETE] },
);
