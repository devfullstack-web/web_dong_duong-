import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COMPANY_INFO } from '@/constants/site-info';
import { SOLUTIONS_DATA } from './solutions-data';
import SolutionDetailClient from './_components/SolutionDetailClient';

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = SOLUTIONS_DATA[slug];

    if (!data) {
        return { title: 'Không tìm thấy giải pháp' };
    }

    return {
        title: data.title,
        description: data.description,
        openGraph: {
            title: `${data.headerTitle} | ${COMPANY_INFO.name}`,
            description: data.description,
            images: data.banner ? [{ url: data.banner }] : undefined,
        },
    };
}

export default async function SolutionDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const data = SOLUTIONS_DATA[slug];

    if (!data) {
        notFound();
    }

    return <SolutionDetailClient data={data} />;
}
