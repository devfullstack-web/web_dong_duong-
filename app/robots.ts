import type { MetadataRoute } from 'next';

// TODO: Đổi domain nếu khác production
const SITE_URL = 'https://saigonvalve.vn';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal/', '/api/', '/login'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
