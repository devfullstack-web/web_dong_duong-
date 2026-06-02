import { db } from '@/db';
import { projects, categories } from '@/db/schemas';
import { eq, desc, sql, and, or, ilike, gte, lte, isNull } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { withAuth, withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { PAGINATION } from '@/constants/app';
import { sanitizeRichText } from '@/utils/sanitize';
import { PROJECT_STATUS, type ProjectStatus } from '@/constants/content';

// GET /api/projects - List projects with pagination (Public/Protected Hybrid)
export const GET = withHybridAuth(
    async (request, session) => {
        try {
            const { searchParams } = new URL(request.url);
            const categoryId = searchParams.get('categoryId');
            const status = searchParams.get('status') as ProjectStatus | null;
            const search = searchParams.get('search');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            let includeDeleted = searchParams.get('includeDeleted') === 'true';

            // Authorization protection
            const isAuthorized =
                session &&
                hasPermission(session.user, PERMISSIONS.PROJECTS_VIEW);
            if (!isAuthorized) {
                includeDeleted = false;
            }

            // Parse pagination params
            const { page, limit } = parsePaginationParams(searchParams, {
                limit: PAGINATION.PROJECTS_LIMIT,
            });
            const offset = calculateOffset(page, limit);

            // Build where conditions
            const conditions = [];

            // Soft delete filter
            if (!includeDeleted) {
                conditions.push(isNull(projects.deleted_at));
            }
            if (categoryId) {
                conditions.push(eq(projects.category_id, categoryId));
            }
            if (status) {
                conditions.push(eq(projects.status, status));
            }
            if (search) {
                conditions.push(
                    or(
                        ilike(projects.name, `%${search}%`),
                        ilike(projects.client_name, `%${search}%`),
                    ),
                );
            }
            if (startDate) {
                conditions.push(gte(projects.created_at, new Date(startDate)));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push(lte(projects.created_at, end));
            }

            // Count total items
            const countQuery = db.select({ count: sql<number>`count(*)` }).from(projects);
            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
            }
            const [{ count: total }] = await countQuery;

            // Build main query with pagination
            let query = db
                .select({
                    id: projects.id,
                    name: projects.name,
                    name_localized: projects.name_localized,
                    slug: projects.slug,
                    description: projects.description,
                    description_localized: projects.description_localized,
                    client_name: projects.client_name,
                    start_date: projects.start_date,
                    end_date: projects.end_date,
                    status: projects.status,
                    image_url: projects.image_url,
                    gallery: projects.gallery,
                    category: categories.name,
                    category_localized: categories.name_localized,
                })
                .from(projects)
                .innerJoin(categories, eq(projects.category_id, categories.id))
                .orderBy(desc(projects.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle type issue with dynamic conditions
                query = query.where(and(...conditions));
            }

            const results = await query;

            return apiResponse(results, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    {
        requiredPermissions: [PERMISSIONS.PROJECTS_VIEW],
        publicStatuses: [PROJECT_STATUS.ONGOING, PROJECT_STATUS.COMPLETED],
    },
);

// POST /api/projects - Create a new project
export const POST = withAuth(
    async (request) => {
        try {
            const body = await request.json();
            const {
                name,
                name_localized,
                slug,
                description,
                description_localized,
                client_name,
                start_date,
                end_date,
                category_id,
                status,
                image_url,
                gallery,
            } = body;

            if (!name || !slug || !description || !category_id) {
                return apiError('Missing required fields', 400);
            }

            const [newProject] = await db
                .insert(projects)
                .values({
                    name,
                    name_localized: name_localized || { vi: name, en: '' },
                    slug,
                    description: sanitizeRichText(description),
                    description_localized: description_localized || { vi: sanitizeRichText(description), en: '' },
                    client_name: client_name || null,
                    start_date: start_date ? new Date(start_date) : null,
                    end_date: end_date ? new Date(end_date) : null,
                    category_id,
                    status: status || PROJECT_STATUS.ONGOING,
                    image_url: image_url || null,
                    gallery: gallery || [],
                })
                .returning();

            return apiResponse(newProject, { status: 201 });
        } catch (error) {
            console.error('Error creating project:', error);
            if ((error as { code?: string }).code === '23505') {
                return apiError('Dự án với slug này đã tồn tại', 400);
            }
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.PROJECTS_CREATE] },
);
