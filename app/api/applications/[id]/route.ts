import { db } from "@/db";
import { jobApplications, jobPostings } from "@/db/schemas";
import { apiResponse, apiError } from "@/utils/api-response";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { withAuth, UserSession } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";

// GET /api/applications/[id] - View application details
export const GET = withAuth(async (_request: NextRequest, _session, { params }) => {
  try {
    const { id } = await params;
    
    const [application] = await db
      .select({
        id: jobApplications.id,
        job_id: jobApplications.job_id,
        job_title: jobPostings.title,
        full_name: jobApplications.full_name,
        email: jobApplications.email,
        phone: jobApplications.phone,
        cv_url: jobApplications.cv_url,
        cover_letter: jobApplications.cover_letter,
        status: jobApplications.status,
        created_at: jobApplications.created_at,
        updated_at: jobApplications.updated_at,
      })
      .from(jobApplications)
      .leftJoin(jobPostings, eq(jobApplications.job_id, jobPostings.id))
      .where(eq(jobApplications.id, id));

    if (!application) return apiError("Không tìm thấy hồ sơ ứng tuyển", 404);

    return apiResponse(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_VIEW] });

// PATCH /api/applications/[id] - Update application status
export const PATCH = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) return apiError("Trạng thái là bắt buộc", 400);

    const [updated] = await db
      .update(jobApplications)
      .set({ 
        status,
        updated_at: new Date()
      })
      .where(eq(jobApplications.id, id))
      .returning();

    if (!updated) return apiError("Không tìm thấy hồ sơ ứng tuyển", 404);

    return apiResponse(updated);
  } catch (error) {
    console.error("Error updating application:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_UPDATE] });

// DELETE /api/applications/[id] - Delete an application
export const DELETE = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(jobApplications)
      .where(eq(jobApplications.id, id))
      .returning();

    if (!deleted) return apiError("Không tìm thấy hồ sơ ứng tuyển", 404);

    return apiResponse({ message: "Đã xóa hồ sơ ứng tuyển thành công" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.RECRUITMENT_DELETE] });
