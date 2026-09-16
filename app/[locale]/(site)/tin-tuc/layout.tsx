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
        ? '新闻资讯 & 行业动态 | 东洋集团'
        : isEn
        ? 'News & Industry Insights | Dong Duong Corporation'
        : 'Tin Tức & Sự Kiện | Đông Dương Corporation';

    const description = isZh
        ? '追踪建筑装饰材料前沿趋势、高端瓷砖应用指南及商用中央空调最新节能技术动态。'
        : isEn
        ? 'Latest industry updates, architectural tile trends, and commercial HVAC engineering insights from Dong Duong Corporation.'
        : 'Cập nhật tin tức, xu hướng vật liệu kiến trúc, gạch men cao cấp và công nghệ điều hòa trung tâm mới nhất từ Đông Dương Corporation.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
