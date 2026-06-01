import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { newsArticles, authors, categories } from '@/db/schemas';
import { eq, and, isNull, ne, desc } from 'drizzle-orm';
import { COMPANY_INFO } from '@/constants/site-info';
import NewsDetailClient from './_components/NewsDetailClient';
import { sanitizePlainText, sanitizeRichText } from '@/utils/sanitize';
import { NEWS_STATUS } from '@/constants/content';
import { getLocalizedValue, type Locale } from '@/types/i18n';

type PageProps = {
    params: Promise<{ slug: string; locale: string }>;
};

const getArticle = cache(async (slug: string) => {
    const [article] = await db
        .select({
            id: newsArticles.id,
            title: newsArticles.title,
            title_localized: newsArticles.title_localized,
            slug: newsArticles.slug,
            summary: newsArticles.summary,
            summary_localized: newsArticles.summary_localized,
            content: newsArticles.content,
            content_localized: newsArticles.content_localized,
            category_id: newsArticles.category_id,
            status: newsArticles.status,
            image_url: newsArticles.image_url,
            gallery: newsArticles.gallery,
            published_at: newsArticles.published_at,
            created_at: newsArticles.created_at,
            author_name: authors.name,
            category_name: categories.name,
        })
        .from(newsArticles)
        .leftJoin(authors, eq(newsArticles.author_id, authors.id))
        .leftJoin(categories, eq(newsArticles.category_id, categories.id))
        .where(
            and(
                eq(newsArticles.slug, slug),
                eq(newsArticles.status, NEWS_STATUS.PUBLISHED),
                isNull(newsArticles.deleted_at),
            ),
        );

    return article
        ? {
              ...article,
              summary: sanitizePlainText(article.summary, 1000),
              content: sanitizeRichText(article.content),
          }
        : null;
});

async function getRelatedArticles(slug: string) {
    return db
        .select({
            id: newsArticles.id,
            title: newsArticles.title,
            title_localized: newsArticles.title_localized,
            slug: newsArticles.slug,
            summary: newsArticles.summary,
            summary_localized: newsArticles.summary_localized,
            image_url: newsArticles.image_url,
            published_at: newsArticles.published_at,
            category_name: categories.name,
        })
        .from(newsArticles)
        .leftJoin(categories, eq(newsArticles.category_id, categories.id))
        .where(
            and(
                ne(newsArticles.slug, slug),
                eq(newsArticles.status, NEWS_STATUS.PUBLISHED),
                isNull(newsArticles.deleted_at),
            ),
        )
        .orderBy(desc(newsArticles.published_at))
        .limit(5);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    const article = await getArticle(slug);

    if (!article) {
        return { title: 'Không tìm thấy bài viết' };
    }

    const activeTitle = getLocalizedValue(article.title_localized, locale as Locale) || article.title;
    const activeSummary = getLocalizedValue(article.summary_localized, locale as Locale) || article.summary;

    return {
        title: activeTitle,
        description: activeSummary,
        openGraph: {
            title: `${activeTitle} | ${COMPANY_INFO.name}`,
            description: activeSummary,
            type: 'article',
            publishedTime: article.published_at?.toISOString(),
            authors: article.author_name ? [article.author_name] : undefined,
            images: article.image_url ? [{ url: article.image_url }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: activeTitle,
            description: activeSummary,
            images: article.image_url ? [article.image_url] : undefined,
        },
    };
}

export default async function NewsDetailPage({ params }: PageProps) {
    const { slug, locale } = await params;
    const [article, relatedArticles] = await Promise.all([
        getArticle(slug),
        getRelatedArticles(slug),
    ]);

    if (!article) {
        notFound();
    }

    const activeContent = getLocalizedValue(article.content_localized, locale as Locale) || article.content;
    const activeTitle = getLocalizedValue(article.title_localized, locale as Locale) || article.title;
    const activeSummary = getLocalizedValue(article.summary_localized, locale as Locale) || article.summary;

    // Compute readTime server-side
    const wordCount = (activeContent || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTimeSuffix = locale === 'vi' ? 'phút' : 'min';
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} ${readTimeSuffix}`;

    const articleWithMeta = {
        ...article,
        title: activeTitle,
        summary: activeSummary,
        content: activeContent,
        author: article.author_name || (locale === 'vi' ? 'Sài Gòn Valve' : 'Saigon Valve'),
        category: article.category_name || (locale === 'vi' ? 'Tin tức' : 'News'),
        readTime,
    };

    return (
        <NewsDetailClient
            article={articleWithMeta}
            relatedArticles={relatedArticles}
            recentArticles={relatedArticles}
        />
    );
}
