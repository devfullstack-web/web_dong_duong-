import { z } from 'zod';
import { PRODUCT_STATUS, PRODUCT_STATUS_VALUES } from '@/constants/content';

/**
 * Product Validation Schemas
 */

// Base product schema
export const productSchema = z.object({
  name: z.string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .max(255, "Tên sản phẩm không được quá 255 ký tự")
    .trim(),
  
  slug: z.string()
    .min(1, "Slug là bắt buộc")
    .max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    .trim(),
  
  description: z.string()
    .min(1, "Mô tả là bắt buộc")
    .trim(),
  
  price: z.union([
    z.number().positive("Giá phải là số dương"),
    z.string().regex(/^\d+\.?\d{0,2}$/, "Giá không hợp lệ")
  ]).transform(val => typeof val === 'string' ? val : val.toString()),
  
  sku: z.string()
    .max(100, "SKU không được quá 100 ký tự")
    .trim()
    .optional(),
  
  stock: z.coerce.number()
    .int("Số lượng phải là số nguyên")
    .min(0, "Số lượng không được âm")
    .default(0),
  
  category_id: z.string()
    .uuid("Category ID phải là UUID hợp lệ"),
  
  status: z.enum(PRODUCT_STATUS_VALUES, {
    message: "Trạng thái phải là 'active' hoặc 'inactive'"
  }).default(PRODUCT_STATUS.ACTIVE),
  
  image_url: z.string()
    .max(255, "Đường dẫn không được quá 255 ký tự")
    .nullable()
    .optional(),
  
  is_featured: z.boolean().default(false),
  
  // JSONB fields
  tech_specs: z.record(z.string(), z.any()).nullable().optional(),
  
  features: z.array(z.string()).nullable().optional(),
  
  gallery: z.array(
    z.string()
  ).nullable().optional(),
  
  tech_summary: z.string().max(5000, "Tóm tắt kỹ thuật quá dài").nullable().optional(),
  
  catalog_url: z.string()
    .max(255)
    .nullable()
    .optional()
    .transform(val => val === "" ? null : val),
  
  warranty: z.string().max(100).nullable().optional(),
  
  origin: z.string().max(255).nullable().optional(),
  
  availability: z.string().max(255).nullable().optional(),
  
  delivery_info: z.string().max(255).nullable().optional(),
});

// Schema for creating product
export const createProductSchema = productSchema;

// Schema for updating product (all fields optional except id)
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid("Product ID phải là UUID hợp lệ")
});

// Schema for query filters
export const productFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  status: z.enum(PRODUCT_STATUS_VALUES).optional(),
  isFeatured: z.string().transform(val => val === 'true').optional(),
  search: z.string().max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeDeleted: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => Math.max(1, parseInt(val) || 1)).optional(),
  limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val) || 12))).optional(),
});

// Type exports
export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
