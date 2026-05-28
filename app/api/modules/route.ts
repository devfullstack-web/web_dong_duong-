import { db } from '@/db';
import { modules } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { PERMISSIONS } from '@/constants/rbac';
import { sql, asc, ilike, or, and } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';

export const GET = withAuth(
    async (request) => {
        try {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');

            // Parse pagination params
            const { page, limit } = parsePaginationParams(searchParams);
            const offset = calculateOffset(page, limit);

            // Build conditions
            const conditions = [];
            if (search) {
                conditions.push(
                    or(ilike(modules.name, `%${search}%`), ilike(modules.code, `%${search}%`)),
                );
            }

            // Count total
            const countQuery = db.select({ count: sql<number>`count(*)` }).from(modules);
            if (conditions.length > 0) {
                countQuery.where(and(...(conditions as any[])));
            }
            const [{ count: total }] = await countQuery;

            // Fetch data
            let query = db
                .select()
                .from(modules)
                .orderBy(asc(modules.order))
                .limit(limit)
                .offset(offset);
            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle dynamic conditions
                query = query.where(and(...conditions));
            }

            const allModules = await query;

            return apiResponse(allModules, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching modules:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);

export const POST = withAuth(
    async (request) => {
        try {
            const body = await request.json();
            const { name, code, icon, route, order } = body;

            if (!name || !code) {
                return apiError('Thiếu tên hoặc mã module', 400);
            }

            // Check if code already exists
            const existing = await db
                .select()
                .from(modules)
                .where(sql`${modules.code} = ${code}`);

            if (existing.length > 0) {
                return apiError('Mã module đã tồn tại', 400);
            }

            const [newModule] = await db
                .insert(modules)
                .values({
                    name,
                    code: code
                        .toUpperCase()
                        .replace(/\s+/g, '_')
                        .replace(/[^A-Z0-9_]/g, ''),
                    icon: icon || null,
                    route: route || null,
                    order: parseInt(order) || 0,
                })
                .returning();

            // Audit Log
            auditService.logAction({
                userId: (request as any).session?.user?.id,
                action: AUDIT_ACTIONS.CREATE,
                module: AUDIT_MODULES.MODULES,
                targetId: newModule.id,
                description: `Tạo module mới: ${newModule.name} (${newModule.code})`,
                request,
            });

            return apiResponse(newModule, { status: 201 });
        } catch (error) {
            console.error('Error creating module:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.ROLES_VIEW] },
);
