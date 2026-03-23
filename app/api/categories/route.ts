import { db } from "@/db";
import { categories, categoryTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { NextRequest } from "next/server";
import { PERMISSIONS } from "@/constants/rbac";
import type { LocalizedText } from "@/types/i18n";

// GET /api/categories - List all categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // e.g., 'news', 'product', 'project'

    let query = db.select({
      id: categories.id,
      name: categories.name,
      name_localized: categories.name_localized,
      category_type_id: categories.category_type_id,
      type: categoryTypes.name,
    })
    .from(categories)
    .innerJoin(categoryTypes, eq(categories.category_type_id, categoryTypes.id));

    if (type) {
      // Filter by type name
      const results = await query.where(eq(categoryTypes.name, type));
      return apiResponse(results);
    }

    const results = await query;
    return apiResponse(results);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiError("Internal Server Error", 500);
  }
}

// POST /api/categories - Create a new category
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, name_localized, category_type_id } = body as {
      name?: string;
      name_localized?: LocalizedText;
      category_type_id: string;
    };

    // Support both legacy (name) and new (name_localized) format
    const nameVi = name_localized?.vi || name;
    if (!nameVi || !category_type_id) {
      return apiError("Missing required fields (name or name_localized.vi)", 400);
    }

    const localizedName: LocalizedText = name_localized || { vi: name || '', en: '' };

    const [newCategory] = await db.insert(categories).values({
      name: nameVi, // Keep legacy field populated for backward compatibility
      name_localized: localizedName,
      category_type_id,
    }).returning();

    return apiResponse(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.SYSTEM_MANAGE] });
