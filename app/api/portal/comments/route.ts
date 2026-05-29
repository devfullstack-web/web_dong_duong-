import { db } from '@/db';
import { productComments, products } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, ilike, or, and, isNull, sql, eq } from 'drizzle-orm';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';

// GET /api/portal/comments - List all comments for admin management
export const GET = withAuth(
    async (request) => {
        try {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            const status = searchParams.get('status'); // approved, pending

            const { page, limit } = parsePaginationParams(searchParams, { limit: 10 });
            const offset = calculateOffset(page, limit);

            const conditions = [isNull(productComments.deleted_at)];

            if (search) {
                const searchCondition = or(
                    ilike(productComments.guest_name, `%${search}%`),
                    ilike(productComments.guest_email, `%${search}%`),
                    ilike(productComments.content, `%${search}%`),
                );
                if (searchCondition) {
                    conditions.push(searchCondition);
                }
            }

            if (status === 'approved') {
                conditions.push(eq(productComments.is_approved, true));
            } else if (status === 'pending') {
                conditions.push(eq(productComments.is_approved, false));
            }

            // Count total
            const countQuery = db.select({ count: sql<number>`count(*)` }).from(productComments);
            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle dynamic conditions
                countQuery.where(and(...conditions));
            }
            const [{ count: total }] = await countQuery;

            // Fetch comments with product info
            const comments = await db
                .select({
                    id: productComments.id,
                    guest_name: productComments.guest_name,
                    guest_email: productComments.guest_email,
                    content: productComments.content,
                    reply_content: productComments.reply_content,
                    is_approved: productComments.is_approved,
                    created_at: productComments.created_at,
                    product_name: products.name,
                    product_slug: products.slug,
                })
                .from(productComments)
                .leftJoin(products, eq(productComments.product_id, products.id))
                .where(and(...conditions))
                .orderBy(desc(productComments.created_at))
                .limit(limit)
                .offset(offset);

            return apiResponse(comments, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching portal comments:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.COMMENTS_VIEW] },
);
