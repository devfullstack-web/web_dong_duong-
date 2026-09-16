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
        ? '重点标杆工程 | 东洋集团'
        : isEn
        ? 'Featured Projects | Dong Duong Corporation'
        : 'Dự Án Tiêu Biểu | Đông Dương Corporation';

    const description = isZh
        ? '东洋集团供应高端瓷砖岩板与商用中央空调系统的重点地标建筑、五星级豪华酒店及现代工业厂房工程案例。'
        : isEn
        ? 'Key landmark projects and commercial facilities utilizing premium ceramic surfaces and central HVAC systems supplied by Dong Duong Corporation.'
        : 'Các công trình và dự án trọng điểm sử dụng gạch men cao cấp và hệ thống điều hòa không khí do Đông Dương Corporation cung cấp.';

    return {
        title: { absolute: title },
        description,
    };
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
