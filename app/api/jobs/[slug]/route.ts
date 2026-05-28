import { db } from "@/db";
import { jobPostings } from "@/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { hasPermission, verifyAuth, withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { sanitizeRichText } from "@/utils/sanitize";

// GET /api/jobs/[slug] - Get a single job by slug or ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await verifyAuth(request as any);
    const canViewPrivate =
      session && hasPermission(session.user, PERMISSIONS.RECRUITMENT_VIEW);
    
    // Check if slug is a UUID to fetch by ID instead
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const [job] = await db.select().from(jobPostings).where(
      and(
        isId ? eq(jobPostings.id, slug) : eq(jobPostings.slug, slug),
        ...(canViewPrivate ? [] : [eq(jobPostings.status, 'open')]),
        isNull(jobPostings.deleted_at)
      )
    );

    if (!job) {
      return apiError("Job not found", 404);
    }

    return apiResponse({
      ...job,
      description: sanitizeRichText(job.description),
      requirements: job.requirements ? sanitizeRichText(job.requirements) : null,
      benefits: job.benefits ? sanitizeRichText(job.benefits) : null,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return apiError("Internal Server Error", 500);
  }
}

// PATCH /api/jobs/[slug] - Update a job posting
export const PATCH = withAuth(async (request, session, { params }) => {
  try {
    const { slug: id } = await params;
    const body = await request.json();
    
    const updates: any = {};
    const allowedFields = [
      'title',
      'slug',
      'description',
      'requirements',
      'benefits',
      'location',
      'employment_type',
      'salary_range',
      'experience_level',
      'department',
      'status',
      'deadline',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    updates.updated_at = new Date();
    if (updates.description !== undefined) updates.description = sanitizeRichText(updates.description);
    if (updates.requirements !== undefined) updates.requirements = sanitizeRichText(updates.requirements);
    if (updates.benefits !== undefined) updates.benefits = sanitizeRichText(updates.benefits);
    if (updates.status !== undefined && !['open', 'closed'].includes(updates.status)) {
      return apiError("Invalid status", 400);
    }
    
    // Handle deadline conversion
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const [updatedJob] = await db.update(jobPostings)
      .set(updates)
      .where(eq(jobPostings.id, id))
      .returning();

    if (!updatedJob) {
      return apiError("Job not found", 404);
    }

    return apiResponse(updatedJob);
  } catch (error: any) {
    console.error("Error updating job:", error);
    if (error.code === "23505") {
      return apiError("A job with this slug already exists", 400);
    }
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_UPDATE] });

// DELETE /api/jobs/[slug] - Delete a job posting
export const DELETE = withAuth(async (request, session, { params }) => {
  try {
    const { slug: id } = await params;
    const [deletedJob] = await db.delete(jobPostings)
      .where(eq(jobPostings.id, id))
      .returning();

    if (!deletedJob) {
      return apiError("Job not found", 404);
    }

    return apiResponse({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_DELETE] });
