import { db } from '@/db';
import { auditLogs, users } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, eq, ilike, or, and, sql } from 'drizzle-orm';
import { withAuth, isSuperAdmin } from '@/middlewares/middleware';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';

export const GET = withAuth(async (request, session) => {
    try {
        // Only SuperAdmin can view audit logs
        if (!isSuperAdmin(session.user)) {
            return apiError('Chỉ SuperAdmin mới có quyền xem nhật ký hệ thống', 403);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const moduleFilter = searchParams.get('module');
        const action = searchParams.get('action');

        // Parse pagination params
        const { page, limit } = parsePaginationParams(searchParams);
        const offset = calculateOffset(page, limit);

        // Build conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    ilike(auditLogs.description, `%${search}%`),
                    ilike(users.username, `%${search}%`),
                ),
            );
        }

        if (moduleFilter) {
            conditions.push(eq(auditLogs.module, moduleFilter));
        }

        if (action) {
            conditions.push(eq(auditLogs.action, action));
        }

        // Count total items
        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.user_id, users.id));

        if (conditions.length > 0) {
            countQuery.where(and(...(conditions as Parameters<typeof and>)));
        }
        const [{ count: total }] = await countQuery;

        // Fetch paginated data with user info
        let query = db
            .select({
                id: auditLogs.id,
                action: auditLogs.action,
                module: auditLogs.module,
                targetId: auditLogs.target_id,
                description: auditLogs.description,
                changes: auditLogs.changes,
                ipAddress: auditLogs.ip_address,
                userAgent: auditLogs.user_agent,
                createdAt: auditLogs.created_at,
                user: {
                    id: users.id,
                    username: users.username,
                    fullName: users.full_name,
                },
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.user_id, users.id))
            .orderBy(desc(auditLogs.created_at))
            .limit(limit)
            .offset(offset);

        if (conditions.length > 0) {
            // @ts-expect-error drizzle query builder type mismatch
            query = query.where(and(...conditions));
        }

        const logs = await query;

        return apiResponse(logs, {
            meta: createPaginationMeta(page, limit, Number(total)),
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return apiError('Internal Server Error', 500);
    }
});
