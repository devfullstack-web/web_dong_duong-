import type { Metadata } from 'next';

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const title = isZh
        ? '关于我们 | 东洋集团 - 高端陶瓷岩板与中央空调'
        : isEn
        ? 'About Us | Dong Duong Corporation - Architectural Tiles & Central HVAC'
        : 'Giới Thiệu | Đông Dương Corporation - Gạch Men & Máy Lạnh VRV-Chiller';

    const description = isZh
        ? '关于东洋集团 (Dong Duong Corp)：越南国家品牌董心、维格拉塞拉等高端瓷砖岩板与格力、美的商用中央空调 VRV/Chiller、VNSTEEL 钢材一级授权工程总代理。'
        : isEn
        ? 'About Dong Duong Corporation: Official distributor of premium architectural tiles (Dongtam, Viglacera, Catalan) and central VRV/VRF Chiller HVAC (Gree & Midea), VNSTEEL.'
        : 'Về chúng tôi - Đông Dương Corporation: Tổng đại lý phân phối gạch men, gạch trang trí cao cấp (Đồng Tâm, Viglacera, Catalan, Thuận Hải, Hà Thanh) và hệ thống máy lạnh điều hòa trung tâm VRV - Chiller chính hãng (Gree & Midea), Thép xây dựng VNSTEEL.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
