import { db } from "@/db";
import { categories, categoryTypes, newsArticles, products, projects } from "@/db/schema";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { NextRequest } from "next/server";
import { PERMISSIONS } from "@/constants/rbac";

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [category] = await db.select().from(categories).where(eq(categories.id, id));

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
    const { name, category_type_id } = body;

    const [updatedCategory] = await db.update(categories)
      .set({ 
        name: name ?? undefined, 
        category_type_id: category_type_id ?? undefined 
      })
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
    if (category.typeName === 'news') {
      const [usage] = await db.select({ id: newsArticles.id }).from(newsArticles)
        .where(and(eq(newsArticles.category_id, id), isNull(newsArticles.deleted_at))).limit(1);
      isInUse = !!usage;
    } else if (category.typeName === 'product') {
      const [usage] = await db.select({ id: products.id }).from(products)
        .where(and(eq(products.category_id, id), isNull(products.deleted_at))).limit(1);
      isInUse = !!usage;
    } else if (category.typeName === 'project') {
      const [usage] = await db.select({ id: projects.id }).from(projects)
        .where(and(eq(projects.category_id, id), isNull(projects.deleted_at))).limit(1);
      isInUse = !!usage;
    }

    if (isInUse) {
      return apiError("Không thể xóa danh mục này vì đang có dữ liệu liên kết với nó. Vui lòng xóa hoặc chuyển các dữ liệu đó sang danh mục khác trước.", 400);
    }

    // Dùng transaction: hard-delete các records đã soft-delete trước (để giải phóng FK),
    // sau đó mới xóa category
    const deletedCategory = await db.transaction(async (tx) => {
      if (category.typeName === 'news') {
        await tx.delete(newsArticles).where(and(eq(newsArticles.category_id, id), isNotNull(newsArticles.deleted_at)));
      } else if (category.typeName === 'product') {
        await tx.delete(products).where(and(eq(products.category_id, id), isNotNull(products.deleted_at)));
      } else if (category.typeName === 'project') {
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
