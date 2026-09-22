import { db } from "@/db";
import { categories, categoryTypes } from "@/db/schemas";
import { eq, asc, and } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { NextRequest } from "next/server";
import { PERMISSIONS } from "@/constants/rbac";
import type { LocalizedText } from "@/types/i18n";
import type { CategoryType } from "@/constants/content";

// GET /api/categories - List all categories (flat with hierarchy info)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as CategoryType | null;
    const showAll = searchParams.get("all") === "true";

    const baseConditions = [];
    if (!showAll) {
      baseConditions.push(eq(categories.is_visible, true));
    }
    if (type) {
      baseConditions.push(eq(categoryTypes.name, type));
    }

    const query = db.select({
      id: categories.id,
      name: categories.name,
      name_localized: categories.name_localized,
      category_type_id: categories.category_type_id,
      type: categoryTypes.name,
      parent_id: categories.parent_id,
      display_order: categories.display_order,
      is_visible: categories.is_visible,
    })
    .from(categories)
    .innerJoin(categoryTypes, eq(categories.category_type_id, categoryTypes.id))
    .where(baseConditions.length > 0 ? and(...baseConditions) : undefined)
    .orderBy(asc(categories.display_order));

    const results = await query;
    const tree = buildCategoryTree(results);
    return apiResponse(tree);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiError("Internal Server Error", 500);
  }
}

interface FlatCategory {
  id: string;
  name: string;
  name_localized: LocalizedText | null;
  category_type_id: string;
  type: string;
  parent_id: string | null;
  display_order: number;
  is_visible: boolean;
}

interface CategoryNode extends FlatCategory {
  children: CategoryNode[];
}

function buildCategoryTree(flatList: FlatCategory[]) {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create map with children array
  for (const item of flatList) {
    map.set(item.id, { ...item, children: [] });
  }

  // Build tree
  for (const item of flatList) {
    const node = map.get(item.id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// POST /api/categories - Create a new category
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, name_localized, category_type_id, parent_id, display_order, is_visible } = body as {
      name?: string;
      name_localized?: LocalizedText;
      category_type_id: string;
      parent_id?: string | null;
      display_order?: number;
      is_visible?: boolean;
      subtitle?: string;
      subtitle_en?: string;
      subtitle_zh?: string;
      image_url?: string;
      icon?: string;
    };

    // Support both legacy (name) and new (name_localized) format
    const nameVi = name_localized?.vi || name;
    if (!nameVi || !category_type_id) {
      return apiError("Missing required fields (name or name_localized.vi)", 400);
    }

    // Validate parent_id if provided
    if (parent_id) {
      const [parentCat] = await db.select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, parent_id));
      if (!parentCat) {
        return apiError("Parent category not found", 400);
      }
    }

    const bodyLoc = (name_localized as Record<string, unknown>) || {};
    const localizedName: Record<string, unknown> = {
      ...bodyLoc,
      vi: nameVi,
      en: typeof bodyLoc.en === 'string' ? bodyLoc.en : '',
      zh: typeof bodyLoc.zh === 'string' ? bodyLoc.zh : '',
      subtitle: body.subtitle !== undefined ? body.subtitle : (typeof bodyLoc.subtitle === 'string' ? bodyLoc.subtitle : ''),
      subtitle_en: body.subtitle_en !== undefined ? body.subtitle_en : (typeof bodyLoc.subtitle_en === 'string' ? bodyLoc.subtitle_en : ''),
      subtitle_zh: body.subtitle_zh !== undefined ? body.subtitle_zh : (typeof bodyLoc.subtitle_zh === 'string' ? bodyLoc.subtitle_zh : ''),
      image_url: body.image_url !== undefined ? body.image_url : (typeof bodyLoc.image_url === 'string' ? bodyLoc.image_url : ''),
      icon: body.icon !== undefined ? body.icon : (typeof bodyLoc.icon === 'string' ? bodyLoc.icon : 'LayoutGrid'),
    };

    const [newCategory] = await db.insert(categories).values({
      name: nameVi,
      name_localized: localizedName as LocalizedText,
      category_type_id,
      parent_id: parent_id || null,
      display_order: display_order ?? 0,
      is_visible: is_visible ?? true,
    }).returning();

    return apiResponse(newCategory, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.SYSTEM_MANAGE] });
