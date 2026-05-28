import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'saigonvalve.vn',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'giaiphapnhaxanh.com',
            },
            {
                protocol: 'https',
                hostname: 'vancongnghiepatp.com',
            },
            {
                protocol: 'https',
                hostname: 'vanhanoi.com',
            },
            {
                protocol: 'https',
                hostname: 'www.victaulic.com',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'motion',
            'date-fns',
            'recharts',
            '@radix-ui/react-icons',
        ],
    },
    compress: true,
    poweredByHeader: false,
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'X-DNS-Prefetch-Control',
                    value: 'on',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                {
                    key: 'X-Frame-Options',
                    value: 'SAMEORIGIN',
                },
                {
                    key: 'Permissions-Policy',
                    value: 'camera=(), microphone=(), geolocation=(), payment=()',
                },
                ...(process.env.NODE_ENV === 'production'
                    ? [
                          {
                              key: 'Strict-Transport-Security',
                              value: 'max-age=31536000; includeSubDomains; preload',
                          },
                      ]
                    : []),
            ],
        },
        {
            source: '/api/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'no-store, max-age=0',
                },
            ],
        },
        {
            source: '/images/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
        {
            source: '/uploads/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
        {
            source: '/uploads/cvs/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'private, no-store, max-age=0',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
            ],
        },
        {
            source: '/videos/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
    ],
};

export default withNextIntl(nextConfig);
