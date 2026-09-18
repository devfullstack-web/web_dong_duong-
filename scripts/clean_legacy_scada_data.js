/**
 * Clean up legacy SCADA, Valve, and Water items by soft-deleting them (setting deleted_at = NOW())
 * This ensures the public website exclusively features Dong Duong's core business:
 * 1) Gạch Men & Gạch Trang Trí (Đồng Tâm, Taicera, Viglacera, Catalan, Mosaic)
 * 2) Máy Lạnh & Điều Hòa Không Khí (Gree, Midea, Daikin, LG: Inverter, Cassette, Ống Gió, VRV/VRF, Chiller)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanLegacyData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('--- Cleaning up legacy SCADA/Water/Valve data ---');

        // 1. Soft delete legacy products (not belonging to the new Dong Duong seed)
        const keepProductSlugs = [
            'gach-dong-tam-80x80-dongtam-porcelain-luxury',
            'gach-taicera-60x60-thach-anh-bong-kieng-crystal',
            'gach-viglacera-60x120-platinum-nano-khang-khuan',
            'gach-catalan-80x80-titan-porcelain-xuat-khau',
            'gach-mosaic-thuy-tinh-trang-tri-ho-boi-resort',
            'may-lanh-gree-inverter-1-5-hp-real-cool-gwc12pb',
            'may-lanh-midea-inverter-quattro-2-0-hp-msfra-18crdn8',
            'may-lanh-daikin-inverter-1-0-hp-ftkf25xvmv-streamer',
            'may-lanh-lg-dual-inverter-2-5-hp-v24win-plasmaster',
            'dieu-hoa-am-tran-cassette-daikin-4-0-hp-fcf100cvm',
            'dieu-hoa-giau-tran-noi-ong-gio-midea-inverter-5-0-hp',
            'he-thong-dieu-hoa-trung-tam-daikin-vrv-x-20-hp',
            'he-thong-dieu-hoa-trung-tam-gree-gmv6-24-hp',
            'may-lam-lanh-nuoc-chiller-giai-nhiet-gio-truc-vit-50-rt-midea',
            'he-thong-chiller-giai-nhiet-nuoc-daikin-inverter-80-rt',
            'gach-the-van-go-tu-nhien-dong-tam-15x80-wood-veneer',
        ];

        const prodRes = await client.query(
            `UPDATE products 
             SET deleted_at = NOW() 
             WHERE NOT (slug = ANY($1)) AND deleted_at IS NULL`,
            [keepProductSlugs]
        );
        console.log(`Soft-deleted ${prodRes.rowCount} legacy products.`);

        // 2. Soft delete legacy news articles
        const keepNewsSlugs = [
            'kinh-nghiem-chon-gach-op-lat-dong-tam-viglacera-cho-biet-thu-nha-pho',
            'so-sanh-chi-tiet-dieu-hoa-trung-tam-vrv-daikin-va-vrf-gree-midea',
            'top-5-xu-huong-gach-mosaic-thuy-tinh-trang-tri-be-boi-resort-2026',
            'huong-dan-bao-duong-ve-sinh-may-lanh-dinh-ky-tiet-kiem-dien-nang',
        ];

        const newsRes = await client.query(
            `UPDATE news_articles 
             SET deleted_at = NOW() 
             WHERE NOT (slug = ANY($1)) AND deleted_at IS NULL`,
            [keepNewsSlugs]
        );
        console.log(`Soft-deleted ${newsRes.rowCount} legacy news articles.`);

        // 3. Soft delete legacy projects
        const keepProjectSlugs = [
            'khach-san-5-sao-premier-nha-trang',
            'toa-nha-van-phong-dong-duong-tower-hcm',
            'khu-biet-thu-sinh-thai-thao-dien-complex',
            'nha-may-san-xuat-linh-kien-dien-tu-kcn-vsip',
        ];

        const projRes = await client.query(
            `UPDATE projects 
             SET deleted_at = NOW() 
             WHERE NOT (slug = ANY($1)) AND deleted_at IS NULL`,
            [keepProjectSlugs]
        );
        console.log(`Soft-deleted ${projRes.rowCount} legacy projects.`);

        // 4. Hide legacy categories
        const activeCategoryNames = [
            'Gạch Ốp Lát Đồng Tâm',
            'Gạch Ốp Lát Taicera',
            'Gạch Men Viglacera',
            'Gạch Catalan Cao Cấp',
            'Gạch Trang Trí & Mosaic',
            'Máy Lạnh Treo Tường Inverter',
            'Máy Lạnh Âm Trần Cassette',
            'Máy Lạnh Giấu Trần Nối Ống Gió',
            'Điều Hòa Trung Tâm VRV / VRF',
            'Hệ Thống Chiller Làm Lạnh Nước',
            'Tin tức chung',
            'Kiến thức kỹ thuật',
            'Sự kiện công ty',
            'Khách sạn & Nghỉ dưỡng',
            'Văn phòng & Thương mại',
            'Biệt thự & Khu dân cư',
            'Công nghiệp & Nhà máy',
        ];

        const catRes = await client.query(
            `UPDATE categories 
             SET is_visible = false 
             WHERE NOT (name = ANY($1)) AND is_visible = true`,
            [activeCategoryNames]
        );
        console.log(`Hidden ${catRes.rowCount} legacy categories.`);

        await client.query('COMMIT');
        console.log('--- CLEANUP COMPLETED SUCCESSFULLY ---');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Cleanup failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

cleanLegacyData();
