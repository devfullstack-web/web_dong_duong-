import { db } from '@/db';
import { contacts } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { sendThankYouEmail } from '@/services/mail';
import { desc, ilike, or, gte, lte, and, sql } from 'drizzle-orm';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { PORTAL_ROUTES } from '@/constants/routes';
import { PAGINATION } from '@/constants/app';
import { validateBody } from '@/middlewares/middleware';
import { contactSchema } from '@/validations/contact.schema';
import { checkRateLimit } from '@/utils/rate-limiter';
import { sanitizePlainText } from '@/utils/sanitize';
import { CONTACT_STATUS } from '@/constants/content';

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting Check
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const { isLimited, retryAfter } = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000); // 3 per hour

        if (isLimited) {
            return apiError(
                `Bạn đã gửi yêu cầu quá thường xuyên. Vui lòng thử lại sau ${Math.ceil(retryAfter! / 60)} phút.`,
                429,
            );
        }

        // Validate request body
        const dataOrError = await validateBody(request, contactSchema);
        if (dataOrError instanceof Response) {
            return dataOrError;
        }

        // Sanitize message to prevent XSS
        const sanitizedData = {
            ...dataOrError,
            name: sanitizePlainText(dataOrError.name, 255),
            address: dataOrError.address ? sanitizePlainText(dataOrError.address, 500) : null,
            message: sanitizePlainText(dataOrError.message, 5000),
            subject: dataOrError.subject ? sanitizePlainText(dataOrError.subject, 255) : null,
        };

        const [newContact] = await db
            .insert(contacts)
            .values({
                ...sanitizedData,
                status: CONTACT_STATUS.NEW,
            })
            .returning();

        // Send emails and trigger notification asynchronously
        Promise.all([
            sendThankYouEmail(newContact.email, newContact.name),
            import('@/services/mail').then((m) =>
                m.sendAdminNotificationEmail({
                    name: newContact.name,
                    email: newContact.email,
                    phone: newContact.phone || '',
                    address: newContact.address || '',
                    message: newContact.message,
                }),
            ),
            import('@/services/notification-service').then((m) =>
                m.notificationService.createNotification({
                    type: 'contact',
                    title: 'Liên hệ mới',
                    content: `Khách hàng ${newContact.name} vừa gửi yêu cầu liên hệ.`,
                    link: PORTAL_ROUTES.contacts,
                }),
            ),
        ]).catch((error) => {
            console.error('Failed to process post-submission tasks:', error);
        });

        return apiResponse({ contact: newContact }, { status: 201 });
    } catch (error) {
        console.error('Error saving contact:', error);
        return apiError('Internal Server Error', 500);
    }
}

// GET /api/contacts - List all contact submissions
export const GET = withAuth(
    async (request) => {
        try {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            const status = searchParams.get('status');

            // Parse pagination params
            const { page, limit } = parsePaginationParams(searchParams, {
                limit: PAGINATION.CONTACTS_LIMIT,
            });
            const offset = calculateOffset(page, limit);

            // Build where conditions
            const conditions = [];

            if (search) {
                conditions.push(
                    or(
                        ilike(contacts.name, `%${search}%`),
                        ilike(contacts.email, `%${search}%`),
                        ilike(contacts.address, `%${search}%`),
                    ),
                );
            }

            if (startDate) {
                conditions.push(gte(contacts.created_at, new Date(startDate)));
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push(lte(contacts.created_at, end));
            }

            if (status) {
                conditions.push(sql`${contacts.status} = ${status}`);
            }

            // Count total items
            const countQuery = db.select({ count: sql<number>`count(*)` }).from(contacts);
            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
            }
            const [{ count: total }] = await countQuery;

            // Fetch paginated data
            let query = db
                .select()
                .from(contacts)
                .orderBy(desc(contacts.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle type issue with dynamic conditions
                query = query.where(and(...conditions));
            }

            const allContacts = await query;

            return apiResponse(allContacts, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.CONTACTS_VIEW] },
);
