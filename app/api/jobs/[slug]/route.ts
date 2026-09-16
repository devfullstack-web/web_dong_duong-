import { db } from "@/db";
import { jobPostings } from "@/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { NextRequest } from "next/server";
import { hasPermission, verifyAuth, withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { sanitizeRichText } from "@/utils/sanitize";
import { JOB_STATUS, JOB_STATUS_VALUES, isConstantValue } from "@/constants/content";

// GET /api/jobs/[slug] - Get a single job by slug or ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await verifyAuth(request as unknown as NextRequest);
    const canViewPrivate =
      session && hasPermission(session.user, PERMISSIONS.RECRUITMENT_VIEW);
    
    // Check if slug is a UUID to fetch by ID instead
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const [job] = await db.select().from(jobPostings).where(
      and(
        isId ? eq(jobPostings.id, slug) : eq(jobPostings.slug, slug),
        ...(canViewPrivate ? [] : [eq(jobPostings.status, JOB_STATUS.OPEN)]),
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
    
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'title',
      'title_localized',
      'slug',
      'description',
      'description_localized',
      'requirements',
      'requirements_localized',
      'benefits',
      'benefits_localized',
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
    if (updates.description !== undefined) updates.description = sanitizeRichText(updates.description as string);
    if (updates.requirements !== undefined) updates.requirements = sanitizeRichText(updates.requirements as string);
    if (updates.benefits !== undefined) updates.benefits = sanitizeRichText(updates.benefits as string);
    if (updates.title_localized && typeof updates.title_localized === 'object') {
      const loc = updates.title_localized as { vi?: string };
      if (loc.vi) updates.title = loc.vi;
    }
    if (updates.description_localized && typeof updates.description_localized === 'object') {
      const loc = updates.description_localized as { vi?: string; en?: string; zh?: string };
      if (loc.vi) updates.description = sanitizeRichText(loc.vi);
      updates.description_localized = {
        vi: sanitizeRichText(loc.vi || ''),
        en: sanitizeRichText(loc.en || ''),
        zh: sanitizeRichText(loc.zh || ''),
      };
    }
    if (updates.requirements_localized && typeof updates.requirements_localized === 'object') {
      const loc = updates.requirements_localized as { vi?: string; en?: string; zh?: string };
      if (loc.vi) updates.requirements = sanitizeRichText(loc.vi);
      updates.requirements_localized = {
        vi: sanitizeRichText(loc.vi || ''),
        en: sanitizeRichText(loc.en || ''),
        zh: sanitizeRichText(loc.zh || ''),
      };
    }
    if (updates.benefits_localized && typeof updates.benefits_localized === 'object') {
      const loc = updates.benefits_localized as { vi?: string; en?: string; zh?: string };
      if (loc.vi) updates.benefits = sanitizeRichText(loc.vi);
      updates.benefits_localized = {
        vi: sanitizeRichText(loc.vi || ''),
        en: sanitizeRichText(loc.en || ''),
        zh: sanitizeRichText(loc.zh || ''),
      };
    }
    if (updates.status !== undefined && !isConstantValue(JOB_STATUS_VALUES, updates.status)) {
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
  } catch (error: unknown) {
    console.error("Error updating job:", error);
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      return apiError("A job with this slug already exists", 400);
    }
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_UPDATE] });

export const PUT = PATCH;

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
