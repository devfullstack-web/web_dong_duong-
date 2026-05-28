import { db } from '@/db';
import { products, productComments } from '@/db/schemas';
import { eq, isNull, and, desc } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { verifyAuth, isAdmin } from '@/middlewares/middleware';
import { PORTAL_ROUTES } from '@/constants/routes';
import { checkRateLimit } from '@/utils/rate-limiter';
import { sanitizePlainText } from '@/utils/sanitize';

// GET /api/products/[slug]/comments - List approved comments for a specific product
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const session = await verifyAuth(request as any);
        const userIsAdmin = session ? isAdmin(session.user) : false;

        // 1. Find product by slug or ID
        const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const [product] = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    isId ? eq(products.id, slug) : eq(products.slug, slug),
                    isNull(products.deleted_at),
                ),
            );

        if (!product) {
            return apiError('Product not found', 404);
        }

        // 2. Fetch comments (admins see all, guests see only approved)
        const conditions = [
            eq(productComments.product_id, product.id),
            isNull(productComments.deleted_at),
        ];

        if (!userIsAdmin) {
            conditions.push(eq(productComments.is_approved, true));
        }

        const comments = await db
            .select()
            .from(productComments)
            .where(and(...conditions))
            .orderBy(desc(productComments.created_at));

        return apiResponse(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return apiError('Internal Server Error', 500);
    }
}

// POST /api/products/[slug]/comments - Post a new comment (guest)
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const guest_name = sanitizePlainText(body.guest_name, 255);
        const guest_email = sanitizePlainText(body.guest_email, 255).toLowerCase();
        const content = sanitizePlainText(body.content, 2000);

        if (!guest_name || !guest_email || !content) {
            return apiError('Missing required fields', 400);
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
            return apiError('Email không hợp lệ', 400);
        }

        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rateLimit = checkRateLimit(`comment:${ip}:${guest_email}`, 5, 60 * 60 * 1000);
        if (rateLimit.isLimited) {
            return apiError('Bạn gửi bình luận quá thường xuyên. Vui lòng thử lại sau.', 429);
        }

        // 1. Find product by slug or ID
        const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const [product] = await db
            .select({ id: products.id })
            .from(products)
            .where(
                and(
                    isId ? eq(products.id, slug) : eq(products.slug, slug),
                    isNull(products.deleted_at),
                ),
            );

        if (!product) {
            return apiError('Product not found', 404);
        }

        // 2. Insert comment (defaults to pending approval)
        const [newComment] = await db
            .insert(productComments)
            .values({
                product_id: product.id,
                guest_name,
                guest_email,
                content,
                is_approved: false, // New comments must be approved
            })
            .returning();

        // 3. Trigger Notification (Admin)
        try {
            const { notificationService } = await import('@/services/notification-service');
            await notificationService.createNotification({
                type: 'comment',
                title: 'Bình luận mới',
                content: `${guest_name} đã bình luận về sản phẩm.`,
                link: PORTAL_ROUTES.cms.comments.list,
            });
        } catch (error) {
            console.error('Failed to trigger notification:', error);
        }

        return apiResponse(newComment, { status: 201 });
    } catch (error) {
        console.error('Error posting comment:', error);
        return apiError('Internal Server Error', 500);
    }
}
