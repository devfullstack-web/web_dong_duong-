import { db } from '@/db';
import { products, categories } from '@/db/schemas';
import { eq, desc, sql, and, or, ilike, gte, lte, isNull } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { calculateOffset, createPaginationMeta } from '@/utils/pagination';
import { createProductSchema, productFilterSchema } from '@/validations/product.schema';
import {
    validateQuery,
    withAuth,
    withHybridAuth,
    hasPermission,
} from '@/middlewares/middleware';
import { ZodError } from 'zod';
import { PERMISSIONS } from '@/constants/rbac';
import type { LocalizedText, LocalizedArray } from '@/types/i18n';
import { sanitizeLocalizedRichText, sanitizeRichText, sanitizeStringArray } from '@/utils/sanitize';
import { PRODUCT_STATUS } from '@/constants/content';

// GET /api/products - List products with pagination (Public/Protected Hybrid)
export const GET = withHybridAuth(
    async (request, session) => {
        try {
            const { searchParams } = new URL(request.url);

            // Validate query parameters
            const filterValidation = validateQuery(searchParams, productFilterSchema);
            if (filterValidation instanceof Response) {
                return filterValidation;
            }

            const {
                categoryId,
                isFeatured,
                search,
                startDate,
                endDate,
                page = 1,
                limit = 12,
            } = filterValidation;

            let { status, includeDeleted } = filterValidation;

            // Authorization protection
            const isAuthorized =
                session &&
                hasPermission(session.user, PERMISSIONS.PRODUCTS_VIEW);
            if (!isAuthorized) {
                status = PRODUCT_STATUS.ACTIVE;
                includeDeleted = false;
            }

            const offset = calculateOffset(page, limit);

            // Build where conditions
            const conditions = [];

            // Soft delete filter
            if (!includeDeleted) {
                conditions.push(isNull(products.deleted_at));
            }

            // For public (unauthorized) users, only show products with visible categories
            if (!isAuthorized) {
                conditions.push(eq(categories.is_visible, true));
            }
            if (categoryId) {
                conditions.push(eq(products.category_id, categoryId));
            }
            if (status) {
                conditions.push(eq(products.status, status));
            }
            if (isFeatured) {
                conditions.push(eq(products.is_featured, true));
            }
            if (search) {
                conditions.push(
                    or(
                        ilike(products.name, `%${search}%`),
                        ilike(products.sku, `%${search}%`),
                        ilike(sql<string>`(${products.name_localized}->>'vi')`, `%${search}%`),
                        ilike(sql<string>`(${products.name_localized}->>'en')`, `%${search}%`),
                        ilike(sql<string>`(${products.name_localized}->>'zh')`, `%${search}%`),
                    ),
                );
            }
            if (startDate) {
                conditions.push(gte(products.created_at, new Date(startDate)));
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push(lte(products.created_at, end));
            }

            // Count total items
            const baseCountQuery = db
                .select({ count: sql<number>`count(*)` })
                .from(products)
                .innerJoin(categories, eq(products.category_id, categories.id));
            const [{ count: total }] = await (conditions.length > 0
                ? baseCountQuery.where(and(...conditions))
                : baseCountQuery);

            // Build main query with pagination
            let query = db
                .select({
                    id: products.id,
                    name: products.name,
                    name_localized: products.name_localized,
                    slug: products.slug,
                    price: products.price,
                    sku: products.sku,
                    stock: products.stock,
                    status: products.status,
                    image_url: products.image_url,
                    is_featured: products.is_featured,
                    tech_specs: products.tech_specs,
                    tech_specs_localized: products.tech_specs_localized,
                    features: products.features,
                    features_localized: products.features_localized,
                    gallery: products.gallery,
                    tech_summary: products.tech_summary,
                    tech_summary_localized: products.tech_summary_localized,
                    description_localized: products.description_localized,
                    catalog_url: products.catalog_url,
                    warranty: products.warranty,
                    origin: products.origin,
                    availability: products.availability,
                    delivery_info: products.delivery_info,
                    category: categories.name,
                    category_localized: categories.name_localized,
                })
                .from(products)
                .innerJoin(categories, eq(products.category_id, categories.id))
                .orderBy(desc(products.created_at))
                .limit(limit)
                .offset(offset);

            if (conditions.length > 0) {
                // @ts-expect-error - Drizzle type issue with dynamic conditions
                query = query.where(and(...conditions));
            }

            const results = (await query).map((product) => ({
                ...product,
                description_localized: sanitizeLocalizedRichText(product.description_localized),
                features: sanitizeStringArray(product.features),
                features_localized: {
                    ...(product.features_localized || {}),
                    vi: sanitizeStringArray(product.features_localized?.vi),
                    en: sanitizeStringArray(product.features_localized?.en),
                    zh: sanitizeStringArray(product.features_localized?.zh),
                },
            }));

            return apiResponse(results, {
                meta: createPaginationMeta(page, limit, Number(total)),
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.PRODUCTS_VIEW], publicStatuses: [PRODUCT_STATUS.ACTIVE] },
);

// POST /api/products - Create a new product
export const POST = withAuth(
    async (request) => {
        try {
            // Get raw body first to extract localized fields
            const rawBody = await request.json();

            // Extract localized fields before validation
            const localizedFields: {
                name_localized?: LocalizedText;
                description_localized?: LocalizedText;
                tech_summary_localized?: LocalizedText;
                features_localized?: LocalizedArray;
                tech_specs_localized?: Record<string, unknown>;
            } = {};

            if (rawBody.name_localized) {
                localizedFields.name_localized = rawBody.name_localized;
                // Use Vietnamese as fallback for legacy field
                if (!rawBody.name && rawBody.name_localized.vi) {
                    rawBody.name = rawBody.name_localized.vi;
                }
            }

            if (rawBody.description_localized) {
                rawBody.description_localized = sanitizeLocalizedRichText(rawBody.description_localized);
                localizedFields.description_localized = rawBody.description_localized;
                if (!rawBody.description && rawBody.description_localized.vi) {
                    rawBody.description = rawBody.description_localized.vi;
                }
            }

            if (rawBody.tech_summary_localized) {
                localizedFields.tech_summary_localized = rawBody.tech_summary_localized;
                if (!rawBody.tech_summary && rawBody.tech_summary_localized.vi) {
                    rawBody.tech_summary = rawBody.tech_summary_localized.vi;
                }
            }

            if (rawBody.features_localized) {
                rawBody.features_localized = {
                    ...rawBody.features_localized,
                    vi: sanitizeStringArray(rawBody.features_localized.vi),
                    en: sanitizeStringArray(rawBody.features_localized.en),
                    zh: sanitizeStringArray(rawBody.features_localized.zh),
                };
                localizedFields.features_localized = rawBody.features_localized;
                if (!rawBody.features && rawBody.features_localized.vi) {
                    rawBody.features = rawBody.features_localized.vi;
                }
            }

            if (rawBody.tech_specs_localized) {
                localizedFields.tech_specs_localized = rawBody.tech_specs_localized;
                // Legacy tech_specs should already be set from the frontend
            }

            // Validate with schema (using legacy fields)
            const parseResult = createProductSchema.safeParse(rawBody);
            if (!parseResult.success) {
                return apiError('Validation failed', 400, { errors: parseResult.error.issues });
            }

            const dataOrError = parseResult.data;
            dataOrError.description = sanitizeRichText(dataOrError.description);
            if (dataOrError.tech_summary) {
                dataOrError.tech_summary = sanitizeRichText(dataOrError.tech_summary);
            }
            if (dataOrError.features) {
                dataOrError.features = sanitizeStringArray(dataOrError.features) as string[];
            }

            // Auto-generate SKU if not provided
            if (!dataOrError.sku) {
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                dataOrError.sku = `SGV-${timestamp}-${random}`;
            }

            const sku = dataOrError.sku as string;

            // Check for duplicate SKU
            const existingSku = await db
                .select()
                .from(products)
                .where(eq(products.sku, dataOrError.sku))
                .limit(1);

            if (existingSku.length > 0) {
                return apiError('SKU already exists', 409);
            }

            // Check for duplicate slug
            const existingSlug = await db
                .select()
                .from(products)
                .where(eq(products.slug, dataOrError.slug))
                .limit(1);

            if (existingSlug.length > 0) {
                return apiError('Slug already exists', 409);
            }

            // Verify category exists
            const [category] = await db
                .select()
                .from(categories)
                .where(eq(categories.id, dataOrError.category_id))
                .limit(1);

            if (!category) {
                return apiError('Category not found', 404);
            }

            // Merge localized fields with validated data
            const insertData = {
                ...dataOrError,
                sku,
                ...localizedFields,
            };

            const [newProduct] = await db.insert(products).values(insertData).returning();

            return apiResponse(newProduct, { status: 201 });
        } catch (error) {
            if (error instanceof ZodError) {
                return apiError('Validation failed', 400, { errors: error.issues });
            }

            // Handle database constraint errors
            if ((error as { code?: string }).code === '23505') {
                // Unique violation
                return apiError('Duplicate value - SKU or Slug already exists', 409);
            }
            if ((error as { code?: string }).code === '23503') {
                // Foreign key violation
                return apiError('Invalid category_id', 404);
            }

            console.error('Error creating product:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.PRODUCTS_CREATE] },
);
