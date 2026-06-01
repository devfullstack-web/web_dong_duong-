import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { projects, categories } from '@/db/schemas';
import { eq, and, isNull, ne, desc } from 'drizzle-orm';
import { stripHtml } from '@/utils/strip-html';
import { COMPANY_INFO } from '@/constants/site-info';
import ProjectDetailClient from './_components/ProjectDetailClient';
import { sanitizeRichText } from '@/utils/sanitize';
import { getLocalizedValue, type Locale } from '@/types/i18n';

type PageProps = {
    params: Promise<{ slug: string; locale: string }>;
};

const getProject = cache(async (slug: string) => {
    const [project] = await db
        .select({
            id: projects.id,
            name: projects.name,
            name_localized: projects.name_localized,
            slug: projects.slug,
            description: projects.description,
            description_localized: projects.description_localized,
            client_name: projects.client_name,
            start_date: projects.start_date,
            end_date: projects.end_date,
            status: projects.status,
            image_url: projects.image_url,
            gallery: projects.gallery,
            category_name: categories.name,
        })
        .from(projects)
        .leftJoin(categories, eq(projects.category_id, categories.id))
        .where(and(eq(projects.slug, slug), isNull(projects.deleted_at)));

    return project
        ? {
              ...project,
              description: sanitizeRichText(project.description),
          }
        : null;
});

async function getRelatedProjects(slug: string) {
    return db
        .select({
            id: projects.id,
            name: projects.name,
            name_localized: projects.name_localized,
            slug: projects.slug,
            image_url: projects.image_url,
            status: projects.status,
            category_name: categories.name,
        })
        .from(projects)
        .leftJoin(categories, eq(projects.category_id, categories.id))
        .where(and(ne(projects.slug, slug), isNull(projects.deleted_at)))
        .orderBy(desc(projects.created_at))
        .limit(3);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    const project = await getProject(slug);

    if (!project) {
        return { title: 'Không tìm thấy dự án' };
    }

    const activeTitle = getLocalizedValue(project.name_localized, locale as Locale) || project.name;
    const activeDescription = stripHtml(getLocalizedValue(project.description_localized, locale as Locale) || project.description);

    return {
        title: activeTitle,
        description: activeDescription,
        openGraph: {
            title: `${activeTitle} | ${COMPANY_INFO.name}`,
            description: activeDescription,
            images: project.image_url ? [{ url: project.image_url }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: activeTitle,
            description: activeDescription,
            images: project.image_url ? [project.image_url] : undefined,
        },
    };
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const { slug, locale } = await params;
    const [project, relatedProjects] = await Promise.all([
        getProject(slug),
        getRelatedProjects(slug),
    ]);

    if (!project) {
        notFound();
    }

    const projectWithMeta = {
        ...project,
        category: project.category_name || 'DỰ ÁN',
    };

    const relatedWithMeta = relatedProjects.map((p) => ({
        ...p,
        category: p.category_name || 'DỰ ÁN',
    }));

    return <ProjectDetailClient project={projectWithMeta} relatedProjects={relatedWithMeta} locale={locale} />;
}
