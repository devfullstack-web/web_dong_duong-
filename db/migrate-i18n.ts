/**
 * Migration script: Copy existing name data to name_localized JSONB field
 * Run with: npx tsx db/migrate-i18n.ts
 */

import 'dotenv/config';
import { db } from './index';
import { categories, products } from './schema';
import { isNull } from 'drizzle-orm';

async function migrateI18nData() {
    console.log('🌐 Starting i18n data migration...\n');

    // Migrate categories
    console.log('📁 Migrating categories...');
    const allCategories = await db.select().from(categories);
    let categoriesUpdated = 0;

    for (const cat of allCategories) {
        if (!cat.name_localized) {
            await db
                .update(categories)
                .set({
                    name_localized: {
                        vi: cat.name,
                        en: '', // Empty for now, can be filled later via admin
                    },
                })
                .where(isNull(categories.name_localized));
            categoriesUpdated++;
        }
    }
    console.log(`   ✅ Updated ${categoriesUpdated} categories\n`);

    // Migrate products
    console.log('📦 Migrating products...');
    const allProducts = await db.select().from(products);
    let productsUpdated = 0;

    for (const product of allProducts) {
        const updates: Record<string, unknown> = {};

        if (!product.name_localized) {
            updates.name_localized = {
                vi: product.name,
                en: '',
            };
        }

        if (!product.description_localized) {
            updates.description_localized = {
                vi: product.description,
                en: '',
            };
        }

        if (product.tech_summary && !product.tech_summary_localized) {
            updates.tech_summary_localized = {
                vi: product.tech_summary,
                en: '',
            };
        }

        if (Object.keys(updates).length > 0) {
            await db
                .update(products)
                .set(updates)
                .where(isNull(products.name_localized));
            productsUpdated++;
        }
    }
    console.log(`   ✅ Updated ${productsUpdated} products\n`);

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
}

migrateI18nData().catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
