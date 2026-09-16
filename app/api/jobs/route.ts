import { db } from '@/db';
import { jobPostings } from '@/db/schemas';
import { eq, desc, ilike, and, SQL, isNull, or, sql } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth, withHybridAuth, hasPermission } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { sanitizeRichText } from '@/utils/sanitize';
import { EMPLOYMENT_TYPE, JOB_STATUS, type JobStatus } from '@/constants/content';

// GET /api/jobs - List all job postings (Public/Protected Hybrid)
export const GET = withHybridAuth(
    async (request, session) => {
        try {
            const { searchParams } = new URL(request.url);
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            let status = searchParams.get('status');
            const search = searchParams.get('search');
            let includeDeleted = searchParams.get('includeDeleted') === 'true';

            // Authorization protection
            const isAuthorized =
                session &&
                hasPermission(session.user, PERMISSIONS.RECRUITMENT_VIEW);
            if (!isAuthorized) {
                status = JOB_STATUS.OPEN;
                includeDeleted = false;
            }

            const offset = (page - 1) * limit;

            // Build filter conditions
            const conditions: SQL[] = [];

            // Soft delete filter
            if (!includeDeleted) {
                conditions.push(isNull(jobPostings.deleted_at));
            }
            if (status) {
                conditions.push(eq(jobPostings.status, status as JobStatus));
            }
            if (search) {
                conditions.push(
                    or(
                        ilike(jobPostings.title, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.title_localized}->>'vi')`, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.title_localized}->>'en')`, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.title_localized}->>'zh')`, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.description_localized}->>'vi')`, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.description_localized}->>'en')`, `%${search}%`),
                        ilike(sql<string>`(${jobPostings.description_localized}->>'zh')`, `%${search}%`),
                    ),
                );
            }

            const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

            const [jobs, countResult] = await Promise.all([
                db
                    .select()
                    .from(jobPostings)
                    .where(whereClause)
                    .orderBy(desc(jobPostings.created_at))
                    .limit(limit)
                    .offset(offset),
                db.select().from(jobPostings).where(whereClause),
            ]);

            const total = countResult.length;
            const totalPages = Math.ceil(total / limit);

            return apiResponse(jobs, {
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.RECRUITMENT_VIEW], publicStatuses: [JOB_STATUS.OPEN] },
);

// POST /api/jobs - Create a new job posting
export const POST = withAuth(
    async (request) => {
        try {
            const body = await request.json();
            const {
                title,
                title_localized,
                slug,
                description,
                description_localized,
                requirements,
                requirements_localized,
                benefits,
                benefits_localized,
                location,
                employment_type,
                salary_range,
                experience_level,
                department,
                status,
                deadline,
            } = body;

            const finalTitle = title_localized?.vi || title;
            const finalDescription = description_localized?.vi || description;

            if (!finalTitle || !slug || !finalDescription) {
                return apiError('Missing required fields: title, slug, description', 400);
            }

            const [newJob] = await db
                .insert(jobPostings)
                .values({
                    title: finalTitle,
                    title_localized: title_localized || { vi: finalTitle, en: '', zh: '' },
                    slug,
                    description: sanitizeRichText(finalDescription),
                    description_localized: description_localized
                        ? {
                            vi: sanitizeRichText(description_localized.vi || ''),
                            en: sanitizeRichText(description_localized.en || ''),
                            zh: sanitizeRichText(description_localized.zh || ''),
                        }
                        : { vi: sanitizeRichText(finalDescription), en: '', zh: '' },
                    requirements: requirements ? sanitizeRichText(requirements) : (requirements_localized?.vi ? sanitizeRichText(requirements_localized.vi) : null),
                    requirements_localized: requirements_localized
                        ? {
                            vi: sanitizeRichText(requirements_localized.vi || ''),
                            en: sanitizeRichText(requirements_localized.en || ''),
                            zh: sanitizeRichText(requirements_localized.zh || ''),
                        }
                        : (requirements ? { vi: sanitizeRichText(requirements), en: '', zh: '' } : null),
                    benefits: benefits ? sanitizeRichText(benefits) : (benefits_localized?.vi ? sanitizeRichText(benefits_localized.vi) : null),
                    benefits_localized: benefits_localized
                        ? {
                            vi: sanitizeRichText(benefits_localized.vi || ''),
                            en: sanitizeRichText(benefits_localized.en || ''),
                            zh: sanitizeRichText(benefits_localized.zh || ''),
                        }
                        : (benefits ? { vi: sanitizeRichText(benefits), en: '', zh: '' } : null),
                    location: location || null,
                    employment_type: employment_type || EMPLOYMENT_TYPE.FULL_TIME,
                    salary_range: salary_range || null,
                    experience_level: experience_level || null,
                    department: department || null,
                    status: status || JOB_STATUS.OPEN,
                    deadline: deadline ? new Date(deadline) : null,
                })
                .returning();

            return apiResponse(newJob, { status: 201 });
        } catch (error) {
            console.error('Error creating job:', error);
            if ((error as { code?: string }).code === '23505') {
                return apiError('Tin tuyển dụng với slug này đã tồn tại', 400);
            }
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.RECRUITMENT_CREATE] },
);
