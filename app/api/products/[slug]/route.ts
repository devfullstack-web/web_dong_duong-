import { db } from "@/db";
import { products } from "@/db/schemas";
import { eq, isNull, and } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/utils/api-response";
import { hasPermission, verifyAuth, withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import type { LocalizedText, LocalizedArray } from "@/types/i18n";
import { sanitizeLocalizedRichText, sanitizeRichText, sanitizeStringArray } from "@/utils/sanitize";

// GET /api/products/[slug] - Get a single product by slug or ID (Public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await verifyAuth(request);
    const canViewPrivate =
      session && hasPermission(session.user, PERMISSIONS.PRODUCTS_VIEW);

    // Check if slug is a UUID to fetch by ID instead
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const [product] = await db.select().from(products).where(
      and(
        isId ? eq(products.id, slug) : eq(products.slug, slug),
        ...(canViewPrivate ? [] : [eq(products.status, 'active')]),
        isNull(products.deleted_at) // Exclude soft deleted
      )
    );

    if (!product) {
      return apiError("Product not found", 404);
    }

    return apiResponse({
      ...product,
      description: sanitizeRichText(product.description),
      description_localized: sanitizeLocalizedRichText(product.description_localized),
      features: sanitizeStringArray(product.features),
      features_localized: product.features_localized
        ? {
            ...product.features_localized,
            vi: sanitizeStringArray(product.features_localized.vi),
            en: sanitizeStringArray(product.features_localized.en),
          }
        : product.features_localized,
    });
  } catch {
    return apiError("Internal Server Error", 500);
  }
}


// PATCH /api/products/[id] - Update a product
export const PATCH = withAuth(async (request, session, { params }) => {
  try {
    const { slug: id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'name',
      'name_localized',
      'slug',
      'description',
      'description_localized',
      'price',
      'sku',
      'stock',
      'category_id',
      'status',
      'image_url',
      'is_featured',
      'tech_specs',
      'tech_specs_localized',
      'features',
      'features_localized',
      'gallery',
      'tech_summary',
      'tech_summary_localized',
      'catalog_url',
      'warranty',
      'origin',
      'availability',
      'delivery_info',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    updates.updated_at = new Date();

    // Ensure price is string if provided
    if (updates.price !== undefined && updates.price !== null) {
      updates.price = updates.price.toString();
    }

    // Sync localized fields with legacy fields
    if (updates.name_localized) {
      const nameLocalized = updates.name_localized as LocalizedText;
      if (nameLocalized.vi) {
        updates.name = nameLocalized.vi;
      }
    }

    if (updates.description_localized) {
      const descLocalized = sanitizeLocalizedRichText(updates.description_localized as LocalizedText);
      updates.description_localized = descLocalized;
      if (descLocalized.vi) {
        updates.description = descLocalized.vi;
      }
    }

    if (updates.description !== undefined) {
      updates.description = sanitizeRichText(updates.description);
    }

    if (updates.tech_summary_localized) {
      const techSummaryLocalized = updates.tech_summary_localized as LocalizedText;
      if (techSummaryLocalized.vi) {
        updates.tech_summary = sanitizeRichText(techSummaryLocalized.vi);
      }
    }

    if (updates.tech_summary !== undefined) {
      updates.tech_summary = sanitizeRichText(updates.tech_summary);
    }

    if (updates.features_localized) {
      const featuresLocalized = updates.features_localized as LocalizedArray;
      updates.features_localized = {
        ...featuresLocalized,
        vi: sanitizeStringArray(featuresLocalized.vi),
        en: sanitizeStringArray(featuresLocalized.en),
      };
      if (featuresLocalized.vi) {
        updates.features = sanitizeStringArray(featuresLocalized.vi);
      }
    }

    if (updates.features !== undefined) {
      updates.features = sanitizeStringArray(updates.features);
    }

    if (updates.status !== undefined && !['active', 'inactive'].includes(updates.status as string)) {
      return apiError("Invalid status", 400);
    }

    if (updates.tech_specs_localized) {
      // Tech specs localized - legacy tech_specs should already be provided by frontend
      // Just ensure it's saved to the database
    }

    const [updatedProduct] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return apiError("Product not found", 404);
    }

    return apiResponse(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.PRODUCTS_UPDATE] });

// DELETE /api/products/[id] - Soft delete a product
export const DELETE = withAuth(async (request, session, { params }) => {
  try {
    const { slug: id } = await params;
    
    // Soft delete: set deleted_at timestamp
    const [deletedProduct] = await db.update(products)
      .set({ 
        deleted_at: new Date(),
        updated_at: new Date() 
      })
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      return apiError("Product not found", 404);
    }

    return apiResponse({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.PRODUCTS_DELETE] });
