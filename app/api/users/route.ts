import { db } from '@/db';
import { users, user_roles, roles } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, eq, sql, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { withAuth, isSystemAdmin } from '@/middlewares/middleware';
import { NextRequest } from 'next/server';
import { PERMISSIONS } from '@/constants/rbac';
import { AUTH } from '@/constants/app';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

// GET /api/users - List all users with their roles
export const GET = withAuth(
    async () => {
        try {
            const usersWithRoles = await db
                .select({
                    id: users.id,
                    username: users.username,
                    full_name: users.full_name,
                    email: users.email,
                    is_active: users.is_active,
                    is_locked: users.is_locked,
                    created_at: users.created_at,
                    roles: sql<{ id: string; name: string; code: string }[]>`
          COALESCE(
            json_agg(
              json_build_object('id', ${roles.id}, 'name', ${roles.name}, 'code', ${roles.code})
            ) FILTER (WHERE ${roles.id} IS NOT NULL),
            '[]'
          )
        `,
                })
                .from(users)
                .leftJoin(user_roles, eq(user_roles.user_id, users.id))
                .leftJoin(roles, eq(user_roles.role_id, roles.id))
                .groupBy(users.id)
                .orderBy(desc(users.created_at));

            return apiResponse(usersWithRoles);
        } catch (error) {
            console.error('Error fetching users:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.USERS_VIEW] },
);

// POST /api/users - Create a new user
export const POST = withAuth(
    async (request: NextRequest, session) => {
        try {
            const { username, email, password, full_name, role_ids } = await request.json();

            if (!email || !password) {
                return apiError('Email and password are required', 400);
            }

            // Security check: Only SuperAdmin can assign system/superadmin roles
            if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
                const requestedRoles = await db
                    .select({ is_system: roles.is_system, code: roles.code })
                    .from(roles)
                    .where(inArray(roles.id, role_ids));

                const assigningSuperAdminRole = requestedRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');
                if (assigningSuperAdminRole && !isSystemAdmin(session.user)) {
                    return apiError(
                        'Chỉ SuperAdmin mới có quyền gán vai trò hệ thống',
                        403,
                    );
                }
            }

            const hashedPassword = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);

            const newUser = await db.transaction(async (tx) => {
                const [user] = await tx
                    .insert(users)
                    .values({
                        username: username ? username.toLowerCase().trim() : undefined,
                        email: email.toLowerCase().trim(),
                        password_hash: hashedPassword,
                        full_name: full_name,
                    })
                    .returning({
                        id: users.id,
                        username: users.username,
                        email: users.email,
                        full_name: users.full_name,
                    });

                if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
                    await tx.insert(user_roles).values(
                        role_ids.map((rId: string) => ({
                            user_id: user.id,
                            role_id: rId,
                        })),
                    );
                }

                return user;
            });

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.CREATE,
                module: AUDIT_MODULES.USERS,
                targetId: newUser.id,
                description: `Tạo người dùng mới: ${newUser.email}`,
                request,
            });

            return apiResponse(newUser, { status: 201 });
        } catch (error: unknown) {
            console.error('Error creating user:', error);

            const pgError = error as { code?: string; detail?: string };
            if (pgError?.code === '23505') {
                return apiError('Email này đã được sử dụng', 400);
            }

            return apiError('Lỗi máy chủ nội bộ', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.USERS_CREATE] },
);
