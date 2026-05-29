import { db } from '@/db';
import { users, user_roles, roles } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { eq, inArray } from 'drizzle-orm';
// @ts-expect-error - bcryptjs has no type declarations
import bcrypt from 'bcryptjs';
import { withAuth, isSuperAdmin } from '@/middlewares/middleware';
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
                    fullName: users.full_name,
                    email: users.email,
                    phone: users.phone,
                    isActive: users.is_active,
                    is_super: users.is_super,
                    createdAt: users.created_at,
                })
                .from(users)
                .where(eq(users.id, userId));

            if (!user) return apiError('User not found', 404);

            // Fetch user roles
            const userRoles = await db
                .select({
                    id: roles.id,
                    name: roles.name,
                })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            return apiResponse({ ...user, roles: userRoles });
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
            const { username, password, fullName, email, phone, roleIds } = body;

            // 1. Fetch the user being updated and their current status
            const [targetUser] = await db
                .select({
                    isSuper: users.is_super,
                    username: users.username,
                })
                .from(users)
                .where(eq(users.id, userId));

            if (!targetUser) return apiError('User not found', 404);

            const currentUserRoles = await db
                .select({ is_super: roles.is_super })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            // targetIsSuper if he has super role OR is_super flag
            const targetIsSuperAdmin =
                currentUserRoles.some((r) => r.is_super) || targetUser.isSuper;
            const isActorSuper = isSuperAdmin(session.user);

            // Protection: Only SuperAdmin can modify another SuperAdmin
            if (targetIsSuperAdmin && !isActorSuper) {
                return apiError(
                    'Chỉ SuperAdmin mới có quyền sửa đổi tài khoản SuperAdmin khác',
                    403,
                );
            }

            // 2. If changing roles, check for SuperAdmin role ganting/revoking
            if (roleIds && Array.isArray(roleIds)) {
                // Check if NEW roles include a SuperAdmin role
                const newRoles = await db
                    .select({ is_super: roles.is_super })
                    .from(roles)
                    .where(inArray(roles.id, roleIds));

                const assigningSuperAdminRole = newRoles.some((r) => r.is_super);
                const revokingSuperAdminRole = targetIsSuperAdmin && !assigningSuperAdminRole;

                if ((assigningSuperAdminRole || revokingSuperAdminRole) && !isActorSuper) {
                    return apiError(
                        'Chỉ SuperAdmin mới có quyền gán hoặc tước vai trò SuperAdmin',
                        403,
                    );
                }
            }

            const { isSuper, isLocked } = body;
            // Protection for is_super flag
            if (isSuper !== undefined && isSuper !== targetUser.isSuper) {
                if (!isActorSuper) {
                    return apiError('Chỉ SuperAdmin mới có quyền thay đổi cờ SuperAdmin', 403);
                }
                // Prevent self-demotion
                if (!isSuper && userId === session.user.id) {
                    return apiError('Bạn không thể tự tước quyền SuperAdmin của chính mình', 400);
                }
            }

            // Protection for is_locked flag
            if (isLocked !== undefined) {
                // Cannot lock your own account
                if (userId === session.user.id) {
                    return apiError('Bạn không thể khóa tài khoản của chính mình', 400);
                }
                // Only SuperAdmin can lock/unlock another SuperAdmin
                if (targetIsSuperAdmin && !isActorSuper) {
                    return apiError('Chỉ SuperAdmin mới có quyền khóa/mở khóa tài khoản SuperAdmin', 403);
                }
            }

            const [oldUser] = await db
                .select({
                    id: users.id,
                    username: users.username,
                    fullName: users.full_name,
                    email: users.email,
                    phone: users.phone,
                })
                .from(users)
                .where(eq(users.id, userId));

            const updatedUser = await db.transaction(async (tx) => {
                const updateData: Record<string, unknown> = {};
                if (username) updateData.username = username;
                if (fullName !== undefined) updateData.full_name = fullName;
                if (email !== undefined) updateData.email = email;
                if (phone !== undefined) updateData.phone = phone;
                if (isSuper !== undefined) updateData.is_super = isSuper;
                if (isLocked !== undefined) updateData.is_locked = isLocked;
                if (password) {
                    updateData.password = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);
                }
                updateData.updated_at = new Date();

                const [user] = await tx
                    .update(users)
                    .set(updateData)
                    .where(eq(users.id, userId))
                    .returning({
                        id: users.id,
                        username: users.username,
                        fullName: users.full_name,
                        email: users.email,
                        phone: users.phone,
                        isSuper: users.is_super,
                        isLocked: users.is_locked,
                    });

                if (!user) throw new Error('User not found');

                if (roleIds && Array.isArray(roleIds)) {
                    await tx.delete(user_roles).where(eq(user_roles.user_id, userId));
                    if (roleIds.length > 0) {
                        await tx.insert(user_roles).values(
                            roleIds.map((rId: string) => ({
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
                description: isLocked !== undefined
                    ? `${isLocked ? 'Khóa' : 'Mở khóa'} tài khoản người dùng: ${updatedUser.username}`
                    : `Cập nhật thông tin người dùng: ${updatedUser.username}`,

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

            // Handle PostgreSQL unique constraint violations
            const pgError = error as { code?: string; detail?: string };
            if (pgError?.code === '23505') {
                const detail = pgError?.detail || '';
                if (detail.includes('email')) {
                    return apiError('Email này đã được sử dụng bởi một tài khoản khác', 400);
                }
                if (detail.includes('username')) {
                    return apiError('Tên đăng nhập này đã được sử dụng', 400);
                }
                return apiError('Dữ liệu đã tồn tại (trùng lặp)', 400);
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

            // 1. Fetch user status and roles
            const targetUserRoles = await db
                .select({ is_super: roles.is_super })
                .from(user_roles)
                .innerJoin(roles, eq(user_roles.role_id, roles.id))
                .where(eq(user_roles.user_id, userId));

            const targetIsSuperAdmin = targetUserRoles.some((r) => r.is_super);
            const isActorSuper = isSuperAdmin(session.user);

            // Protection: Only SuperAdmin can delete another SuperAdmin
            if (targetIsSuperAdmin && !isActorSuper) {
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
                description: `Xóa tài khoản người dùng: ${deletedUser.username}`,
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
