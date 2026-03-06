/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,

    serverExternalPackages: ['pg', 'node-cron', 'nodemailer', 'socket.io'],

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

export default nextConfig;
