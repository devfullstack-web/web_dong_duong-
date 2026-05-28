import { db } from "@/db";
import { newsArticles, categories, authors } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { apiResponse, apiError } from "@/utils/api-response";
import { withAuth } from "@/middlewares/middleware";
import { PERMISSIONS } from "@/constants/rbac";
import { ARTICLE } from "@/constants/app";

// UUID regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/news/[slug] - Get a single article by slug or ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isUUID = UUID_REGEX.test(slug);
    
    const whereCondition = isUUID ? eq(newsArticles.id, slug) : eq(newsArticles.slug, slug);
    
    const [article] = await db.select({
      id: newsArticles.id,
      title: newsArticles.title,
      slug: newsArticles.slug,
      summary: newsArticles.summary,
      content: newsArticles.content,
      status: newsArticles.status,
      image_url: newsArticles.image_url,
      gallery: newsArticles.gallery,
      published_at: newsArticles.published_at,
      created_at: newsArticles.created_at,
      updated_at: newsArticles.updated_at,
      category_id: newsArticles.category_id,
      category: categories.name,
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
    const updates: any = { ...body };
    if (updates.id) delete updates.id;
    if (updates.category) delete updates.category;
    if (updates.author) delete updates.author;
    if (updates.created_at) delete updates.created_at;
    updates.updated_at = new Date();
    if (updates.published_at) updates.published_at = new Date(updates.published_at);

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

