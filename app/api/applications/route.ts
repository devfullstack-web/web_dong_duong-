import { db } from '@/db';
import { jobApplications, jobPostings } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, ilike, or, and, sql, eq } from 'drizzle-orm';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { PAGINATION } from '@/constants/app';
import { PORTAL_ROUTES } from '@/constants/routes';
import { jobApplicationSchema } from '@/validations/application.schema';
import { sendApplicationConfirmationEmail } from '@/services/mail';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { UPLOAD } from '@/constants/app';
import { checkRateLimit } from '@/utils/rate-limiter';
import { createSafeFilename, validateUploadedFile } from '@/utils/file-upload';
import { sanitizePlainText } from '@/utils/sanitize';
import { APPLICATION_STATUS, JOB_STATUS } from '@/constants/content';

// POST /api/applications - Submit a new job application (Public)
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const rawEmail = String(formData.get('email') || '').trim().toLowerCase();
        const rateLimit = checkRateLimit(
            `application:${ip}:${rawEmail || 'anonymous'}`,
            5,
            60 * 60 * 1000,
        );

        if (rateLimit.isLimited) {
            return apiError('Bạn đã gửi hồ sơ quá thường xuyên. Vui lòng thử lại sau.', 429);
        }

        // Extract file
        const file = formData.get('file') as File | null;
        if (!file) {
            return apiError('Vui lòng đính kèm hồ sơ CV', 400);
        }

        const fileValidation = await validateUploadedFile(file, {
            allowedKinds: ['document'],
            maxSize: UPLOAD.MAX_FILE_SIZE,
        });
        if (!fileValidation.ok) return apiError(fileValidation.error, 400);

        // Extract data
        const rawData = {
            job_id: formData.get('job_id'),
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cover_letter: formData.get('cover_letter'),
        };

        // Validate with Zod - omit cv_url as it's generated server-side
        const validation = jobApplicationSchema.omit({ cv_url: true }).safeParse(rawData);
        if (!validation.success) {
            return apiError('Dữ liệu không hợp lệ', 400, { errors: validation.error.issues });
        }

        const data = validation.data;

        // Check if job exists and is open
        const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, data.job_id));

        if (!job) {
            return apiError('Công việc không tồn tại', 404);
        }

        if (job.status !== JOB_STATUS.OPEN) {
            return apiError('Vị trí này đã tạm dừng tuyển dụng', 400);
        }

        // 1. Handle CV File Saving
        const year = new Date().getFullYear().toString();
        const uploadsDir = path.join(process.cwd(), 'storage', 'uploads', 'cvs', year);
        await mkdir(uploadsDir, { recursive: true });

        const filename = createSafeFilename(fileValidation.extension);
        const filepath = path.join(uploadsDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const cvUrl = `cvs/${year}/${filename}`;

        // 2. Save Application to DB
        const sanitizedData = {
            ...data,
            cv_url: cvUrl,
            cover_letter: data.cover_letter ? sanitizePlainText(data.cover_letter, 5000) : null,
            status: APPLICATION_STATUS.PENDING,
        };

        const [newApplication] = await db.insert(jobApplications).values(sanitizedData).returning();

        // 3. Send confirmation email (non-blocking)
        try {
            sendApplicationConfirmationEmail(
                sanitizedData.email,
                sanitizedData.full_name,
                job.title,
            ).catch((err) => {
                console.error('Failed to process post-application tasks:', err);
            });
        } catch (error) {
            console.error('Error triggering post-application process:', error);
        }

        return apiResponse(
            {
                application: {
                    ...newApplication,
                    cv_url: `/api/applications/${newApplication.id}/cv`,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error saving job application:', error);
        return apiError('Internal Server Error', 500);
    }
}

// GET /api/applications - List all applications (Admin)
export const GET = withAuth(
    async (request) => {
        try {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            const jobId = searchParams.get('job_id');
            const status = searchParams.get('status');

            const { page, limit } = parsePaginationParams(searchParams, {
                limit: PAGINATION.APPLICATIONS_LIMIT,
            });
            const offset = calculateOffset(page, limit);

            const conditions = [];

            if (search) {
                conditions.push(
                    or(
                        ilike(jobApplications.full_name, `%${search}%`),
                        ilike(jobApplications.email, `%${search}%`),
                        ilike(jobApplications.phone, `%${search}%`),
                    ),
                );
            }

            if (jobId) {
                conditions.push(eq(jobApplications.job_id, jobId));
            }

            if (status) {
                conditions.push(eq(jobApplications.status, status));
            }

            const countQuery = db.select({ count: sql<number>`count(*)` }).from(jobApplications);
            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
            }
            const [{ count: total }] = await countQuery;

            let query = db
                .select({
                    id: jobApplications.id,
                    job_id: jobApplications.job_id,
                    job_title: jobPostings.title,
                    full_name: jobApplications.full_name,
                    email: jobApplications.email,
                    phone: jobApplications.phone,
                    cv_url: jobApplications.cv_url,
                    status: jobApplications.status,
                    created_at: jobApplications.created_at,
                })
                .from(jobApplications)
                .leftJoin(jobPostings, eq(jobApplications.job_id, jobPostings.id))
                .orderBy(desc(jobApplications.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle dynamic conditions
                query = query.where(and(...conditions));
            }

            const applications = await query;

            const safeApplications = applications.map((application) => ({
                ...application,
                cv_url: `/api/applications/${application.id}/cv`,
            }));

            return apiResponse(safeApplications, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.APPLICATIONS_VIEW] },
);
