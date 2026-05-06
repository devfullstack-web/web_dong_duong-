import type { MetadataRoute } from 'next';
import { db } from '@/db';
import { products, newsArticles, projects, jobPostings } from '@/db/schema';
import { isNull } from 'drizzle-orm';

// TODO: Đổi domain nếu khác production
const SITE_URL = 'https://saigonvalve.vn';

const locales = ['vi', 'en'] as const;

// Danh sách các static pages của site
const staticPages = [
    '',              // Trang chủ
    '/gioi-thieu',
    '/san-pham',
    '/du-an',
    '/tin-tuc',
    '/tuyen-dung',
    '/lien-he',
    '/giai-phap/quan-ly-nuoc-thong-minh',
    '/giai-phap/nong-nghiep-chinh-xac',
    '/giai-phap/quan-trac-nuoi-trong-thuy-san',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    // Static pages
    for (const page of staticPages) {
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}${page}`,
                lastModified: new Date(),
                changeFrequency: page === '' ? 'daily' : 'weekly',
                priority: page === '' ? 1.0 : 0.8,
                alternates: {
                    languages: Object.fromEntries(
                        locales.map((l) => [l, `${SITE_URL}/${l}${page}`])
                    ),
                },
            });
        }
    }

    // Dynamic pages from DB
    const [allProducts, allNews, allProjects, allJobs] = await Promise.all([
        db.select({ slug: products.slug, updated_at: products.updated_at })
            .from(products)
            .where(isNull(products.deleted_at)),
        db.select({ slug: newsArticles.slug, updated_at: newsArticles.updated_at })
            .from(newsArticles)
            .where(isNull(newsArticles.deleted_at)),
        db.select({ slug: projects.slug, updated_at: projects.updated_at })
            .from(projects)
            .where(isNull(projects.deleted_at)),
        db.select({ slug: jobPostings.slug, updated_at: jobPostings.updated_at })
            .from(jobPostings)
            .where(isNull(jobPostings.deleted_at)),
    ]);

    // Products
    for (const item of allProducts) {
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/san-pham/${item.slug}`,
                lastModified: item.updated_at,
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        }
    }

    // News
    for (const item of allNews) {
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/tin-tuc/${item.slug}`,
                lastModified: item.updated_at,
                changeFrequency: 'weekly',
                priority: 0.6,
            });
        }
    }

    // Projects
    for (const item of allProjects) {
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/du-an/${item.slug}`,
                lastModified: item.updated_at,
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        }
    }

    // Jobs
    for (const item of allJobs) {
        for (const locale of locales) {
            entries.push({
                url: `${SITE_URL}/${locale}/tuyen-dung/${item.slug}`,
                lastModified: item.updated_at,
                changeFrequency: 'weekly',
                priority: 0.5,
            });
        }
    }

    return entries;
}
