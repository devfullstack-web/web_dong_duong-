import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import { db } from '@/db';
import { products, newsArticles } from '@/db/schemas';
import { eq, desc, and, isNull } from 'drizzle-orm';

// Revalidate homepage data every 60 seconds (ISR)
export const revalidate = 60;

// Dynamic imports for below-fold components - reduces initial JS bundle
const TechnologyOverview = dynamic(() => import('@/components/home/TechnologyOverview'));
const HowItWorks = dynamic(() => import('@/components/home/HowItWorks'));
const KeyBenefits = dynamic(() => import('@/components/home/KeyBenefits'));

const ProductSpotlight = dynamic(() => import('@/components/home/ProductSpotlight'), {
    loading: () => <div className="bg-white py-24 sm:py-32" />,
});
const SystemHighlight = dynamic(() => import('@/components/home/SystemHighlight'));
const Solutions = dynamic(() => import('@/components/home/Solutions'));
const News = dynamic(() => import('@/components/home/News'), {
    loading: () => <div className="bg-white py-24 sm:py-32" />,
});
const Partners = dynamic(() => import('@/components/home/Partners'));
const ContactForm = dynamic(() => import('@/components/home/ContactForm'));

async function getFeaturedProducts() {
    try {
        const result = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                image_url: products.image_url,
                description: products.description,
            })
            .from(products)
            .where(
                and(
                    eq(products.is_featured, true),
                    eq(products.status, 'active'),
                    isNull(products.deleted_at),
                ),
            )
            .orderBy(desc(products.created_at))
            .limit(6);
        return result;
    } catch {
        return [];
    }
}

async function getLatestNews() {
    try {
        const result = await db
            .select({
                id: newsArticles.id,
                title: newsArticles.title,
                slug: newsArticles.slug,
                summary: newsArticles.summary,
                image_url: newsArticles.image_url,
                published_at: newsArticles.published_at,
                created_at: newsArticles.created_at,
                category_id: newsArticles.category_id,
            })
            .from(newsArticles)
            .where(and(eq(newsArticles.status, 'published'), isNull(newsArticles.deleted_at)))
            .orderBy(desc(newsArticles.published_at))
            .limit(3);
        return result;
    } catch {
        return [];
    }
}

export default async function Home() {
    const [featuredProducts, latestNews] = await Promise.all([
        getFeaturedProducts(),
        getLatestNews(),
    ]);

    return (
        <div className="flex flex-col">
            <Hero />
            <TechnologyOverview />
            <HowItWorks />
            <KeyBenefits />
            <Solutions />
            <SystemHighlight />
            <ProductSpotlight products={featuredProducts} />
            <News articles={latestNews} />
            <Partners />
            <ContactForm />
        </div>
    );
}
