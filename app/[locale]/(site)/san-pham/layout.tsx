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
        ? '产品矩阵 | 东洋集团 - 高端瓷砖岩板与商用暖通'
        : isEn
        ? 'Products | Dong Duong Corporation - Architectural Surfaces & Commercial HVAC'
        : 'Sản Phẩm | Đông Dương Corporation - Gạch Men & Điều Hòa VRV-Chiller';

    const description = isZh
        ? '东洋集团全系列产品目录：董心、维格拉塞拉等高端瓷砖岩板，格力、美的商用中央空调 VRV/Chiller 与工业柜机，VNSTEEL 结构用钢。'
        : isEn
        ? 'Product catalog of Dong Duong Corporation: premium architectural ceramic tiles, VRV/VRF central HVAC, industrial chillers (Gree & Midea), and VNSTEEL construction steel.'
        : 'Danh mục sản phẩm gạch men, gạch trang trí (Đồng Tâm, Viglacera, Catalan, Thuận Hải, Hà Thanh) và máy lạnh điều hòa trung tâm VRV-Chiller (Gree & Midea), Thép xây dựng VNSTEEL chính hãng.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
