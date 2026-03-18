import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { stripHtml } from '@/utils/strip-html';
import { COMPANY_INFO } from '@/constants/site-info';
import ProductDetailClient from './_components/ProductDetailClient';

type PageProps = {
    params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
    const [product] = await db
        .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            description: products.description,
            price: products.price,
            sku: products.sku,
            stock: products.stock,
            category_id: products.category_id,
            status: products.status,
            image_url: products.image_url,
            is_featured: products.is_featured,
            tech_specs: products.tech_specs,
            features: products.features,
            gallery: products.gallery,
            tech_summary: products.tech_summary,
            catalog_url: products.catalog_url,
            warranty: products.warranty,
            origin: products.origin,
            availability: products.availability,
            delivery_info: products.delivery_info,
            category_name: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(and(eq(products.slug, slug), isNull(products.deleted_at)));

    return product || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return { title: 'Không tìm thấy sản phẩm' };
    }

    const description = stripHtml(product.description);

    return {
        title: product.name,
        description,
        openGraph: {
            title: `${product.name} | ${COMPANY_INFO.name}`,
            description,
            images: product.image_url ? [{ url: product.image_url }] : undefined,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images: product.image_url ? [product.image_url] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} slug={slug} />;
}
