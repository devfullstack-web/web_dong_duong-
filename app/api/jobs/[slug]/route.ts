import { db } from "@/db";
import { jobPostings } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";

// GET /api/jobs/[slug] - Get a single job by slug or ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Check if slug is a UUID to fetch by ID instead
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const [job] = await db.select().from(jobPostings).where(
      isId ? eq(jobPostings.id, slug) : eq(jobPostings.slug, slug)
    );

    if (!job) {
      return apiError("Job not found", 404);
    }

    return apiResponse(job);
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
    
    // Prepare updates
    const updates: any = { ...body };
    if (updates.id) delete updates.id;
    if (updates.created_at) delete updates.created_at;
    updates.updated_at = new Date();
    
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
