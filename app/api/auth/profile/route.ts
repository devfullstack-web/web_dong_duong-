import { db } from '@/db';
import { users, roles, user_roles, permissions, role_permissions } from '@/db/schemas';
import { eq, inArray } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { getSession } from '@/services/auth';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

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
            moduleId: string;
            roleId: string;
            canView: boolean;
            canCreate: boolean;
            canUpdate: boolean;
            canDelete: boolean;
            module: {
                id: string;
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
            const rawRolePermissions = await db
                .select({
                    roleId: role_permissions.role_id,
                    permId: permissions.id,
                    permCode: permissions.code,
                    moduleCode: permissions.module_code,
                })
                .from(role_permissions)
                .innerJoin(permissions, eq(role_permissions.permission_id, permissions.id))
                .where(inArray(role_permissions.role_id, roleIds));

            // Group raw permissions by (roleId, moduleCode) to build dynamic matrix
            const roleModuleMap = new Map<string, PermissionWithModule>();

            for (const raw of rawRolePermissions) {
                const sidebarItem = SIDEBAR_ITEMS.find((item) => item.permission === raw.moduleCode);
                const moduleInfo = {
                    id: raw.moduleCode,
                    code: raw.moduleCode,
                    name: sidebarItem?.name || raw.moduleCode,
                    icon: sidebarItem?.icon || 'Shield',
                    route: sidebarItem?.route || null,
                    order: sidebarItem?.order ?? 0,
                };

                const key = `${raw.roleId}:${raw.moduleCode}`;
                if (!roleModuleMap.has(key)) {
                    roleModuleMap.set(key, {
                        id: raw.permId,
                        roleId: raw.roleId,
                        moduleId: raw.moduleCode,
                        canView: false,
                        canCreate: false,
                        canUpdate: false,
                        canDelete: false,
                        module: moduleInfo
                    });
                }

                const entry = roleModuleMap.get(key)!;
                const action = raw.permCode.split(':')[1];
                if (action === 'VIEW') entry.canView = true;
                if (action === 'CREATE') entry.canCreate = true;
                if (action === 'UPDATE') entry.canUpdate = true;
                if (action === 'DELETE') entry.canDelete = true;
            }

            allPermissions = Array.from(roleModuleMap.values());
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
