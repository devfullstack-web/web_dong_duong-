import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { products, categories } from '@/db/schemas';
import { eq, and, isNull } from 'drizzle-orm';
import { stripHtml } from '@/utils/strip-html';
import { COMPANY_INFO } from '@/constants/site-info';
import ProductDetailClient from './_components/ProductDetailClient';
import { sanitizeLocalizedRichText, sanitizeRichText, sanitizeStringArray } from '@/utils/sanitize';
import { PRODUCT_STATUS } from '@/constants/content';

type PageProps = {
    params: Promise<{ slug: string; locale: string }>;
};

const getProduct = cache(async (slug: string) => {
    const [product] = await db
        .select({
            id: products.id,
            name: products.name,
            name_localized: products.name_localized,
            slug: products.slug,
            description: products.description,
            description_localized: products.description_localized,
            price: products.price,
            sku: products.sku,
            stock: products.stock,
            category_id: products.category_id,
            status: products.status,
            image_url: products.image_url,
            is_featured: products.is_featured,
            tech_specs: products.tech_specs,
            tech_specs_localized: products.tech_specs_localized,
            features: products.features,
            features_localized: products.features_localized,
            gallery: products.gallery,
            tech_summary: products.tech_summary,
            tech_summary_localized: products.tech_summary_localized,
            catalog_url: products.catalog_url,
            warranty: products.warranty,
            origin: products.origin,
            availability: products.availability,
            delivery_info: products.delivery_info,
            category_name: categories.name,
            category_name_localized: categories.name_localized,
        })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(
            and(
                eq(products.slug, slug),
                eq(products.status, PRODUCT_STATUS.ACTIVE),
                eq(categories.is_visible, true),
                isNull(products.deleted_at),
            ),
        );

    return product
        ? {
              ...product,
              description: sanitizeRichText(product.description),
              description_localized: sanitizeLocalizedRichText(product.description_localized),
              features: sanitizeStringArray(product.features),
              features_localized: product.features_localized
                  ? {
                        ...product.features_localized,
                        vi: sanitizeStringArray(product.features_localized.vi),
                        en: sanitizeStringArray(product.features_localized.en),
                        zh: sanitizeStringArray(product.features_localized.zh),
                    }
                  : product.features_localized,
          }
        : null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug, locale } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: locale === 'zh' ? '未找到产品' : locale === 'en' ? 'Product Not Found' : 'Không tìm thấy sản phẩm',
        };
    }

    const activeName = (locale === 'zh' ? (product.name_localized as any)?.zh : locale === 'en' ? (product.name_localized as any)?.en : null) || product.name;
    const rawDesc = (locale === 'zh' ? (product.description_localized as any)?.zh : locale === 'en' ? (product.description_localized as any)?.en : null) || product.description;
    const description = stripHtml(rawDesc);

    return {
        title: activeName,
        description,
        openGraph: {
            title: `${activeName} | ${COMPANY_INFO.name}`,
            description,
            images: product.image_url ? [{ url: product.image_url }] : undefined,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: activeName,
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
