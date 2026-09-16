const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateCatalog() {
    console.log('=== UPDATING DONG DUONG CATALOG & CATEGORIES ===');

    // 1. Get Category Types
    const ctRes = await pool.query('SELECT id, name FROM category_types');
    const ctMap = {};
    ctRes.rows.forEach((r) => {
        ctMap[r.name] = r.id;
    });
    const productTypeId = ctMap['product'];

    // 2. Hide all legacy categories (valves, pumps, scada, gis, etc.)
    await pool.query(
        `UPDATE categories 
         SET is_visible = false, display_order = 0 
         WHERE category_type_id = $1`,
        [productTypeId]
    );
    console.log('Reset all product categories to hidden');

    // 3. Define the 4 Core Categories for Dong Duong
    const coreCategories = [
        {
            name: 'Gạch Men & Gạch Ốp Lát',
            en: 'Ceramic & Porcelain Tiles',
            subtitle: 'Đồng Tâm, Taicera, Viglacera',
            subtitle_en: 'Dong Tam, Taicera, Viglacera',
            image_url: '/images/dongduong/cat-gachmen.png',
            icon: 'LayoutGrid',
            display_order: 1,
        },
        {
            name: 'Điều Hòa Cục Bộ (Dòng 2 Cục)',
            en: 'Split Air Conditioning Units',
            subtitle: 'Treo Tường, Âm Trần Cassette, Giấu Trần Nối Ống Gió',
            subtitle_en: 'Wall-mounted, Cassette, Concealed Duct, Multi-split',
            image_url: '/images/dongduong/cat-maylanh.png',
            icon: 'Wind',
            display_order: 2,
        },
        {
            name: 'Điều Hòa Trung Tâm VRV/VRF & Chiller',
            en: 'Central VRV/VRF & Chiller Systems',
            subtitle: 'Centrifugal, Screw Chiller, AHU, FCU, Package',
            subtitle_en: 'Centrifugal, Screw Chiller, AHU, FCU, Package',
            image_url: '/images/dongduong/p-hvac-spec.png',
            icon: 'Cpu',
            display_order: 3,
        },
        {
            name: 'Gạch Trang Trí & Mosaic Cao Cấp',
            en: 'Decorative Mosaic & Art Tiles',
            subtitle: 'Gạch Thẻ, Gạch Bông, Mosaic Pha Lê & Big Slab',
            subtitle_en: 'Subway Tiles, Crystal Mosaic, Big Slab Porcelain',
            image_url: '/images/dongduong/prod-mosaic.png',
            icon: 'Layers',
            display_order: 4,
        },
    ];

    const catIdMap = {};

    for (const cat of coreCategories) {
        const localizedData = {
            vi: cat.name,
            en: cat.en,
            subtitle: cat.subtitle,
            subtitle_en: cat.subtitle_en,
            image_url: cat.image_url,
            icon: cat.icon,
        };

        // Try finding by exact name or existing main category
        let row = (
            await pool.query(
                `SELECT id FROM categories 
                 WHERE category_type_id = $1 AND (name = $2 OR name_localized->>'vi' = $2)
                 LIMIT 1`,
                [productTypeId, cat.name]
            )
        ).rows[0];

        if (!row) {
            row = (
                await pool.query(
                    `INSERT INTO categories (name, name_localized, category_type_id, display_order, is_visible)
                     VALUES ($1, $2, $3, $4, true)
                     RETURNING id`,
                    [cat.name, JSON.stringify(localizedData), productTypeId, cat.display_order]
                )
            ).rows[0];
            console.log('Created category:', cat.name, row.id);
        } else {
            await pool.query(
                `UPDATE categories 
                 SET name = $1, name_localized = $2, display_order = $3, is_visible = true 
                 WHERE id = $4`,
                [cat.name, JSON.stringify(localizedData), cat.display_order, row.id]
            );
            console.log('Updated category:', cat.name, row.id);
        }
        catIdMap[cat.name] = row.id;
    }

    // 4. Un-feature all valve/pump/software/SCADA products
    await pool.query(
        `UPDATE products 
         SET is_featured = false 
         WHERE name ILIKE '%van%' 
            OR name ILIKE '%bơm%' 
            OR name ILIKE '%bom%' 
            OR name ILIKE '%actuator%' 
            OR name ILIKE '%gis%' 
            OR name ILIKE '%iot%' 
            OR name ILIKE '%scada%'
            OR name ILIKE '%sản phẩm test%'`
    );
    console.log('Unfeatured all old valve/pump/SCADA/test products');

    // 5. Seed / Update 6 authentic Dong Duong products
    const featuredProducts = [
        {
            name: 'GẠCH PORCELAIN ĐỒNG TÂM 80x80 CM LUXURY',
            name_en: 'DONG TAM PORCELAIN LUXURY TILES 80x80 CM',
            slug: 'gach-porcelain-dong-tam-80x80-luxury',
            sku: 'DT-8080-LUX',
            price: '480000.00',
            image_url: '/images/dongduong/cat-gachmen.png',
            gallery: [
                '/images/dongduong/cat-gachmen.png',
                '/images/dongduong/p-gach-spec.png',
                '/images/banners/banner2.png',
            ],
            category_name: 'Gạch Men & Gạch Ốp Lát',
            description:
                'Gạch Porcelain cao cấp thương hiệu Đồng Tâm kích thước 80x80 cm, xương đá Granite đồng chất men bóng kháng khuẩn, độ cứng 7 Mohs, siêu chống thấm chống trầy xước cho biệt thự và công trình thương mại.',
            description_en:
                'Premium Dong Tam porcelain tiles 80x80 cm, full-body granite with antibacterial glossy glaze, 7 Mohs hardness, highly durable and waterproof for luxury villas and commercial projects.',
            tech_specs: {
                'Kích thước': '80x80 cm',
                'Thương hiệu': 'Đồng Tâm',
                'Chất liệu': 'Porcelain Xương Đá',
                'Độ hút nước': '< 0.1%',
                'Bề mặt': 'Nano Men Bóng Kháng Khuẩn',
            },
        },
        {
            name: 'ĐIỀU HÒA TREO TƯỜNG DAIKIN INVERTER 2.0 HP',
            name_en: 'DAIKIN INVERTER WALL-MOUNTED AC 2.0 HP',
            slug: 'dieu-hoa-treo-tuong-daikin-inverter-2hp',
            sku: 'FTKZ50VVMV',
            price: '18900000.00',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: [
                '/images/dongduong/cat-maylanh.png',
                '/images/dongduong/p-hvac-spec.png',
                '/images/banners/banner3.png',
            ],
            category_name: 'Điều Hòa Cục Bộ (Dòng 2 Cục)',
            description:
                'Máy lạnh Daikin 2 cục Inverter 2.0 HP công nghệ Streamer lọc khí độc quyền, luồng gió Coanda 3D chống gió buốt, mắt thần thông minh tiết kiệm 65% điện năng, chuẩn năng lượng 5 sao.',
            description_en:
                'Daikin Inverter 2.0 HP wall-mounted split AC with Streamer air purification, Coanda 3D airflow, intelligent eye sensor saving up to 65% power, 5-star energy efficiency rating.',
            tech_specs: {
                'Công suất': '2.0 HP (18.100 BTU/h)',
                'Thương hiệu': 'Daikin (Nhật Bản)',
                'Công nghệ': 'Inverter + Streamer',
                'Môi chất lạnh': 'R-32',
                'Bảo hành': 'Máy 1 năm, Máy nén 5 năm',
            },
        },
        {
            name: 'ĐIỀU HÒA ÂM TRẦN CASSETTE GREE 4 HƯỚNG THỔI 36000 BTU',
            name_en: 'GREE 4-WAY CASSETTE AIR CONDITIONER 36000 BTU',
            slug: 'dieu-hoa-am-tran-cassette-gree-36000btu',
            sku: 'GUD100T-A-GUD100W-NhA-X',
            price: '31500000.00',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: [
                '/images/dongduong/p-hvac-spec.png',
                '/images/dongduong/cat-maylanh.png',
                '/images/banners/banner1.png',
            ],
            category_name: 'Điều Hòa Cục Bộ (Dòng 2 Cục)',
            description:
                'Điều hòa âm trần Cassette thương hiệu Gree 4 hướng thổi luồng gió 360 độ tuần hoàn, tích hợp bơm nước xả tự động nâng 1000mm, vận hành siêu tĩnh âm cho văn phòng, nhà hàng, showroom.',
            description_en:
                'Gree 4-way cassette air conditioner 36000 BTU with 360-degree circular airflow, integrated automatic condensate drain pump up to 1000mm, ultra-quiet operation for offices, restaurants, and showrooms.',
            tech_specs: {
                'Công suất': '4.0 HP (36.000 BTU/h)',
                'Thương hiệu': 'Gree',
                'Loại máy': 'Âm trần Cassette 4 hướng thổi',
                'Điện áp': '380V / 3 Pha / 50Hz',
                'Môi chất lạnh': 'R-410A / R-32',
            },
        },
        {
            name: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM VRV/VRF DAIKIN - GREE',
            name_en: 'CENTRAL VRV/VRF MULTI-ZONE SYSTEM DAIKIN - GREE',
            slug: 'he-thong-dieu-hoa-trung-tam-vrv-vrf',
            sku: 'VRV-X-MAX',
            price: '185000000.00',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: [
                '/images/dongduong/p-hvac-spec.png',
                '/images/dongduong/cat-maylanh.png',
                '/images/dongduong/hero-building.png',
            ],
            category_name: 'Điều Hòa Trung Tâm VRV/VRF & Chiller',
            description:
                'Giải pháp điều hòa trung tâm biến tần VRV/VRF công suất mở rộng lên đến 60HP cho cụm tổ hợp, kết nối tối đa 64 dàn lạnh độc lập (Cassette, Giấu trần nối ống gió). Tiết kiệm năng lượng chuẩn xanh LEED.',
            description_en:
                'Central VRV/VRF inverter system expandable up to 60HP per modular combination, connecting up to 64 independent indoor units (Cassette, Concealed Duct). High seasonal COP compliant with LEED green standards.',
            tech_specs: {
                'Công suất modul': '8HP - 60HP',
                'Hãng sản xuất': 'Daikin / Gree / Midea / LG',
                'Chỉ số COP': 'Lên đến 4.85',
                'Điều khiển': 'Hệ thống quản lý trung tâm BMS / IoT',
                'Bảo hành': 'Toàn diện 3 - 5 năm',
            },
        },
        {
            name: 'MÁY LÀM LẠNH NƯỚC SCREW CHILLER GIẢI NHIỆT NƯỚC',
            name_en: 'WATER-COOLED SCREW CHILLER SYSTEM',
            slug: 'may-lam-lanh-nuoc-screw-chiller',
            sku: 'CHILL-SCREW-100RT',
            price: '420000000.00',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: [
                '/images/dongduong/cat-maylanh.png',
                '/images/dongduong/p-hvac-spec.png',
                '/images/dongduong/hero-building.png',
            ],
            category_name: 'Điều Hòa Trung Tâm VRV/VRF & Chiller',
            description:
                'Hệ thống Chiller giải nhiệt nước máy nén trục vít đôi kép (Twin Screw Compressor), công suất lạnh 100 - 500 RT, cung cấp nước lạnh 7°C cho dàn trao đổi nhiệt AHU/FCU nhà máy công nghiệp và tòa nhà chọc trời.',
            description_en:
                'Water-cooled twin screw chiller system, cooling capacity 100 - 500 RT, delivering chilled water at 7°C to AHU/FCU terminal units for industrial plants and commercial skyscrapers.',
            tech_specs: {
                'Công suất lạnh': '100 RT - 500 RT',
                'Máy nén': 'Trục vít đôi bán kín Semi-hermetic Twin Screw',
                'Môi chất lạnh': 'R134a Thân thiện môi trường',
                'Hệ thống điều khiển': 'Microcomputer PLC màn hình cảm ứng 10 inch',
            },
        },
        {
            name: 'GẠCH TAICERA GRANITE ĐỒNG CHẤT 60x120 CM',
            name_en: 'TAICERA FULL-BODY GRANITE TILES 60x120 CM',
            slug: 'gach-taicera-granite-dong-chat-60x120',
            sku: 'TC-G612-NAT',
            price: '520000.00',
            image_url: '/images/dongduong/p-gach-spec.png',
            gallery: [
                '/images/dongduong/p-gach-spec.png',
                '/images/dongduong/cat-gachmen.png',
                '/images/banners/banner2.png',
            ],
            category_name: 'Gạch Men & Gạch Ốp Lát',
            description:
                'Gạch Granite đồng chất Taicera kích thước khổ lớn 60x120 cm men mờ Satin siêu chống trơn, kháng khuẩn và chịu lực tải trọng cao, kiến tạo không gian sống hiện đại theo phong cách tối giản Bắc Âu.',
            description_en:
                'Taicera full-body granite tiles 60x120 cm with matte Satin glaze, anti-slip R10, high mechanical load capacity, creating modern minimalist aesthetic spaces.',
            tech_specs: {
                'Kích thước': '60x120 cm',
                'Thương hiệu': 'Taicera (Đài Loan / Việt Nam)',
                'Bề mặt': 'Men mờ Satin Matt',
                'Xương gạch': 'Granite đồng chất chịu lực',
                'Ứng dụng': 'Lát nền phòng khách, sảnh, ốp mặt tiền',
            },
        },
        {
            name: 'GẠCH MOSAIC THỦY TINH TRANG TRÍ PHA LÊ LUXURY',
            name_en: 'LUXURY CRYSTAL GLASS MOSAIC TILES',
            slug: 'gach-mosaic-thuy-tinh-trang-tri-pha-le-luxury',
            sku: 'MS-CRYSTAL-08',
            price: '850000.00',
            image_url: '/images/dongduong/prod-mosaic.png',
            gallery: [
                '/images/dongduong/prod-mosaic.png',
                '/images/dongduong/cat-gachmen.png',
                '/images/banners/banner2.png',
            ],
            category_name: 'Gạch Trang Trí & Mosaic Cao Cấp',
            description:
                'Gạch Mosaic thủy tinh cao cấp hiệu ứng ánh kim lấp lánh chống thấm 100%, kháng hóa chất và rêu mốc, chuyên dùng trang trí resort, khách sạn, hồ bơi và không gian spa đẳng cấp.',
            description_en:
                'Premium crystal glass mosaic with sparkling metallic effect, 100% waterproof, chemical and mildew resistant, specialized for luxury resorts, hotels, swimming pools, and spas.',
            tech_specs: {
                'Kích thước vỉ': '300x300 mm (viên 25x25 mm)',
                'Chất liệu': 'Thủy tinh pha lê nung chảy',
                'Độ dày': '6 mm',
                'Ứng dụng': 'Hồ bơi, phòng tắm, vách trang trí sảnh',
            },
        },
        {
            name: 'ĐIỀU HÒA GIẤU TRẦN NỐI ỐNG GIÓ MIDEA INVERTER 5.0 HP',
            name_en: 'MIDEA INVERTER DUCTED AIR CONDITIONER 5.0 HP',
            slug: 'dieu-hoa-giau-tran-noi-ong-gio-midea-inverter-5hp',
            sku: 'MIDEA-DUCT-50INV',
            price: '34500000.00',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: [
                '/images/dongduong/p-hvac-spec.png',
                '/images/dongduong/cat-maylanh.png',
                '/images/banners/banner3.png',
            ],
            category_name: 'Điều Hòa Cục Bộ (Dòng 2 Cục)',
            description:
                'Máy lạnh giấu trần nối ống gió Midea công suất 5.0 HP áp suất tĩnh cao, thiết kế siêu mỏng giấu gọn trong trần thạch cao, phân phối khí tươi đều khắp các phòng qua hệ thống cửa gió khuếch tán.',
            description_en:
                'Midea 5.0 HP high static pressure inverter ducted air conditioner, ultra-slim design concealed within gypsum ceilings, evenly distributing fresh chilled air through diffusers.',
            tech_specs: {
                'Công suất': '5.0 HP (48.000 BTU/h)',
                'Thương hiệu': 'Midea',
                'Áp suất tĩnh': 'Lên đến 160 Pa',
                'Công nghệ': 'Full DC Inverter',
                'Môi chất lạnh': 'R-410A / R-32',
            },
        },
    ];

    for (const p of featuredProducts) {
        const catId = catIdMap[p.category_name] || Object.values(catIdMap)[0];
        const existing = (
            await pool.query('SELECT id FROM products WHERE slug = $1', [p.slug])
        ).rows[0];

        const locName = { vi: p.name, en: p.name_en };
        const locDesc = { vi: p.description, en: p.description_en };

        if (!existing) {
            await pool.query(
                `INSERT INTO products (
                    name, name_localized, slug, sku, price, stock, category_id,
                    status, image_url, gallery, description, description_localized,
                    tech_specs, is_featured
                ) VALUES (
                    $1, $2, $3, $4, $5, 100, $6,
                    'active', $7, $8, $9, $10,
                    $11, true
                )`,
                [
                    p.name,
                    JSON.stringify(locName),
                    p.slug,
                    p.sku,
                    p.price,
                    catId,
                    p.image_url,
                    JSON.stringify(p.gallery),
                    p.description,
                    JSON.stringify(locDesc),
                    JSON.stringify(p.tech_specs),
                ]
            );
            console.log('Inserted product:', p.name);
        } else {
            await pool.query(
                `UPDATE products SET
                    name = $1,
                    name_localized = $2,
                    sku = $3,
                    price = $4,
                    category_id = $5,
                    image_url = $6,
                    gallery = $7,
                    description = $8,
                    description_localized = $9,
                    tech_specs = $10,
                    is_featured = true,
                    status = 'active'
                 WHERE id = $11`,
                [
                    p.name,
                    JSON.stringify(locName),
                    p.sku,
                    p.price,
                    catId,
                    p.image_url,
                    JSON.stringify(p.gallery),
                    p.description,
                    JSON.stringify(locDesc),
                    JSON.stringify(p.tech_specs),
                    existing.id,
                ]
            );
            console.log('Updated product:', p.name);
        }
    }

    // 6. Update Hero Slides in system_settings
    const heroSlides = [
        {
            id: 'slide-1',
            title: 'ĐÔNG DƯƠNG CORPORATION',
            highlight: 'GẠCH MEN CAO CẤP & MÁY LẠNH CHÍNH HÃNG',
            subtitle: 'Tổng đại lý phân phối gạch ốp lát Đồng Tâm, Taicera, Viglacera và hệ thống điều hòa không khí Daikin, Gree, Midea, LG uy tín hàng đầu.',
            image_url: '/images/dongduong/hero-building.png',
            badge: 'TỔNG ĐẠI LÝ PHÂN PHỐI CHÍNH THỨC',
            cta_primary: { text: 'NHẬN BÁO GIÁ DỰ ÁN', link: '#quote-form' },
            cta_secondary: { text: 'DANH MỤC SẢN PHẨM', link: '#equipment-products' },
        },
        {
            id: 'slide-2',
            title: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM',
            highlight: 'VRV / VRF & GIẢI PHÁP CHILLER CÔNG NGHIỆP',
            subtitle: 'Cung cấp và thi công Chiller giải nhiệt nước/gió, hệ thống VRV/VRF, AHU/FCU và điều hòa Packaged cho tòa nhà, nhà máy, khách sạn.',
            image_url: '/images/banners/banner1.png',
            badge: 'CÔNG NGHỆ LẠNH TIÊN TIẾN TIẾT KIỆM NĂNG LƯỢNG',
            cta_primary: { text: 'GIẢI PHÁP VRV - CHILLER', link: '/giai-phap/dieu-hoa-trung-tam-vrv-chiller' },
            cta_secondary: { text: 'TƯ VẤN KỸ THUẬT', link: '#quote-form' },
        },
        {
            id: 'slide-3',
            title: 'GẠCH MEN & GẠCH TRANG TRÍ',
            highlight: 'ĐỒNG TÂM • TAICERA • VIGLACERA',
            subtitle: 'Bộ sưu tập gạch Porcelain, Granite khổ lớn, gạch thẻ, Mosaic nghệ thuật hoàn thiện đẳng cấp mọi không gian sống và công trình thương mại.',
            image_url: '/images/banners/banner2.png',
            badge: 'VẬT LIỆU HOÀN THIỆN ĐẲNG CẤP',
            cta_primary: { text: 'BỘ SƯU TẬP GẠCH', link: '/san-pham' },
            cta_secondary: { text: 'NHẬN CATALOGUE', link: '#quote-form' },
        },
        {
            id: 'slide-4',
            title: 'ĐIỀU HÒA CỤC BỘ DÒNG 2 CỤC',
            highlight: 'TREO TƯỜNG • ÂM TRẦN CASSETTE • GIẤU TRẦN ỐNG GIÓ',
            subtitle: 'Đa dạng công suất và chủng loại từ các thương hiệu hàng đầu Daikin, Gree, Midea, LG, bảo hành chính hãng dài lâu.',
            image_url: '/images/banners/banner3.png',
            badge: 'DAIKIN • GREE • MIDEA • LG',
            cta_primary: { text: 'XEM DÒNG MÁY LẠNH', link: '/san-pham' },
            cta_secondary: { text: 'LIÊN HỆ ĐẶT HÀNG', link: '#quote-form' },
        },
    ];

    await pool.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
        ['homepage_hero_slides', JSON.stringify(heroSlides), 'Dynamic homepage hero carousel slides for Dong Duong']
    );
    console.log('Updated homepage_hero_slides in system_settings');

    console.log('=== DONG DUONG CATALOG UPDATE FINISHED SUCCESSFULLY ===');
    await pool.end();
}

updateCatalog().catch((err) => {
    console.error('Error updating catalog:', err);
    process.exit(1);
});
