import { z } from 'zod';
import { NEWS_STATUS, NEWS_STATUS_VALUES } from '@/constants/content';

/**
 * News Article Validation Schemas
 */

export const newsArticleSchema = z.object({
  title: z.string()
    .min(1, "Tiêu đề là bắt buộc")
    .max(255, "Tiêu đề không được quá 255 ký tự")
    .trim(),
  
  slug: z.string()
    .min(1, "Slug là bắt buộc")
    .max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    .trim(),
  
  summary: z.string()
    .min(1, "Tóm tắt là bắt buộc")
    .max(1000, "Tóm tắt không được quá 1000 ký tự")
    .trim(),
  
  content: z.string()
    .min(1, "Nội dung là bắt buộc")
    .trim(),
  
  category_id: z.string()
    .uuid("Category ID phải là UUID hợp lệ"),
  
  author_id: z.string()
    .uuid("Author ID phải là UUID hợp lệ")
    .nullable()
    .optional(),
  
  status: z.enum(NEWS_STATUS_VALUES, {
    message: "Trạng thái phải là 'draft' hoặc 'published'"
  }).default(NEWS_STATUS.DRAFT),
  
  image_url: z.string()
    .url("URL hình ảnh không hợp lệ")
    .max(255)
    .nullable()
    .optional(),
  
  gallery: z.array(
    z.string().url("URL trong gallery phải hợp lệ")
  ).nullable().optional(),
  
  published_at: z.string()
    .datetime("Ngày xuất bản không hợp lệ")
    .nullable()
    .optional(),
});

export const createNewsArticleSchema = newsArticleSchema;

export const updateNewsArticleSchema = newsArticleSchema.partial().extend({
  id: z.string().uuid("News ID phải là UUID hợp lệ")
});

export const newsFilterSchema = z.object({
  status: z.enum(NEWS_STATUS_VALUES).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeDeleted: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => Math.max(1, parseInt(val) || 1)).optional(),
  limit: z.string().transform(val => Math.min(100, Math.max(1, parseInt(val) || 10))).optional(),
});

export type NewsArticleInput = z.infer<typeof newsArticleSchema>;
export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type NewsFilterInput = z.infer<typeof newsFilterSchema>;
