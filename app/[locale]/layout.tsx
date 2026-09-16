import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import ApiProvider from '@/components/providers/api-provider';
import { Toaster } from '@/components/ui/sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { COMPANY_INFO } from '@/constants/site-info';
import { Bai_Jamjuree } from 'next/font/google';


const baiJamjuree = Bai_Jamjuree({
    subsets: ['vietnamese', 'latin'],
    weight: ['200', '300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-bai-jamjuree',
    preload: false,
});


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#004395',
};

// TODO: Thay giá trị placeholder phù hợp với thực tế:
// - OG Image: upload ảnh 1200x630 tại /public/images/og-default.png
// - Twitter handle: xác nhận @saigonvalve là đúng
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const defaultTitle = isZh
        ? `${COMPANY_INFO.shortName} 集团 | 高端陶瓷岩板与商用中央空调工程总代理`
        : isEn
        ? `${COMPANY_INFO.name} | Architectural Tiles & Commercial HVAC Chiller Systems`
        : `${COMPANY_INFO.name} | Gạch Men & Máy Lạnh Điều Hòa VRV-Chiller`;

    const description = isZh
        ? '东洋集团 (Dong Duong Corp) - 越南国家品牌高端陶瓷岩板、格力美的商用多联机中央空调与螺杆离心冷水机组一级授权工程总代理。'
        : isEn
        ? 'Dong Duong Corporation - Premier distributor of architectural ceramic tiles, VRV/VRF central HVAC, and industrial Chiller cooling systems in Vietnam.'
        : COMPANY_INFO.slogan;

    const keywords = isZh
        ? ['东洋集团', '瓷砖', '岩板', '董心', '维格拉塞拉', '中央空调', 'VRV', 'VRF', '冷水机', '格力', '美的', 'VNSTEEL']
        : isEn
        ? ['Dong Duong Corporation', 'Ceramic Tiles', 'Porcelain Granite', 'Big Slab', 'Central HVAC', 'VRV', 'VRF', 'Chiller', 'Gree', 'Midea', 'VNSTEEL']
        : [
            'Đông Dương Corporation',
            'Đông Dương',
            'Gạch men',
            'Gạch trang trí',
            'Đồng Tâm',
            'Viglacera',
            'Catalan',
            'Thuận Hải',
            'Hà Thanh',
            'Máy lạnh',
            'Điều hòa',
            'Điều hòa trung tâm',
            'VRV',
            'VRF',
            'Chiller',
            'Điều hòa cục bộ',
            'Gree',
            'Midea',
            'VNSTEEL',
            'Thép xây dựng',
            'Centrifugal Chiller',
            'Screw Chiller',
            'Gạch ốp lát',
        ];

    return {
        metadataBase: new URL(COMPANY_INFO.website),
        title: {
            default: defaultTitle,
            template: `%s | ${COMPANY_INFO.name}`,
        },
        description,
        keywords,
        icons: {
            icon: [
                { url: '/favicon.ico', sizes: 'any' },
                { url: '/icon.png', type: 'image/png', sizes: '512x512' },
            ],
            shortcut: '/favicon.ico',
            apple: '/icon.png',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: isZh ? 'zh_CN' : isEn ? 'en_US' : 'vi_VN',
            alternateLocale: isZh ? ['vi_VN', 'en_US'] : isEn ? ['vi_VN', 'zh_CN'] : ['en_US', 'zh_CN'],
            siteName: COMPANY_INFO.name,
            title: defaultTitle,
            description,
            url: COMPANY_INFO.website,
            images: [
                {
                    url: '/images/dongduong/hero-building.png',
                    width: 1200,
                    height: 630,
                    alt: COMPANY_INFO.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: defaultTitle,
            description,
            images: ['/images/dongduong/hero-building.png'],
            creator: '@dongduongcorp',
        },
        alternates: {
            canonical: `${COMPANY_INFO.website}/${locale}`,
        },
    };
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as "vi" | "en" | "zh")) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning className={baiJamjuree.variable}>
            <body
                suppressHydrationWarning
                className="antialiased font-sans bg-background text-foreground"
            >
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ApiProvider>
                            {children}
                            <Toaster position="top-right" richColors />
                        </ApiProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
