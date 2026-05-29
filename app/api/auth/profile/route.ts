import { db } from '@/db';
import { users, roles, user_roles, permissions, modules } from '@/db/schemas';
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
                createdAt: users.created_at,
                updatedAt: users.updated_at,
                deletedAt: users.deleted_at,
                email: users.email,
                fullName: users.full_name,
                phone: users.phone,
                isActive: users.is_active,
                isLocked: users.is_locked,
                is_super: users.is_super, // Use consistent field name
                avatarUrl: users.avatar_url,
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
                createdAt: roles.created_at,
                updatedAt: roles.updated_at,
                deletedAt: roles.deleted_at,
                code: roles.code,
                name: roles.name,
                description: roles.description,
                is_super: roles.is_super,
            })
            .from(user_roles)
            .innerJoin(roles, eq(user_roles.role_id, roles.id))
            .where(eq(user_roles.user_id, userId));

        const roleIds = userRoles.map((r) => r.id);

        // Check if user has superadmin role OR is_super flag is set in users table
        const isSystemSuper = userRoles.some((r) => r.is_super) || user.is_super;

        interface PermissionWithModule {
            id: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            deletedAt: Date | null;
            moduleId: string;
            roleId: string;
            canView: boolean | null;
            canCreate: boolean | null;
            canUpdate: boolean | null;
            canDelete: boolean | null;
            module: {
                id: string;
                createdAt: Date | null;
                updatedAt: Date | null;
                deletedAt: Date | null;
                code: string;
                name: string;
                icon: string | null;
                route: string | null;
                order: number | null;
            };
        }

        // 3. Fetch permissions for these roles
        let allPermissions: PermissionWithModule[] = [];
        if (roleIds.length > 0) {
            allPermissions = await db
                .select({
                    id: permissions.id,
                    createdAt: permissions.created_at,
                    updatedAt: permissions.updated_at,
                    deletedAt: permissions.deleted_at,
                    moduleId: permissions.module_id,
                    roleId: permissions.role_id,
                    canView: permissions.can_view,
                    canCreate: permissions.can_create,
                    canUpdate: permissions.can_update,
                    canDelete: permissions.can_delete,
                    module: {
                        id: modules.id,
                        createdAt: modules.created_at,
                        updatedAt: modules.updated_at,
                        deletedAt: modules.deleted_at,
                        code: modules.code,
                        name: modules.name,
                        icon: modules.icon,
                        route: modules.route,
                        order: modules.order,
                    },
                })
                .from(permissions)
                .innerJoin(modules, eq(permissions.module_id, modules.id))
                .where(inArray(permissions.role_id, roleIds));
        }

        // Compose the response
        const rolesWithPermissions = userRoles.map((role) => ({
            ...role,
            permissions: allPermissions
                .filter((p) => p.roleId === role.id)
                .map((p) => {
                    const { roleId: _roleId, ...rest } = p;
                    void _roleId;
                    return rest;
                }),
        }));

        return apiResponse({
            ...user,
            is_super: isSystemSuper,
            roles: rolesWithPermissions,
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
        const { fullName, phone, avatarUrl } = body;

        const [updatedUser] = await db
            .update(users)
            .set({
                full_name: fullName,
                phone: phone,
                avatar_url: avatarUrl,
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
            fullName: updatedUser.full_name,
            phone: updatedUser.phone,
            avatarUrl: updatedUser.avatar_url,
            isActive: updatedUser.is_active,
            isLocked: updatedUser.is_locked,
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return apiError('Internal Server Error', 500);
    }
}
