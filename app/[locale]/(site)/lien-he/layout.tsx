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
        ? '联系我们 & 工程询价 | 东洋集团'
        : isEn
        ? 'Contact Us & Project Inquiry | Dong Duong Corporation'
        : 'Liên Hệ & Báo Giá Dự Án | Đông Dương Corporation';

    const description = isZh
        ? '联系东洋集团，获取高端瓷砖岩板大宗集采报价与格力、美的商用中央空调工程深化技术支持。'
        : isEn
        ? 'Connect with Dong Duong Corporation for wholesale commercial surface quotes and specialized HVAC engineering consultations.'
        : 'Liên hệ Đông Dương Corporation để nhận tư vấn kỹ thuật và báo giá đại lý gạch men, gạch trang trí và hệ thống điều hòa trung tâm VRV-Chiller.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
