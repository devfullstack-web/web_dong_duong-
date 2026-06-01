import type { Metadata } from 'next';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/portal/FloatingContact';
import { siteSettingService } from '@/services/site-setting-service';
import { SiteInfoProvider } from '@/components/providers/site-info-provider';

export const metadata: Metadata = {
    title: {
        default: 'Sài Gòn Valve | Van công nghiệp & Giải pháp IoT ngành nước',
        template: '%s | Sài Gòn Valve',
    },
    description:
        'Sài Gòn Valve - Nhà phân phối thiết bị van công nghiệp, phụ kiện đường ống và giải pháp IoT quan trắc thông minh cho ngành nước tại Việt Nam.',
};

export default async function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const siteInfo = await siteSettingService.getSiteInfo();

    return (
        <SiteInfoProvider value={siteInfo}>
            <TopBar />
            <Header />
            <main className="relative flex min-h-screen flex-col">{children}</main>
            <Footer />
            <FloatingContact />
        </SiteInfoProvider>
    );
}
