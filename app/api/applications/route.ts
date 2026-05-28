import { db } from '@/db';
import { jobApplications, jobPostings } from '@/db/schemas';
import { apiResponse, apiError } from '@/utils/api-response';
import { desc, ilike, or, and, sql, eq } from 'drizzle-orm';
import { parsePaginationParams, calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { sanitizeHtml, withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { PAGINATION } from '@/constants/app';
import { PORTAL_ROUTES } from '@/constants/routes';
import { jobApplicationSchema } from '@/validations/application.schema';
import { sendApplicationConfirmationEmail } from '@/services/mail';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/applications - Submit a new job application (Public)
export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract file
        const file = formData.get('file') as File | null;
        if (!file) {
            return apiError('Vui lòng đính kèm hồ sơ CV', 400);
        }

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

        if (job.status !== 'open') {
            return apiError('Vị trí này đã tạm dừng tuyển dụng', 400);
        }

        // 1. Handle CV File Saving
        const year = new Date().getFullYear().toString();
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'cvs', year);
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'pdf';
        const filename = `${timestamp}-${randomSuffix}.${extension}`;
        const filepath = path.join(uploadsDir, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        const cvUrl = `/uploads/cvs/${year}/${filename}`;

        // 2. Save Application to DB
        const sanitizedData = {
            ...data,
            cv_url: cvUrl,
            cover_letter: data.cover_letter ? sanitizeHtml(data.cover_letter) : null,
            status: 'pending',
        };

        const [newApplication] = await db.insert(jobApplications).values(sanitizedData).returning();

        // 3. Send confirmation email and trigger admin notification (non-blocking)
        try {
            Promise.all([
                sendApplicationConfirmationEmail(
                    sanitizedData.email,
                    sanitizedData.full_name,
                    job.title,
                ),
                import('@/services/notification-service').then((m) =>
                    m.notificationService.createNotification({
                        type: 'application',
                        title: 'Ứng tuyển mới',
                        content: `Ứng viên ${sanitizedData.full_name} đã ứng tuyển vị trí ${job.title}.`,
                        link: PORTAL_ROUTES.cms.applications.list,
                    }),
                ),
            ]).catch((err) => {
                console.error('Failed to process post-application tasks:', err);
            });
        } catch (error) {
            console.error('Error triggering post-application process:', error);
        }

        return apiResponse({ application: newApplication }, { status: 201 });
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
                    status: jobApplications.status,
                    created_at: jobApplications.created_at,
                })
                .from(jobApplications)
                .leftJoin(jobPostings, eq(jobApplications.job_id, jobPostings.id))
                .orderBy(desc(jobApplications.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-ignore
                query = query.where(and(...conditions));
            }

            const applications = await query;

            return apiResponse(applications, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching applications:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.RECRUITMENT_VIEW] },
);
