import { db } from "@/db";
import { authors } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { NextRequest } from "next/server";
import { PERMISSIONS } from "@/constants/rbac";

// GET /api/authors - List all authors
export async function GET() {
  try {
    const results = await db.select().from(authors);
    return apiResponse(results);
  } catch (error) {
    console.error("Error fetching authors:", error);
    return apiError("Internal Server Error", 500);
  }
}

// POST /api/authors - Create a new author
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, role } = body;

    if (!name) {
      return apiError("Name is required", 400);
    }

    const [newAuthor] = await db.insert(authors).values({
      name,
      role: role || null,
    }).returning();

    return apiResponse(newAuthor, { status: 201 });
  } catch (error) {
    console.error("Error creating author:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.MEDIA_VIEW] });
