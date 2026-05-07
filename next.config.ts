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
        qualities: [75, 100],
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
};

export default withNextIntl(nextConfig);