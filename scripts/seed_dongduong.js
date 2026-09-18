const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
    console.log('--- STARTING SEED DONG DUONG DATA ---');

    // 1. Get Category Types
    const ctRes = await pool.query('SELECT id, name FROM category_types');
    const ctMap = {};
    ctRes.rows.forEach((r) => {
        ctMap[r.name] = r.id;
    });
    const productTypeId = ctMap['product'];
    const newsTypeId = ctMap['news'];

    // 2. Seed / Update Categories with display order, image, subtitle, and icon in name_localized
    const categoriesToSeed = [
        {
            name: 'Gạch Men Cao Cấp',
            en: 'Premium Ceramic Tiles',
            subtitle: 'Mẫu mã sang trọng, đa dạng',
            image_url: '/images/dongduong/cat-gachmen.png',
            icon: 'LayoutGrid',
            display_order: 1,
        },
        {
            name: 'Máy Lạnh Công Nghiệp',
            en: 'Industrial Air Conditioning',
            subtitle: 'Giải pháp làm mát hiệu suất cao',
            image_url: '/images/dongduong/cat-maylanh.png',
            icon: 'Wind',
            display_order: 2,
        },
        {
            name: 'Van Kim Loại Công Nghiệp',
            en: 'Industrial Metal Valves',
            subtitle: 'Độ bền cao cho hệ thống đường ống',
            image_url: '/images/dongduong/cat-van.png',
            icon: 'Disc',
            display_order: 3,
        },
        {
            name: 'Bơm Công Nghiệp & Thiết Bị Nước',
            en: 'Industrial Pumps & Water Systems',
            subtitle: 'Công suất mạnh mẽ, vận hành ổn định',
            image_url: '/images/dongduong/prod-bom.png',
            icon: 'Activity',
            display_order: 4,
        },
        {
            name: 'Vật Liệu Mosaic Trang Trí',
            en: 'Decorative Mosaic Materials',
            subtitle: 'Nghệ thuật kiến trúc đỉnh cao',
            image_url: '/images/dongduong/prod-mosaic.png',
            icon: 'Layers',
            display_order: 5,
        },
        {
            name: 'Hệ Thống HVAC Thương Mại',
            en: 'Commercial HVAC Solutions',
            subtitle: 'Điều hòa trung tâm thông minh',
            image_url: '/images/dongduong/p-hvac-spec.png',
            icon: 'Cpu',
            display_order: 6,
        },
    ];

    const catMap = {};
    for (const cat of categoriesToSeed) {
        const localizedData = {
            vi: cat.name,
            en: cat.en,
            subtitle: cat.subtitle,
            image_url: cat.image_url,
            icon: cat.icon,
        };

        let row = (
            await pool.query(
                'SELECT id FROM categories WHERE name = $1 AND category_type_id = $2',
                [cat.name, productTypeId]
            )
        ).rows[0];

        if (!row) {
            row = (
                await pool.query(
                    'INSERT INTO categories (name, name_localized, category_type_id, display_order, is_visible) VALUES ($1, $2, $3, $4, true) RETURNING id',
                    [
                        cat.name,
                        JSON.stringify(localizedData),
                        productTypeId,
                        cat.display_order,
                    ]
                )
            ).rows[0];
            console.log('Inserted category:', cat.name, row.id);
        } else {
            await pool.query(
                'UPDATE categories SET name_localized = $1, display_order = $2, is_visible = true WHERE id = $3',
                [JSON.stringify(localizedData), cat.display_order, row.id]
            );
            console.log('Updated category metadata:', cat.name, row.id);
        }
        catMap[cat.name] = row.id;
    }

    // 3. News Category
    const newsCatRow = (
        await pool.query('SELECT id FROM categories WHERE category_type_id = $1 LIMIT 1', [
            newsTypeId,
        ])
    ).rows[0];
    const newsCatId = newsCatRow ? newsCatRow.id : null;

    // 4. Seed / Update Hero Slider Banners in system_settings
    const heroSlides = [
        {
            id: 'slide-1',
            title: 'GIẢI PHÁP VẬT LIỆU & THIẾT BỊ',
            highlight: 'XÂY DỰNG TOÀN DIỆN',
            subtitle: 'Chúng tôi cam kết cung cấp các sản phẩm chất lượng cao, đồng hành cùng mọi công trình kiến trúc hiện đại.',
            image_url: '/images/dongduong/hero-building.png',
            badge: 'ĐỐI TÁC TIN CẬY HÀNG ĐẦU',
            cta_primary: { text: 'LIÊN HỆ BÁO GIÁ', link: '#quote-form' },
            cta_secondary: { text: 'XEM SẢN PHẨM', link: '#equipment-products' },
        },
        {
            id: 'slide-2',
            title: 'HỆ THỐNG VAN & THIẾT BỊ',
            highlight: 'CÔNG NGHIỆP TIÊU CHUẨN CAO',
            subtitle: 'Phân phối các dòng van kim loại, van bướm, van bi và bộ điều khiển tự động chất lượng cao tiêu chuẩn JIS / ANSI.',
            image_url: '/images/banners/banner1.png',
            badge: 'TIÊU CHUẨN QUỐC TẾ JIS / ANSI',
            cta_primary: { text: 'DANH MỤC THIẾT BỊ', link: '/san-pham' },
            cta_secondary: { text: 'TƯ VẤN KỸ THUẬT', link: '#quote-form' },
        },
        {
            id: 'slide-3',
            title: 'GẠCH MEN & VẬT LIỆU MOSAIC',
            highlight: 'HOÀN THIỆN ĐẲNG CẤP DỰ ÁN',
            subtitle: 'Bộ sưu tập gạch khổ lớn và mosaic cao cấp kiến tạo không gian sống và công trình thương mại sang trọng.',
            image_url: '/images/banners/banner2.png',
            badge: 'VẬT LIỆU HOÀN THIỆN CAO CẤP',
            cta_primary: { text: 'BỘ SƯU TẬP GẠCH', link: '/san-pham' },
            cta_secondary: { text: 'NHẬN BÁO GIÁ', link: '#quote-form' },
        },
        {
            id: 'slide-4',
            title: 'MÁY LÀM MÁT & HỆ THỐNG HVAC',
            highlight: 'TIẾT KIỆM NĂNG LƯỢNG VƯỢT TRỘI',
            subtitle: 'Giải pháp làm mát Chiller giải nhiệt gió và điều hòa trung tâm VRV/VRF cho nhà máy và cao ốc.',
            image_url: '/images/banners/banner3.png',
            badge: 'HIỆU SUẤT NĂNG LƯỢNG TỐI ƯU',
            cta_primary: { text: 'GIẢI PHÁP HVAC', link: '/san-pham' },
            cta_secondary: { text: 'LIÊN HỆ KỸ SƯ', link: '#quote-form' },
        },
    ];

    await pool.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
        ['homepage_hero_slides', JSON.stringify(heroSlides), 'Dynamic homepage hero carousel slides']
    );
    console.log('Upserted homepage_hero_slides into system_settings');

    // 5. Seed Products with Rich Multiple Images Gallery
    const productsToSeed = [
        {
            name: 'BƠM NƯỚC CÔNG NGHIỆP CAO CẤP',
            slug: 'bom-nuoc-cong-nghiep-cao-cap',
            sku: 'P-5010',
            price: '15500000.00',
            image_url: '/images/dongduong/prod-bom.png',
            gallery: [
                '/images/dongduong/prod-bom.png',
                '/images/dongduong/p-bom-spec.png',
                '/images/hero/sensor.png',
            ],
            description:
                'Bơm nước công nghiệp công suất lớn 50 m3/h, áp lực 10 bar, vận hành bền bỉ 24/7 cho nhà máy và công trình.',
            category_name: 'Bơm Công Nghiệp & Thiết Bị Nước',
            tech_specs: {
                'Công suất': '50 m3/h',
                'Áp lực': '10 bar',
                Model: 'P-5010',
                'Chất liệu': 'Gang đúc / Cánh Inox',
            },
            is_featured: true,
        },
        {
            name: 'GẠCH MOSAIC TRANG TRÍ PHA LÊ',
            slug: 'gach-mosaic-trang-tri-pha-le',
            sku: 'MOSAIC-PL-01',
            price: '3200000.00',
            image_url: '/images/dongduong/prod-mosaic.png',
            gallery: [
                '/images/dongduong/prod-mosaic.png',
                '/images/dongduong/p-gach-spec.png',
                '/images/dongduong/cat-gachmen.png',
            ],
            description:
                'Gạch Mosaic pha lê trang trí cao cấp, thẩm mỹ sang trọng, chống thấm nước tuyệt đối, phù hợp resort, khách sạn, hồ bơi.',
            category_name: 'Vật Liệu Mosaic Trang Trí',
            tech_specs: {
                'Kích thước': '30x30 cm',
                'Chất liệu': 'Pha lê cao cấp',
                Model: 'MOSAIC-PL',
                'Độ dày': '8 mm',
            },
            is_featured: true,
        },
        {
            name: 'VAN KIM LOẠI CHỊU LỰC INOX 316',
            slug: 'van-kim-loai-chiu-luc-inox-316',
            sku: 'V-DN200',
            price: '4800000.00',
            image_url: '/images/dongduong/p-van-spec.png',
            gallery: [
                '/images/dongduong/p-van-spec.png',
                '/images/dongduong/cat-van.png',
                '/images/hero/actuator.png',
            ],
            description:
                'Van kim loại công nghiệp chịu lực chất liệu Inox 316 tiêu chuẩn mặt bích JIS/ANSI, độ bền vượt trội cho hệ thống đường ống hóa chất, nước sạch.',
            category_name: 'Van Kim Loại Công Nghiệp',
            tech_specs: {
                Size: 'DN200',
                'Chất liệu': 'Inox 316',
                Model: 'V-DN200',
                'Áp lực': '16 bar',
            },
            is_featured: true,
        },
        {
            name: 'GẠCH MEN TRANG TRÍ MODERN',
            slug: 'gach-men-trang-tri-modern',
            sku: 'C-MOD-01',
            price: '850000.00',
            image_url: '/images/dongduong/p-gach-spec.png',
            gallery: [
                '/images/dongduong/p-gach-spec.png',
                '/images/dongduong/cat-gachmen.png',
                '/images/banners/banner2.png',
            ],
            description:
                'Gạch men trang trí phong cách hiện đại khổ 60x120 cm, men vi tinh cao cấp, độ cứng vượt trội, chống bám bẩn và trầy xước.',
            category_name: 'Gạch Men Cao Cấp',
            tech_specs: {
                'Kích thước': '60x120 cm',
                'Chống thấm': 'Cao',
                Model: 'C-MOD',
                'Bề mặt': 'Men bóng cao cấp',
            },
            is_featured: true,
        },
        {
            name: 'HỆ THỐNG HVAC THƯƠNG MẠI VRV',
            slug: 'he-thong-hvac-thuong-mai-vrv',
            sku: 'H-20VRF',
            price: '45000000.00',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: [
                '/images/dongduong/p-hvac-spec.png',
                '/images/dongduong/cat-maylanh.png',
                '/images/banners/banner3.png',
            ],
            description:
                'Hệ thống điều hòa trung tâm VRV/VRF công suất 20HP, hiệu suất năng lượng COP 3.8, công nghệ biến tần tiết kiệm điện cho tòa nhà văn phòng.',
            category_name: 'Hệ Thống HVAC Thương Mại',
            tech_specs: {
                'Công suất': '20HP',
                'Hiệu suất COP': '3.8',
                Model: 'H-20VRF',
                'Môi chất lạnh': 'R410A',
            },
            is_featured: true,
        },
        {
            name: 'VAN BƯỚM OKM ĐIỀU KHIỂN KHÍ NÉN',
            slug: 'van-buom-okm-dieu-khien-khi-nen',
            sku: 'OKM-602A-150',
            price: '6200000.00',
            image_url: '/images/dongduong/cat-van.png',
            gallery: [
                '/images/dongduong/cat-van.png',
                '/images/dongduong/p-van-spec.png',
                '/images/hero/actuator.png',
            ],
            description:
                'Van bướm OKM Japan cao cấp kích cỡ DN150 tích hợp bộ truyền động khí nén tác động kép, đóng mở nhạy bén dưới 2 giây.',
            category_name: 'Van Kim Loại Công Nghiệp',
            tech_specs: {
                Size: 'DN150',
                'Áp lực': '16 bar',
                Model: 'OKM-602A',
                'Xuất xứ': 'Japan',
            },
            is_featured: true,
        },
        {
            name: 'MÁY LÀM MÁT CHILLER GIẢI NHIỆT GIÓ',
            slug: 'may-lam-mat-chiller-giai-nhiet-gio',
            sku: 'CHILL-30RT',
            price: '68000000.00',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: [
                '/images/dongduong/cat-maylanh.png',
                '/images/dongduong/p-hvac-spec.png',
                '/images/banners/banner3.png',
            ],
            description:
                'Máy làm lạnh nước Chiller giải nhiệt gió công suất 30RT, vận hành êm ái, thích hợp khu công nghiệp, kho lạnh và xưởng sản xuất.',
            category_name: 'Máy Lạnh Công Nghiệp',
            tech_specs: {
                'Công suất': '30RT',
                'Điện áp': '380V/3P',
                Model: 'CHILL-30',
                'Hiệu suất': 'Cao',
            },
            is_featured: true,
        },
        {
            name: 'GẠCH GRANITE KHỔ LỚN LUXURY',
            slug: 'gach-granite-kho-lon-luxury',
            sku: 'GRAN-LUX-80160',
            price: '1250000.00',
            image_url: '/images/dongduong/cat-gachmen.png',
            gallery: [
                '/images/dongduong/cat-gachmen.png',
                '/images/dongduong/p-gach-spec.png',
                '/images/banners/banner2.png',
            ],
            description:
                'Gạch granite khổ lớn 80x160 cm xương đá đồng chất, chống trơn trượt, chịu lực cực cao cho sảnh khách sạn và trung tâm thương mại.',
            category_name: 'Gạch Men Cao Cấp',
            tech_specs: {
                'Kích thước': '80x160 cm',
                'Bề mặt': 'Bóng kiếng toàn phần',
                Model: 'GRAN-LUX',
                'Xuất xứ': 'Nhập khẩu',
            },
            is_featured: true,
        },
        {
            name: 'BƠM CHÌM NƯỚC THẢI CÔNG SUẤT LỚN',
            slug: 'bom-chim-nuoc-thai-cong-suat-lon',
            sku: 'SGV-P75',
            price: '18200000.00',
            image_url: '/images/dongduong/p-bom-spec.png',
            gallery: [
                '/images/dongduong/p-bom-spec.png',
                '/images/dongduong/prod-bom.png',
                '/images/hero/sensor.png',
            ],
            description:
                'Máy bơm chìm hút bùn nước thải công nghiệp lưu lượng 75 m3/h, cột áp 25m, cánh cắt chống nghẹt rác chuyên dụng.',
            category_name: 'Bơm Công Nghiệp & Thiết Bị Nước',
            tech_specs: {
                'Công suất': '75 m3/h',
                'Cột áp': '25m',
                Model: 'SGV-P75',
                'Bảo hành': '24 tháng',
            },
            is_featured: true,
        },
        {
            name: 'BỘ TRUYỀN ĐỘNG ĐIỆN NOAH ACTUATOR',
            slug: 'bo-truyen-dong-dien-noah-actuator',
            sku: 'NA-030',
            price: '8900000.00',
            image_url: '/uploads/images/2026/03/10/1773113447268-j83fr0.png',
            gallery: [
                '/uploads/images/2026/03/10/1773113447268-j83fr0.png',
                '/images/dongduong/cat-van.png',
                '/images/hero/actuator.png',
            ],
            description:
                'Bộ truyền động điều khiển điện NOAH Korea lực xoắn 300 Nm, chuẩn chống nước IP67/IP68, điều khiển đóng mở ON/OFF hoặc tỷ lệ 4-20mA.',
            category_name: 'Van Kim Loại Công Nghiệp',
            tech_specs: {
                'Điện áp': '220V / 50Hz',
                'Lực kéo': '300 Nm',
                Model: 'NA-030',
                'Tiêu chuẩn': 'IP67',
            },
            is_featured: true,
        },
    ];

    for (const p of productsToSeed) {
        const catId = catMap[p.category_name] || Object.values(catMap)[0];
        const existing = (
            await pool.query('SELECT id FROM products WHERE slug = $1', [p.slug])
        ).rows[0];

        if (!existing) {
            await pool.query(
                `INSERT INTO products (
                    name, name_localized, slug, sku, price, stock, category_id,
                    status, image_url, gallery, description, description_localized,
                    tech_specs, is_featured
                ) VALUES (
                    $1, $2, $3, $4, $5, 100, $6,
                    'active', $7, $8, $9, $10,
                    $11, $12
                )`,
                [
                    p.name,
                    JSON.stringify({ vi: p.name, en: p.name }),
                    p.slug,
                    p.sku,
                    p.price,
                    catId,
                    p.image_url,
                    JSON.stringify(p.gallery),
                    p.description,
                    JSON.stringify({ vi: p.description, en: p.description }),
                    JSON.stringify(p.tech_specs),
                    p.is_featured,
                ]
            );
            console.log('Inserted product:', p.name);
        } else {
            await pool.query(
                `UPDATE products SET 
                    image_url = $1,
                    gallery = $2,
                    tech_specs = $3,
                    is_featured = $4,
                    price = $5,
                    description = $6,
                    description_localized = $7
                WHERE id = $8`,
                [
                    p.image_url,
                    JSON.stringify(p.gallery),
                    JSON.stringify(p.tech_specs),
                    p.is_featured,
                    p.price,
                    p.description,
                    JSON.stringify({ vi: p.description, en: p.description }),
                    existing.id,
                ]
            );
            console.log('Updated product:', p.name);
        }
    }

    // 6. Seed News Articles
    const newsToSeed = [
        {
            title: 'Dự báo giá cà phê thế giới 2026',
            slug: 'du-bao-gia-ca-phe-the-gioi-2026',
            content: 'Phân tích biến động giá và chuỗi cung ứng nông sản toàn cầu trong năm 2026.',
            image_url: '/images/dongduong/news-1.png',
            published_at: '2026-09-14 10:00:00',
        },
        {
            title: 'Thị trường vàng biến động - Lời khuyên cho nhà đầu tư',
            slug: 'thi-truong-vang-bien-dong-2026',
            content: 'Những yếu tố ảnh hưởng đến kim loại quý và giải pháp bảo toàn vốn hiệu quả.',
            image_url: '/images/dongduong/news-2.png',
            published_at: '2026-09-13 14:30:00',
        },
        {
            title: 'Hiệp định thương mại mới - Cơ hội cho hàng hóa xuất khẩu VN',
            slug: 'hiep-dinh-thuong-mai-moi-2026',
            content: 'Tận dụng các ưu đãi thuế quan để mở rộng thị phần tại thị trường quốc tế.',
            image_url: '/images/dongduong/news-3.png',
            published_at: '2026-09-12 09:15:00',
        },
        {
            title: 'Đại hội ngành nước & vật tư thiết bị xây dựng 2026',
            slug: 'dai-hoi-nganh-nuoc-va-vat-tu-2026',
            content: 'Đông Dương tham gia trưng bày và giới thiệu công nghệ vật liệu xây dựng tiên tiến.',
            image_url: '/images/dongduong/cat-van.png',
            published_at: '2026-09-11 16:00:00',
        },
    ];

    for (const n of newsToSeed) {
        const existing = (
            await pool.query('SELECT id FROM news_articles WHERE slug = $1', [n.slug])
        ).rows[0];

        if (!existing) {
            await pool.query(
                `INSERT INTO news_articles (
                    title, title_localized, slug, summary, summary_localized, content, content_localized,
                    status, category_id, image_url, published_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    'published', $8, $9, $10
                )`,
                [
                    n.title,
                    JSON.stringify({ vi: n.title, en: n.title }),
                    n.slug,
                    n.content,
                    JSON.stringify({ vi: n.content, en: n.content }),
                    n.content,
                    JSON.stringify({ vi: n.content, en: n.content }),
                    newsCatId,
                    n.image_url,
                    n.published_at,
                ]
            );
            console.log('Inserted news article:', n.title);
        } else {
            await pool.query(
                `UPDATE news_articles SET 
                    image_url = $1,
                    summary = $2,
                    summary_localized = $3,
                    published_at = $4,
                    status = 'published'
                WHERE id = $5`,
                [
                    n.image_url,
                    n.content,
                    JSON.stringify({ vi: n.content, en: n.content }),
                    n.published_at,
                    existing.id,
                ]
            );
            console.log('Updated news article:', n.title);
        }
    }

    console.log('--- SEED COMPLETED SUCCESSFULLY ---');
    await pool.end();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    pool.end();
    process.exit(1);
});
