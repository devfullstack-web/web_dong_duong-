import type { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/constants/site-info';

const SITE_URL = COMPANY_INFO.website;

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
