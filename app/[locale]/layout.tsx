import type { Metadata } from "next";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ApiProvider from "@/components/providers/api-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { COMPANY_INFO } from '@/constants/site-info';

// TODO: Thay giá trị placeholder phù hợp với thực tế:
// - OG Image: upload ảnh 1200x630 tại /public/images/og-default.png
// - Twitter handle: xác nhận @saigonvalve là đúng
export const metadata: Metadata = {
  metadataBase: new URL(COMPANY_INFO.website),
  title: {
    default: `${COMPANY_INFO.name} | Giải pháp công nghiệp chuyên nghiệp`,
    template: `%s | ${COMPANY_INFO.name}`,
  },
  description: COMPANY_INFO.slogan,
  keywords: [
    "Sài Gòn Valve", "Van công nghiệp", "Giải pháp IoT", "Ngành nước",
    "Thiết bị đường ống", "SCADA", "Quan trắc nước", "Van cổng", "Van bướm",
    "Phụ kiện đường ống", "Saigon Valve",
  ],
  icons: {
    icon: "/images/logo/logo.png",
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
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    siteName: COMPANY_INFO.name,
    title: `${COMPANY_INFO.name} | Giải pháp công nghiệp chuyên nghiệp`,
    description: COMPANY_INFO.slogan,
    url: COMPANY_INFO.website,
    images: [
      {
        url: '/images/og-default.png', // TODO: Upload ảnh OG mặc định 1200x630
        width: 1200,
        height: 630,
        alt: COMPANY_INFO.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY_INFO.name} | Giải pháp công nghiệp chuyên nghiệp`,
    description: COMPANY_INFO.slogan,
    images: ['/images/og-default.png'], // TODO: Upload ảnh OG mặc định 1200x630
    creator: '@saigonvalve', // TODO: Xác nhận Twitter handle
  },
  alternates: {
    canonical: COMPANY_INFO.website,
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased font-sans bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
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
