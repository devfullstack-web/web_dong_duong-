import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { jobPostings } from '@/db/schemas';
import { eq, and, isNull } from 'drizzle-orm';
import { stripHtml } from '@/utils/strip-html';
import { COMPANY_INFO } from '@/constants/site-info';
import JobDetailClient from './_components/JobDetailClient';
import { sanitizeRichText } from '@/utils/sanitize';
import { JOB_STATUS } from '@/constants/content';
import { getLocalizedValue } from '@/types/i18n';

type PageProps = {
    params: Promise<{ locale: string; slug: string }>;
};

const getJob = cache(async (slug: string) => {
    const [job] = await db
        .select()
        .from(jobPostings)
        .where(
            and(
                eq(jobPostings.slug, slug),
                eq(jobPostings.status, JOB_STATUS.OPEN),
                isNull(jobPostings.deleted_at),
            ),
        );

    return job
        ? {
              ...job,
              description: sanitizeRichText(job.description),
              requirements: job.requirements ? sanitizeRichText(job.requirements) : null,
              benefits: job.benefits ? sanitizeRichText(job.benefits) : null,
          }
        : null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const job = await getJob(slug);

    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    if (!job) {
        return {
            title: isZh ? '未找到招聘岗位' : isEn ? 'Job Not Found' : 'Không tìm thấy tin tuyển dụng',
        };
    }

    const title = getLocalizedValue(job.title_localized, locale as any) || job.title;
    const rawDesc = getLocalizedValue(job.description_localized, locale as any) || job.description;
    const description = stripHtml(rawDesc);
    const prefix = isZh ? '诚聘英才: ' : isEn ? 'Careers: ' : 'Tuyển dụng: ';
    const metaTitle = `${prefix}${title}`;

    return {
        title: metaTitle,
        description,
        openGraph: {
            title: `${metaTitle} | ${COMPANY_INFO.name}`,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title: metaTitle,
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
