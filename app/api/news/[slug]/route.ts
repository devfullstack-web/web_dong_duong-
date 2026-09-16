import { db } from "@/db";
import { newsArticles, categories, authors } from "@/db/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { apiResponse, apiError } from "@/utils/api-response";
import { hasPermission, verifyAuth, withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { ARTICLE } from "@/constants/app";
import { sanitizePlainText, sanitizeRichText } from "@/utils/sanitize";
import { NEWS_STATUS, NEWS_STATUS_VALUES, isConstantValue } from "@/constants/content";

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/news/[slug] - Get a single article by slug or ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isUUID = UUID_REGEX.test(slug);
    const session = await verifyAuth(request);
    const canViewPrivate =
      session && hasPermission(session.user, PERMISSIONS.BLOG_VIEW);
    
    const whereCondition = and(
      isUUID ? eq(newsArticles.id, slug) : eq(newsArticles.slug, slug),
      ...(canViewPrivate ? [] : [eq(newsArticles.status, NEWS_STATUS.PUBLISHED), isNull(newsArticles.deleted_at)])
    );
    
    const [article] = await db.select({
      id: newsArticles.id,
      title: newsArticles.title,
      title_localized: newsArticles.title_localized,
      slug: newsArticles.slug,
      summary: newsArticles.summary,
      summary_localized: newsArticles.summary_localized,
      content: newsArticles.content,
      content_localized: newsArticles.content_localized,
      status: newsArticles.status,
      image_url: newsArticles.image_url,
      gallery: newsArticles.gallery,
      published_at: newsArticles.published_at,
      created_at: newsArticles.created_at,
      updated_at: newsArticles.updated_at,
      category_id: newsArticles.category_id,
      category: categories.name,
      category_localized: categories.name_localized,
      author_id: newsArticles.author_id,
      author: authors.name,
    })
    .from(newsArticles)
    .leftJoin(categories, eq(newsArticles.category_id, categories.id))
    .leftJoin(authors, eq(newsArticles.author_id, authors.id))
    .where(whereCondition);

    if (!article) {
      return apiError("Article not found", 404);
    }

    // Add derived fields
    const wordCount = article.content ? article.content.split(/\s+/).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / ARTICLE.WORDS_PER_MINUTE));

    const transformedArticle = {
      ...article,
      summary: sanitizePlainText(article.summary, 1000),
      content: sanitizeRichText(article.content),
      readTime: `${readTimeMinutes} ${ARTICLE.READ_TIME_SUFFIX}`,
      category: article.category || ARTICLE.DEFAULT_CATEGORY,
      author: article.author || ARTICLE.DEFAULT_AUTHOR,
      image_url: article.image_url || ARTICLE.FALLBACK_IMAGE,
    };

    return apiResponse(transformedArticle);
  } catch (error) {
    console.error("Error fetching article:", error);
    return apiError("Internal Server Error", 500);
  }
}

// PATCH /api/news/[slug] - Update an article by ID or slug
export const PATCH = withAuth(async (request, session, { params }) => {
  try {
    const { slug } = await params;
    const body = await request.json();
    const isUUID = UUID_REGEX.test(slug);
    
    // Prepare updates
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'title',
      'title_localized',
      'slug',
      'summary',
      'summary_localized',
      'content',
      'content_localized',
      'category_id',
      'author_id',
      'status',
      'published_at',
      'image_url',
      'gallery',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    if (typeof updates.summary === 'string') {
      updates.summary = sanitizePlainText(updates.summary, 1000);
    }

    if (typeof updates.content === 'string') {
      updates.content = sanitizeRichText(updates.content);
    }

    if (updates.title_localized && typeof updates.title_localized === 'object') {
      const loc = updates.title_localized as { vi?: string };
      if (loc.vi) updates.title = loc.vi;
    }

    if (updates.summary_localized && typeof updates.summary_localized === 'object') {
      const loc = updates.summary_localized as { vi?: string };
      if (loc.vi) updates.summary = sanitizePlainText(loc.vi, 1000);
    }

    if (updates.content_localized && typeof updates.content_localized === 'object') {
      const loc = updates.content_localized as { vi?: string; en?: string; zh?: string };
      if (loc.vi) updates.content = sanitizeRichText(loc.vi);
      updates.content_localized = {
        vi: sanitizeRichText(loc.vi || ''),
        en: sanitizeRichText(loc.en || ''),
        zh: sanitizeRichText(loc.zh || ''),
      };
    }

    if (
      updates.status !== undefined &&
      !isConstantValue(NEWS_STATUS_VALUES, updates.status)
    ) {
      return apiError("Invalid status", 400);
    }

    updates.updated_at = new Date();

    if (updates.published_at) {
      if (
        typeof updates.published_at !== 'string' &&
        typeof updates.published_at !== 'number' &&
        !(updates.published_at instanceof Date)
      ) {
        return apiError("Invalid publish date", 400);
      }

      updates.published_at = new Date(updates.published_at);
    }

    const whereCondition = isUUID ? eq(newsArticles.id, slug) : eq(newsArticles.slug, slug);
    const [updatedArticle] = await db.update(newsArticles)
      .set(updates)
      .where(whereCondition)
      .returning();

    if (!updatedArticle) {
       return apiError("Article not found", 404);
    }

    return apiResponse(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.BLOG_UPDATE] });

export const PUT = PATCH;

// DELETE /api/news/[slug] - Delete an article by ID or slug
export const DELETE = withAuth(async (request, session, { params }) => {
  try {
    const { slug } = await params;
    const isUUID = UUID_REGEX.test(slug);
    
    const whereCondition = isUUID ? eq(newsArticles.id, slug) : eq(newsArticles.slug, slug);
    const [deletedArticle] = await db.delete(newsArticles)
      .where(whereCondition)
      .returning();

    if (!deletedArticle) {
      return apiError("Article not found", 404);
    }

    return apiResponse({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return apiError("Internal Server Error", 500);
  }
}, { requiredPermissions: [PERMISSIONS.BLOG_DELETE] });
