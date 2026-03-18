import type { MetadataRoute } from 'next';

// TODO: Đổi domain nếu khác production
const SITE_URL = 'https://saigonvalve.vn';

const locales = ['vi', 'en'] as const;
const defaultLocale = 'vi';

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

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? `/${locale}` : `/${locale}`;
      entries.push({
        url: `${SITE_URL}${prefix}${page}`,
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

  // TODO: Khi có server-side API access, thêm dynamic entries cho:
  // - /san-pham/[slug]
  // - /tin-tuc/[slug]
  // - /du-an/[slug]
  // - /tuyen-dung/[slug]

  return entries;
}
