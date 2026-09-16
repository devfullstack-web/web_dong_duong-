import type { Metadata } from 'next';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/portal/FloatingContact';
import { siteSettingService } from '@/services/site-setting-service';
import { SiteInfoProvider } from '@/components/providers/site-info-provider';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const defaultTitle = isZh
        ? '高端陶瓷岩板 & 商用多联机中央空调'
        : isEn
        ? 'Architectural Surfaces & Commercial HVAC Chillers'
        : 'Gạch Men & Máy Lạnh Điều Hòa VRV-Chiller';

    const description = isZh
        ? '东洋集团 (Dong Duong Corp) - 越南国家品牌高端陶瓷岩板、格力美的商用多联机中央空调与螺杆离心冷水机组一级授权工程总代理。'
        : isEn
        ? 'Dong Duong Corporation - Official distributor of premium architectural tiles and central VRV/VRF Chiller HVAC (Gree & Midea).'
        : 'Đông Dương Corporation - Tổng đại lý phân phối gạch men, gạch trang trí cao cấp (Đồng Tâm, Viglacera, Catalan, Thuận Hải, Hà Thanh) và hệ thống máy lạnh điều hòa trung tâm VRV/VRF, Chiller chính hãng (Gree & Midea), Thép xây dựng VNSTEEL.';

    return {
        title: {
            default: defaultTitle,
            template: isZh ? '%s | 东洋集团' : isEn ? '%s | Dong Duong Corporation' : '%s | Đông Dương Corporation',
        },
        description,
    };
}

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
