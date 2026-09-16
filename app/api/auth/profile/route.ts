import { db } from '@/db';
import { users, roles, user_roles, permissions, role_permissions } from '@/db/schemas';
import { eq, inArray } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { getSession } from '@/services/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return apiError('Unauthorized', 401);
        }

        const userId = session.user.id;

        // 1. Fetch user detail
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                full_name: users.full_name,
                avatar_url: users.avatar_url,
                is_active: users.is_active,
                is_locked: users.is_locked,
            })
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return apiError('User not found', 404);
        }

        // 2. Fetch roles for the user
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

        const roleIds = userRoles.map((r) => r.id);
        const hasSystemRole = userRoles.some((r) => r.is_system || r.code === 'admin' || r.code === 'superadmin');

        // 3. Fetch permissions for these roles
        let userPermissions: string[] = [];
        if (hasSystemRole) {
            // Super Admin bypass: có toàn bộ quyền
            userPermissions = ['*'];
        } else if (roleIds.length > 0) {
            const rawRolePermissions = await db
                .select({
                    code: permissions.code,
                })
                .from(role_permissions)
                .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
                .where(inArray(role_permissions.role_id, roleIds));

            userPermissions = Array.from(new Set(rawRolePermissions.map(p => p.code)));
        }

        // Compose response theo format chuẩn yêu cầu
        return apiResponse({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                is_active: user.is_active,
                is_locked: user.is_locked,
                is_system: hasSystemRole || userPermissions.includes('*'),
            },
            roles: userRoles.map(r => r.code),
            permissions: userPermissions,
        });
    } catch (error) {
        console.error('Profile Error:', error);
        return apiError('Internal Server Error', 500);
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return apiError('Unauthorized', 401);
        }

        const userId = session.user.id;
        const body = await request.json();
        const { full_name, avatar_url } = body;

        const [updatedUser] = await db
            .update(users)
            .set({
                full_name: full_name,
                avatar_url: avatar_url,
                updated_at: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            return apiError('User not found', 404);
        }

        return apiResponse({
            id: updatedUser.id,
            email: updatedUser.email,
            full_name: updatedUser.full_name,
            avatar_url: updatedUser.avatar_url,
            is_active: updatedUser.is_active,
            is_locked: updatedUser.is_locked,
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return apiError('Internal Server Error', 500);
    }
}

export const PUT = PATCH;

