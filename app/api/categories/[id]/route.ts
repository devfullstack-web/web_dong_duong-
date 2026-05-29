import { db } from "@/db";
import { categories, categoryTypes, newsArticles, products, projects } from "@/db/schemas";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { NextRequest } from "next/server";
import { PERMISSIONS } from "@/constants/rbac";
import type { LocalizedText } from "@/types/i18n";
import { CATEGORY_TYPE } from "@/constants/content";

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [category] = await db.select({
      id: categories.id,
      name: categories.name,
      name_localized: categories.name_localized,
      category_type_id: categories.category_type_id,
      parent_id: categories.parent_id,
      display_order: categories.display_order,
      is_visible: categories.is_visible,
    }).from(categories).where(eq(categories.id, id));

    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiResponse(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return apiError("Internal Server Error", 500);
  }
}

// PATCH /api/categories/[id] - Update a category
export const PATCH = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, name_localized, category_type_id, parent_id, display_order, is_visible } = body as {
      name?: string;
      name_localized?: LocalizedText;
      category_type_id?: string;
      parent_id?: string | null;
      display_order?: number;
      is_visible?: boolean;
    };

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (name_localized) {
      updateData.name_localized = name_localized;
      updateData.name = name_localized.vi; // Keep legacy field in sync
    } else if (name) {
      updateData.name = name;
    }

    if (category_type_id) {
      updateData.category_type_id = category_type_id;
    }

    // Handle parent_id - allow setting to null (root) or a valid parent
    if (parent_id !== undefined) {
      if (parent_id && parent_id === id) {
        return apiError("A category cannot be its own parent", 400);
      }
      if (parent_id) {
        const [parentCat] = await db.select({ id: categories.id })
          .from(categories)
          .where(eq(categories.id, parent_id));
        if (!parentCat) {
          return apiError("Parent category not found", 400);
        }
      }
      updateData.parent_id = parent_id || null;
    }

    if (display_order !== undefined) {
      updateData.display_order = display_order;
    }

    if (is_visible !== undefined) {
      updateData.is_visible = is_visible;
    }

    const [updatedCategory] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      return apiError("Category not found", 404);
    }

    return apiResponse(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.CMS_UPDATE] });

// DELETE /api/categories/[id] - Delete a category
export const DELETE = withAuth(async (request: NextRequest, session, { params }) => {
  try {
    const { id } = await params;

    // Lấy category kèm type name để chỉ check đúng bảng liên quan
    const [category] = await db
      .select({ id: categories.id, typeName: categoryTypes.name })
      .from(categories)
      .leftJoin(categoryTypes, eq(categories.category_type_id, categoryTypes.id))
      .where(eq(categories.id, id));

    if (!category) {
      return apiError("Category not found", 404);
    }

    // Chỉ check bảng tương ứng với loại danh mục, bỏ qua records đã soft delete
    let isInUse = false;
    if (category.typeName === CATEGORY_TYPE.NEWS) {
      const [usage] = await db.select({ id: newsArticles.id }).from(newsArticles)
        .where(and(eq(newsArticles.category_id, id), isNull(newsArticles.deleted_at))).limit(1);
      isInUse = !!usage;
    } else if (category.typeName === CATEGORY_TYPE.PRODUCT) {
      const [usage] = await db.select({ id: products.id }).from(products)
        .where(and(eq(products.category_id, id), isNull(products.deleted_at))).limit(1);
      isInUse = !!usage;
    } else if (category.typeName === CATEGORY_TYPE.PROJECT) {
      const [usage] = await db.select({ id: projects.id }).from(projects)
        .where(and(eq(projects.category_id, id), isNull(projects.deleted_at))).limit(1);
      isInUse = !!usage;
    }

    if (isInUse) {
      return apiError("Không thể xóa danh mục này vì đang có dữ liệu liên kết với nó. Vui lòng xóa hoặc chuyển các dữ liệu đó sang danh mục khác trước.", 400);
    }

    // Dùng transaction: reassign children, hard-delete soft-deleted records, then delete category
    const deletedCategory = await db.transaction(async (tx) => {
      // Reassign children to parent's parent (or root)
      const [cat] = await tx.select({ parent_id: categories.parent_id })
        .from(categories).where(eq(categories.id, id));
      await tx.update(categories)
        .set({ parent_id: cat?.parent_id || null })
        .where(eq(categories.parent_id, id));

      if (category.typeName === CATEGORY_TYPE.NEWS) {
        await tx.delete(newsArticles).where(and(eq(newsArticles.category_id, id), isNotNull(newsArticles.deleted_at)));
      } else if (category.typeName === CATEGORY_TYPE.PRODUCT) {
        await tx.delete(products).where(and(eq(products.category_id, id), isNotNull(products.deleted_at)));
      } else if (category.typeName === CATEGORY_TYPE.PROJECT) {
        await tx.delete(projects).where(and(eq(projects.category_id, id), isNotNull(projects.deleted_at)));
      }

      const [deleted] = await tx.delete(categories)
        .where(eq(categories.id, id))
        .returning();
      return deleted;
    });

    if (!deletedCategory) {
      return apiError("Category not found", 404);
    }

    return apiResponse({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.CMS_DELETE] });
