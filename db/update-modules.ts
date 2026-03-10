import 'dotenv/config';
import { db } from './index';
import { modules } from './schema';
import { eq } from 'drizzle-orm';
import { MODULE_CODES } from '@/constants/rbac';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

async function updateModules() {
    console.log('🔄 Updating modules from MODULE_CODES...');

    const sidebarMap = new Map(SIDEBAR_ITEMS.map((s) => [s.code, s]));

    const allModules = Object.values(MODULE_CODES).map((code, index) => {
        const sidebar = sidebarMap.get(code);
        return {
            code,
            name: sidebar?.name ?? code,
            icon: sidebar?.icon ?? null,
            route: sidebar?.route ?? null,
            order: index,
        };
    });

    for (const moduleData of allModules) {
        try {
            // Check if module exists
            const existing = await db
                .select()
                .from(modules)
                .where(eq(modules.code, moduleData.code));

            if (existing.length > 0) {
                // Update existing module
                await db
                    .update(modules)
                    .set({
                        name: moduleData.name,
                        icon: moduleData.icon,
                        route: moduleData.route,
                        order: moduleData.order,
                        updated_at: new Date(),
                    })
                    .where(eq(modules.code, moduleData.code));
                console.log(`✅ Updated: ${moduleData.code}`);
            } else {
                // Insert new module
                await db.insert(modules).values({
                    code: moduleData.code,
                    name: moduleData.name,
                    icon: moduleData.icon,
                    route: moduleData.route,
                    order: moduleData.order,
                });
                console.log(`✅ Created: ${moduleData.code}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${moduleData.code}:`, error);
        }
    }

    console.log('✅ Module update completed!');
    process.exit(0);
}

updateModules().catch((err) => {
    console.error('Update failed:', err);
    process.exit(1);
});
