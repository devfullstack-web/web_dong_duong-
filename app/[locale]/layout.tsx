import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ApiProvider from "@/components/providers/api-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SÀI GÒN VALVE | Professional Industrial Solutions",
  description: "Sài Gòn Valve chuyên cung cấp valve và phụ kiện đường ống, giải pháp IOT quản trị tập trung cho ngành nước.",
  keywords: ["Sài Gòn Valve", "Van công nghiệp", "Giải pháp IoT", "Ngành nước"],
  icons: {
    icon: "/images/logo/logo.png",
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
      <body suppressHydrationWarning className={`${inter.variable} antialiased font-sans bg-background text-foreground`}>
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
