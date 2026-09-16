import type { Metadata } from 'next';
import DongDuongHero from '@/components/home/DongDuongHero';
import WhyChooseDongDuong from '@/components/home/WhyChooseDongDuong';
import CoreCategories, { CoreCategoryItem } from '@/components/home/CoreCategories';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const title = isZh
        ? '东洋集团 (ĐÔNG DƯƠNG CORPORATION) | 高端建筑陶瓷与商用中央空调工程一级总代'
        : isEn
        ? 'Dong Duong Corporation | Premium Architectural Tiles & Commercial HVAC Systems'
        : 'Đông Dương Corporation | Gạch Men Cao Cấp & Máy Lạnh Điều Hòa VRV-Chiller';

    const description = isZh
        ? '越南东洋集团 (Đông Dương Corporation) 是董心、维格拉塞拉、卡塔兰瓷砖总代与格力、美的、大金中央空调一级代理，提供工程集采直供与专业施工服务。'
        : isEn
        ? 'Dong Duong Corporation is the leading authorized distributor of premium architectural tiles and commercial VRV/Chiller HVAC systems in Vietnam.'
        : 'Tổng đại lý phân phối chính hãng gạch Đồng Tâm, Viglacera, Catalan, Taicera và hệ thống điều hòa VRV/VRF, Chiller Gree, Midea, Daikin.';

    return {
        title: {
            absolute: title,
        },
        description,
    };
}
import FeaturedProductSlider, { FeaturedProductData } from '@/components/home/FeaturedProductSlider';
import WorkflowProcess from '@/components/home/WorkflowProcess';
import EquipmentProductsGrid, { EquipmentProductItem } from '@/components/home/EquipmentProductsGrid';
import Partners from '@/components/home/Partners';
import QuoteAndNewsSection from '@/components/home/QuoteAndNewsSection';
import { siteSettingService } from '@/services/site-setting-service';
import { db } from '@/db';
import { products, newsArticles, categories, categoryTypes } from '@/db/schemas';
import { eq, desc, asc, and, isNull, gt } from 'drizzle-orm';
import { NEWS_STATUS, PRODUCT_STATUS } from '@/constants/content';

// Revalidate homepage data every 60 seconds (ISR)
export const revalidate = 60;

async function getCategories(): Promise<CoreCategoryItem[]> {
    try {
        const result = await db
            .select({
                id: categories.id,
                name: categories.name,
                name_localized: categories.name_localized,
                display_order: categories.display_order,
            })
            .from(categories)
            .innerJoin(categoryTypes, eq(categories.category_type_id, categoryTypes.id))
            .where(
                and(
                    eq(categoryTypes.name, 'product'),
                    eq(categories.is_visible, true),
                    gt(categories.display_order, 0),
                )
            )
            .orderBy(asc(categories.display_order));

        return result as unknown as CoreCategoryItem[];
    } catch (e) {
        console.error('[Home] Error fetching categories:', e);
        return [];
    }
}

async function getFeaturedProducts(): Promise<FeaturedProductData[]> {
    try {
        const result = await db
            .select({
                id: products.id,
                name: products.name,
                name_localized: products.name_localized,
                slug: products.slug,
                image_url: products.image_url,
                gallery: products.gallery,
                description: products.description,
                description_localized: products.description_localized,
                price: products.price,
                tech_specs: products.tech_specs,
            })
            .from(products)
            .innerJoin(categories, eq(products.category_id, categories.id))
            .where(
                and(
                    eq(products.status, PRODUCT_STATUS.ACTIVE),
                    eq(products.is_featured, true),
                    eq(categories.is_visible, true),
                    isNull(products.deleted_at),
                ),
            )
            .orderBy(desc(products.created_at))
            .limit(10);

        return result as unknown as FeaturedProductData[];
    } catch (e) {
        console.error('[Home] Error fetching featured products:', e);
        return [];
    }
}

async function getEquipmentProducts(): Promise<EquipmentProductItem[]> {
    try {
        const result = await db
            .select({
                id: products.id,
                name: products.name,
                name_localized: products.name_localized,
                slug: products.slug,
                image_url: products.image_url,
                tech_specs: products.tech_specs,
                description: products.description,
                description_localized: products.description_localized,
                price: products.price,
            })
            .from(products)
            .innerJoin(categories, eq(products.category_id, categories.id))
            .where(
                and(
                    eq(products.status, PRODUCT_STATUS.ACTIVE),
                    eq(categories.is_visible, true),
                    isNull(products.deleted_at),
                ),
            )
            .orderBy(desc(products.created_at))
            .limit(8);
        return result as unknown as EquipmentProductItem[];
    } catch (e) {
        console.error('[Home] Error fetching equipment products:', e);
        return [];
    }
}

async function getLatestNews() {
    try {
        const result = await db
            .select({
                id: newsArticles.id,
                title: newsArticles.title,
                title_localized: newsArticles.title_localized,
                slug: newsArticles.slug,
                image_url: newsArticles.image_url,
                published_at: newsArticles.published_at,
                created_at: newsArticles.created_at,
            })
            .from(newsArticles)
            .where(and(eq(newsArticles.status, NEWS_STATUS.PUBLISHED), isNull(newsArticles.deleted_at)))
            .orderBy(desc(newsArticles.published_at))
            .limit(4);
        return result;
    } catch (e) {
        console.error('[Home] Error fetching news articles:', e);
        return [];
    }
}

export default async function Home(props: { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;
    const activeLocale = locale === 'en' ? 'en' : locale === 'zh' ? 'zh' : 'vi';

    // 100% dynamic data fetched from Backend Database and Site Settings
    const [homepageSettings, categoriesList, featuredProducts, equipmentProducts, brandPartners, latestNews] =
        await Promise.all([
            siteSettingService.getHomepageData(activeLocale),
            getCategories(),
            getFeaturedProducts(),
            getEquipmentProducts(),
            siteSettingService.getBrandPartners(activeLocale),
            getLatestNews(),
        ]);

    return (
        <div className="flex flex-col w-full min-h-screen">
            {/* 1. Multi-Image Hero Banner Slider (Dynamic from Backend DB / Settings) */}
            <DongDuongHero slides={homepageSettings.heroSlides} />

            {/* 2. Lý Do Chọn Đông Dương (Dynamic from Backend DB / Settings) */}
            <WhyChooseDongDuong reasons={homepageSettings.whyChooseUs} />

            {/* 3. Danh Mục Sản Phẩm Chủ Lực Multi-Card Slider (Dynamic from Backend DB) */}
            <CoreCategories categories={categoriesList} />

            {/* 4. Sản Phẩm Tiêu Biểu Multi-Image Slider (Dynamic from Backend DB) */}
            <FeaturedProductSlider products={featuredProducts} />

            {/* 5. Quy Trình Làm Việc (Dynamic from Backend DB / Settings) */}
            <WorkflowProcess steps={homepageSettings.workflowSteps} />

            {/* 6. Thiết Bị & Sản Phẩm Grid (Dynamic from Backend DB) */}
            <EquipmentProductsGrid products={equipmentProducts} />

            {/* 7. Đối Tác Chiến Lược (Dynamic from Backend DB / Settings) */}
            <Partners initialPartners={brandPartners} />

            {/* 8. Đăng Ký Báo Giá & Tin Tức Mới Nhất (Dynamic from Backend DB) */}
            <QuoteAndNewsSection articles={latestNews} />
        </div>
    );
}
