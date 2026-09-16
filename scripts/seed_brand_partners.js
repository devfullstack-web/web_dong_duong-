const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const BRAND_PARTNERS = [
    // --- LĨNH VỰC 1: GẠCH MEN, GRANITE, GẠCH BÔNG (Ưu đãi 17% - 20%) ---
    {
        id: 'dongtam',
        name: 'DONGTAM GROUP',
        shortName: 'Đồng Tâm',
        category: 'tiles',
        sector: 'Gạch Men, Granite & Gạch Bông',
        desc: 'Thương hiệu quốc gia hàng đầu về gạch ốp lát, porcelain cao cấp và gạch bông nghệ thuật.',
        badge: 'Đối tác chiến lược',
        discount: 'Ưu đãi 17% - 20%',
        logo: '/images/dongduong/partners/dongtam.png',
        website: 'https://dongtam.com.vn',
        featured: true,
    },
    {
        id: 'viglacera',
        name: 'VIGLACERA',
        shortName: 'Viglacera',
        category: 'tiles',
        sector: 'Gạch Khổ Lớn & Granite',
        desc: 'Tiên phong công nghệ gạch khổ lớn Big Slab, granite cao cấp phục vụ các đại công trình.',
        badge: 'Đối tác chiến lược',
        discount: 'Ưu đãi 17% - 20%',
        logo: '/images/dongduong/partners/viglacera.png',
        website: 'https://viglacera.com.vn',
        featured: true,
    },
    {
        id: 'catalan',
        name: 'CATALAN',
        shortName: 'Catalan',
        category: 'tiles',
        sector: 'Porcelain Stoneware',
        desc: 'Thương hiệu gạch ốp lát Porcelain Stoneware chuẩn châu Âu, men bóng vi tính công nghệ cao.',
        badge: 'Nhà phân phối ủy quyền',
        discount: 'Ưu đãi 17% - 20%',
        logo: '/images/dongduong/partners/catalan.png',
        website: 'https://catalan.vn',
        featured: true,
    },
    {
        id: 'thuanhai',
        name: 'GẠCH MEN THUẬN HẢI',
        shortName: 'Thuận Hải Vaceramic',
        category: 'tiles',
        sector: 'Gạch Men & Ốp Lát Vaceramic',
        desc: 'Tổng kho và nhà phân phối gạch ốp lát Vaceramic uy tín hàng đầu khu vực miền Nam.',
        badge: 'Đối tác chiến lược',
        discount: 'Ưu đãi 17% - 20%',
        logo: '/images/dongduong/partners/thuanhai.png',
        website: 'http://gachmenthuanhai.vn',
        featured: true,
    },
    {
        id: 'hathanh',
        name: 'HÀ THANH (DHT)',
        shortName: 'Đại Hà Thanh',
        category: 'tiles',
        sector: 'Gạch Men & Bê Tông Xây Dựng',
        desc: 'Tập đoàn sản xuất gạch men cao cấp DHT, cấu kiện bê tông và vật liệu xây dựng bền vững.',
        badge: 'Đối tác chiến lược',
        discount: 'Ưu đãi 17% - 20%',
        logo: '/images/dongduong/partners/hathanh.png',
        website: 'https://daihathanh.vn',
        featured: true,
    },

    // --- LĨNH VỰC 2: MÁY LẠNH CỤC BỘ / VRF & CHILLER (Ưu đãi đặc biệt 20% - 25%) ---
    {
        id: 'gree',
        name: 'GREE',
        shortName: 'Gree Electric',
        category: 'hvac',
        sector: 'Máy Lạnh (Hệ Cục Bộ / VRF & Chiller)',
        desc: 'Tập đoàn điều hòa không khí số 1 toàn cầu, công nghệ Real Inverter siêu tiết kiệm điện năng.',
        badge: 'Thương hiệu đối tác',
        discount: 'Ưu đãi đặc biệt 20% - 25%',
        logo: '/images/dongduong/partners/gree.png',
        website: 'https://gree.com.vn',
        featured: true,
    },
    {
        id: 'midea',
        name: 'MIDEA',
        shortName: 'Midea HVAC',
        category: 'hvac',
        sector: 'Hệ Thống Chiller & VRF',
        desc: 'Giải pháp điều hòa thương mại toàn diện: Chiller trục vít/ly tâm & hệ thống VRF thông minh.',
        badge: 'Thương hiệu đối tác',
        discount: 'Ưu đãi đặc biệt 20% - 25%',
        logo: '/images/dongduong/partners/midea_transparent.png',
        website: 'https://www.midea.com/vn',
        featured: true,
    },

    // --- LĨNH VỰC 3: SẮT, THÉP XÂY DỰNG (VNSTEEL HMC) ---
    {
        id: 'vnsteel_hmc',
        name: 'CTY CP KIM KHÍ TP. HỒ CHÍ MINH - VNSTEEL',
        shortName: 'VNSTEEL (HMC)',
        category: 'steel',
        sector: 'Sắt & Thép Xây Dựng',
        desc: 'Cung ứng đủ loại thép xây dựng từ VNSTEEL, cam kết báo giá tốt nhất tại kho khu vực miền Nam.',
        badge: 'Nhà cung ứng chiến lược',
        discount: 'Cam kết giá gốc tại kho',
        logo: '/images/dongduong/partners/hmc_vnsteel.png',
        website: 'https://metalhcm.com.vn',
        featured: true,
    },
];

async function main() {
    console.log('Seeding official 8 site_brand_partners into system_settings...');
    const query = `
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = $2, updated_at = NOW();
    `;
    await pool.query(query, ['site_brand_partners', JSON.stringify(BRAND_PARTNERS)]);
    console.log('Successfully seeded 8 verified strategic partners into database!');
    await pool.end();
}

main().catch((e) => {
    console.error('Error seeding brand partners:', e);
    process.exit(1);
});
