import { db } from "@/db";
import { projects, categories } from "@/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { sanitizeRichText } from "@/utils/sanitize";

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/projects/[slug] - Get a single project by slug or ID (Public)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Determine if it's a UUID (ID) or a slug
    const isUUID = UUID_REGEX.test(slug);
    
    const query = db.select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      client_name: projects.client_name,
      start_date: projects.start_date,
      end_date: projects.end_date,
      status: projects.status,
      image_url: projects.image_url,
      gallery: projects.gallery,
      category_id: projects.category_id,
      category: categories.name,
      created_at: projects.created_at,
    })
    .from(projects)
    .innerJoin(categories, eq(projects.category_id, categories.id));

    // Query by ID or slug based on the parameter format
    const [project] = isUUID
      ? await query.where(and(eq(projects.id, slug), isNull(projects.deleted_at)))
      : await query.where(and(eq(projects.slug, slug), isNull(projects.deleted_at)));

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiResponse({
      ...project,
      description: sanitizeRichText(project.description),
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return apiError("Internal Server Error", 500);
  }
}




// PATCH /api/projects/[slug] - Update a project by ID or slug
export const PATCH = withAuth(async (request, session, { params }) => {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Determine if it's a UUID (ID) or a slug
    const isUUID = UUID_REGEX.test(slug);
    
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'name',
      'slug',
      'description',
      'client_name',
      'start_date',
      'end_date',
      'category_id',
      'status',
      'image_url',
      'gallery',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    updates.updated_at = new Date();
    if (updates.description !== undefined) updates.description = sanitizeRichText(updates.description);
    if (updates.start_date) updates.start_date = new Date(updates.start_date);
    if (updates.end_date) updates.end_date = new Date(updates.end_date);
    if (updates.status !== undefined && !['ongoing', 'completed'].includes(updates.status)) {
      return apiError("Invalid status", 400);
    }

    const whereCondition = isUUID ? eq(projects.id, slug) : eq(projects.slug, slug);

    const [updatedProject] = await db.update(projects)
      .set(updates)
      .where(whereCondition)
      .returning();

    if (!updatedProject) {
      return apiError("Project not found", 404);
    }

    return apiResponse(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.PROJECTS_UPDATE] });

// DELETE /api/projects/[slug] - Delete a project by ID or slug
export const DELETE = withAuth(async (request, session, { params }) => {
  try {
    const { slug } = await params;
    
    // Determine if it's a UUID (ID) or a slug  
    const isUUID = UUID_REGEX.test(slug);
    const whereCondition = isUUID ? eq(projects.id, slug) : eq(projects.slug, slug);

    const [deletedProject] = await db.delete(projects)
      .where(whereCondition)
      .returning();

    if (!deletedProject) {
      return apiError("Project not found", 404);
    }

    return apiResponse({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.PROJECTS_DELETE] });

