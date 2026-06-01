import { db } from '@/db';
import { newsArticles, categories, authors } from '@/db/schemas';
import { eq, desc, sql, and, or, ilike, gte, lte, isNull } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { withAuth, withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { ARTICLE, PAGINATION } from '@/constants/app';
import { auditService } from '@/services/audit-service';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/constants/audit';
import { sanitizePlainText, sanitizeRichText } from '@/utils/sanitize';
import { NEWS_STATUS, type NewsStatus } from '@/constants/content';

// GET /api/news - List news articles with pagination
export const GET = withHybridAuth(
    async (request, session) => {
        try {
            const { searchParams } = new URL(request.url);
            let status = searchParams.get('status') as NewsStatus | null;
            const categoryId = searchParams.get('categoryId');
            const search = searchParams.get('search');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            let includeDeleted = searchParams.get('includeDeleted') === 'true';

            // Authorization protection: Force published/not-deleted if not authorized
            const isAuthorized =
                session &&
                hasPermission(session.user, PERMISSIONS.BLOG_VIEW);
            if (!isAuthorized) {
                status = NEWS_STATUS.PUBLISHED;
                includeDeleted = false;
            }

            // Parse pagination params
            const { page, limit } = parsePaginationParams(searchParams, {
                limit: PAGINATION.NEWS_LIMIT,
            });
            const offset = calculateOffset(page, limit);

            // Build where conditions
            const conditions = [];

            // Soft delete filter
            if (!includeDeleted) {
                conditions.push(isNull(newsArticles.deleted_at));
            }
            if (status) {
                conditions.push(eq(newsArticles.status, status));
            }
            if (categoryId) {
                conditions.push(eq(newsArticles.category_id, categoryId));
            }
            if (search) {
                conditions.push(
                    or(
                        ilike(newsArticles.title, `%${search}%`),
                        ilike(newsArticles.summary, `%${search}%`),
                    ),
                );
            }
            if (startDate) {
                conditions.push(gte(newsArticles.created_at, new Date(startDate)));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push(lte(newsArticles.created_at, end));
            }

            // Count total items
            const countQuery = db.select({ count: sql<number>`count(*)` }).from(newsArticles);
            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
            }
            const [{ count: total }] = await countQuery;

            // Build main query with pagination
            let query = db
                .select({
                    id: newsArticles.id,
                    title: newsArticles.title,
                    title_localized: newsArticles.title_localized,
                    slug: newsArticles.slug,
                    summary: newsArticles.summary,
                    summary_localized: newsArticles.summary_localized,
                    content: newsArticles.content,
                    content_localized: newsArticles.content_localized,
                    status: newsArticles.status,
                    published_at: newsArticles.published_at,
                    created_at: newsArticles.created_at,
                    category_id: newsArticles.category_id,
                    category: categories.name,
                    author_id: newsArticles.author_id,
                    author: authors.name,
                    image_url: newsArticles.image_url,
                    gallery: newsArticles.gallery,
                })
                .from(newsArticles)
                .leftJoin(categories, eq(newsArticles.category_id, categories.id))
                .leftJoin(authors, eq(newsArticles.author_id, authors.id))
                .orderBy(desc(newsArticles.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle type issue with dynamic conditions
                query = query.where(and(...conditions));
            }

            const results = await query;

            // Transform results to include derived fields
            const transformedResults = results.map((article) => {
                const wordCount = article.content ? article.content.split(/\s+/).length : 0;
                const readTimeMinutes = Math.max(
                    1,
                    Math.ceil(wordCount / ARTICLE.WORDS_PER_MINUTE),
                );

                return {
                    ...article,
                    summary: sanitizePlainText(article.summary, 1000),
                    content: sanitizeRichText(article.content),
                    readTime: `${readTimeMinutes} ${ARTICLE.READ_TIME_SUFFIX}`,
                    category: article.category || ARTICLE.DEFAULT_CATEGORY,
                    author: article.author || ARTICLE.DEFAULT_AUTHOR,
                    image_url: article.image_url || ARTICLE.FALLBACK_IMAGE,
                };
            });

            return apiResponse(transformedResults, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching news:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.BLOG_VIEW], publicStatuses: [NEWS_STATUS.PUBLISHED] },
);

// POST /api/news - Create a new article
export const POST = withAuth(
    async (request, session) => {
        try {
            const body = await request.json();
            const {
                title,
                title_localized,
                slug,
                summary,
                summary_localized,
                content,
                content_localized,
                category_id,
                author_id,
                status,
                published_at,
                image_url,
                gallery,
            } = body;

            if (!title || !slug || !summary || !content || !category_id || !author_id) {
                return apiError('Missing required fields', 400);
            }

            const [newArticle] = await db
                .insert(newsArticles)
                .values({
                    title,
                    title_localized: title_localized || { vi: title, en: '' },
                    slug,
                    summary: sanitizePlainText(summary, 1000),
                    summary_localized: summary_localized || { vi: summary, en: '' },
                    content: sanitizeRichText(content),
                    content_localized: content_localized || { vi: content, en: '' },
                    category_id,
                    author_id,
                    status: status || NEWS_STATUS.DRAFT,
                    image_url: image_url || null,
                    gallery: gallery || [],
                    published_at: published_at ? new Date(published_at) : null,
                })
                .returning();

            // Audit Log
            auditService.logAction({
                userId: session.user.id,
                action: AUDIT_ACTIONS.CREATE,
                module: AUDIT_MODULES.NEWS,
                targetId: newArticle.id,
                description: `Tạo bài viết mới: ${newArticle.title}`,
                changes: { new: newArticle },
                request,
            });

            return apiResponse(newArticle, { status: 201 });
        } catch (error) {
            console.error('Error creating news article:', error);
            if ((error as { code?: string }).code === '23505') {
                return apiError('Bài viết với slug này đã tồn tại', 400);
            }
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.BLOG_CREATE] },
);
