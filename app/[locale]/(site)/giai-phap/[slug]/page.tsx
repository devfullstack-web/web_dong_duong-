import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMPANY_INFO } from '@/constants/site-info';
import { siteSettingService } from '@/services/site-setting-service';
import { SOLUTIONS_DATA } from './solutions-data';
import SolutionDetailClient from './_components/SolutionDetailClient';

type PageProps = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const dbData = await siteSettingService.getSolutionBySlug(slug);
    const data = dbData || SOLUTIONS_DATA[slug];

    if (!data) {
        return {
            title: locale === 'zh' ? '未找到解决方案' : locale === 'en' ? 'Solution Not Found' : 'Không tìm thấy giải pháp',
        };
    }

    const isZh = locale === 'zh';
    const isEn = locale === 'en';
    const title = (isZh && data.title_zh) ? data.title_zh : (isEn && data.title_en) ? data.title_en : data.title;
    const headerTitle = (isZh && data.headerTitle_zh) ? data.headerTitle_zh : (isEn && data.headerTitle_en) ? data.headerTitle_en : data.headerTitle;
    const description = (isZh && data.description_zh) ? data.description_zh : (isEn && data.description_en) ? data.description_en : data.description;

    return {
        title,
        description,
        openGraph: {
            title: `${headerTitle} | ${COMPANY_INFO.name}`,
            description,
            images: data.banner ? [{ url: data.banner }] : undefined,
        },
    };
}

export default async function SolutionDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const dbData = await siteSettingService.getSolutionBySlug(slug);
    const data = dbData || SOLUTIONS_DATA[slug];

    if (!data) {
        notFound();
    }

    return <SolutionDetailClient data={data} />;
}

