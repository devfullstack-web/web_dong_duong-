import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { jobPostings } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { stripHtml } from '@/utils/strip-html';
import { COMPANY_INFO } from '@/constants/site-info';
import JobDetailClient from './_components/JobDetailClient';

type PageProps = {
    params: Promise<{ slug: string }>;
};

const getJob = cache(async (slug: string) => {
    const [job] = await db
        .select()
        .from(jobPostings)
        .where(and(eq(jobPostings.slug, slug), isNull(jobPostings.deleted_at)));

    return job || null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        return { title: 'Không tìm thấy tin tuyển dụng' };
    }

    const description = stripHtml(job.description);

    return {
        title: `Tuyển dụng: ${job.title}`,
        description,
        openGraph: {
            title: `Tuyển dụng: ${job.title} | ${COMPANY_INFO.name}`,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: `Tuyển dụng: ${job.title}`,
            description,
        },
    };
}

export default async function JobDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const job = await getJob(slug);

    if (!job) {
        notFound();
    }

    return <JobDetailClient job={job} />;
}
