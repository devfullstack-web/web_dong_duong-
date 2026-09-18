const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedMaster() {
    console.log('====================================================');
    console.log('--- STARTING DONG DUONG MASTER DATABASE SEEDING ---');
    console.log('====================================================');

    // 1. Get Category Types
    const ctRes = await pool.query('SELECT id, name FROM category_types');
    const ctMap = {};
    ctRes.rows.forEach((r) => {
        ctMap[r.name] = r.id;
    });
    const productTypeId = ctMap['product'];
    const newsTypeId = ctMap['news'];
    const projectTypeId = ctMap['project'];

    if (!productTypeId || !newsTypeId || !projectTypeId) {
        throw new Error('Missing category_types in database!');
    }

    // 2. SEED CATEGORIES
    const categoriesData = [
        {
            name: 'Gạch Ốp Lát Đồng Tâm',
            en: 'Dong Tam Ceramic & Porcelain Tiles',
            subtitle: 'Thương hiệu quốc gia, chất lượng vượt trội',
            image_url: '/images/dongduong/cat-gachmen.png',
            icon: 'LayoutGrid',
            display_order: 1,
        },
        {
            name: 'Gạch Ốp Lát Taicera',
            en: 'Taicera Polished & Granite Tiles',
            subtitle: 'Thạch anh đồng chất, chịu lực cao',
            image_url: '/images/dongduong/p-gach-spec.png',
            icon: 'Layers',
            display_order: 2,
        },
        {
            name: 'Gạch Men Viglacera',
            en: 'Viglacera Ceramic & Porcelain',
            subtitle: 'Men Nano kháng khuẩn, chống trơn trượt',
            image_url: '/images/dongduong/cat-gachmen.png',
            icon: 'Grid',
            display_order: 3,
        },
        {
            name: 'Gạch Catalan Cao Cấp',
            en: 'Catalan Luxury Porcelain',
            subtitle: 'Tiêu chuẩn châu Âu, vân đá tự nhiên',
            image_url: '/images/dongduong/p-gach-spec.png',
            icon: 'Sparkles',
            display_order: 4,
        },
        {
            name: 'Gạch Trang Trí & Mosaic',
            en: 'Decorative & Mosaic Tiles',
            subtitle: 'Nghệ thuật kiến trúc cho resort & hồ bơi',
            image_url: '/images/dongduong/prod-mosaic.png',
            icon: 'Sparkles',
            display_order: 5,
        },
        {
            name: 'Máy Lạnh Treo Tường Inverter',
            en: 'Inverter Wall-Mounted Air Conditioners',
            subtitle: 'Gree, Midea, Daikin, LG siêu tiết kiệm điện',
            image_url: '/images/dongduong/cat-maylanh.png',
            icon: 'Wind',
            display_order: 6,
        },
        {
            name: 'Máy Lạnh Âm Trần Cassette',
            en: 'Cassette Ceiling Air Conditioners',
            subtitle: 'Đảo gió 360 độ, tinh tế cho văn phòng',
            image_url: '/images/dongduong/p-hvac-spec.png',
            icon: 'Activity',
            display_order: 7,
        },
        {
            name: 'Máy Lạnh Giấu Trần Nối Ống Gió',
            en: 'Duct Connected Air Conditioners',
            subtitle: 'Thẩm mỹ sang trọng, làm mát đồng đều',
            image_url: '/images/dongduong/p-hvac-spec.png',
            icon: 'Cpu',
            display_order: 8,
        },
        {
            name: 'Điều Hòa Trung Tâm VRV / VRF',
            en: 'Central VRV / VRF HVAC Systems',
            subtitle: 'Hệ thống điều hòa tổng cho biệt thự & cao ốc',
            image_url: '/images/dongduong/cat-maylanh.png',
            icon: 'Building2',
            display_order: 9,
        },
        {
            name: 'Hệ Thống Chiller Làm Lạnh Nước',
            en: 'Water Chiller Cooling Systems',
            subtitle: 'Công suất cực lớn cho nhà máy & trung tâm thương mại',
            image_url: '/images/dongduong/p-hvac-spec.png',
            icon: 'Cpu',
            display_order: 10,
        },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
        const localized = {
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
                    [cat.name, JSON.stringify(localized), productTypeId, cat.display_order]
                )
            ).rows[0];
            console.log('Inserted Product Category:', cat.name, row.id);
        } else {
            await pool.query(
                'UPDATE categories SET name_localized = $1, display_order = $2, is_visible = true WHERE id = $3',
                [JSON.stringify(localized), cat.display_order, row.id]
            );
            console.log('Updated Product Category:', cat.name, row.id);
        }
        categoryMap[cat.name] = row.id;
    }

    // Also get or insert News Category
    let newsCat = (
        await pool.query('SELECT id FROM categories WHERE category_type_id = $1 LIMIT 1', [newsTypeId])
    ).rows[0];
    if (!newsCat) {
        newsCat = (
            await pool.query(
                'INSERT INTO categories (name, name_localized, category_type_id, display_order, is_visible) VALUES ($1, $2, $3, 1, true) RETURNING id',
                ['Tin Tức & Kiến Thức Kỹ Thuật', JSON.stringify({ vi: 'Tin Tức & Kiến Thức Kỹ Thuật', en: 'News & Engineering Guides' }), newsTypeId]
            )
        ).rows[0];
    }
    const newsCatId = newsCat.id;

    // Also get or insert Project Category
    let projCat = (
        await pool.query('SELECT id FROM categories WHERE category_type_id = $1 LIMIT 1', [projectTypeId])
    ).rows[0];
    if (!projCat) {
        projCat = (
            await pool.query(
                'INSERT INTO categories (name, name_localized, category_type_id, display_order, is_visible) VALUES ($1, $2, $3, 1, true) RETURNING id',
                ['Dự Án Tiêu Biểu', JSON.stringify({ vi: 'Dự Án Tiêu Biểu', en: 'Featured Projects' }), projectTypeId]
            )
        ).rows[0];
    }
    const projCatId = projCat.id;

    // 3. SEED PRODUCTS (20 Real, High-Quality Technical Products)
    const masterProducts = [
        // --- 1. GẠCH ĐỒNG TÂM ---
        {
            name: 'GẠCH ĐỒNG TÂM 80x80 DONGTAM PORCELAIN LUXURY',
            name_en: 'Dong Tam 80x80 Luxury Porcelain Tiles',
            slug: 'gach-dong-tam-80x80-dongtam-porcelain-luxury',
            sku: 'DT-LUX-8080',
            price: 420000,
            stock: 500,
            category_name: 'Gạch Ốp Lát Đồng Tâm',
            image_url: '/images/dongduong/cat-gachmen.png',
            gallery: ['/images/dongduong/cat-gachmen.png', '/images/dongduong/p-gach-spec.png', '/images/dongduong/partners/dongtam.png'],
            is_featured: true,
            warranty: 'Chính hãng 10 năm',
            origin: 'Đồng Tâm - Việt Nam',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận chân công trình toàn quốc',
            tech_summary: 'Xương Porcelain siêu cứng, kích thước 80x80 cm, men vi tinh bóng kiếng sang trọng, chống bám bẩn nano vượt trội.',
            tech_summary_en: 'Ultra-hard Porcelain body, 80x80 cm size, glossy nano anti-fouling glazed surface for luxury living spaces.',
            description: '<p>Dòng gạch Porcelain 80x80 cm của Đồng Tâm Group ứng dụng công nghệ in kỹ thuật số tiên tiến nhất. Thích hợp cho phòng khách biệt thự, sảnh lễ tân khách sạn và tòa nhà văn phòng cao cấp.</p>',
            description_en: '<p>Dong Tam Group 80x80 cm Porcelain tile series engineered with digital high-definition printing technology. Ideal for villa living rooms, hotel lobbies, and premium office spaces.</p>',
            tech_specs: {
                'Kích thước': '80 x 80 cm',
                'Xương gạch': 'Porcelain cao cấp',
                'Bề mặt': 'Men bóng vi tính Nano',
                'Độ hút nước': '< 0.5%',
                'Kháng mài mòn': 'Class 4',
                'Quy cách đóng gói': '3 viên / hộp (1.92 m²)',
            },
            tech_specs_en: {
                'Dimensions': '80 x 80 cm',
                'Tile Body': 'Premium Porcelain',
                'Surface': 'Nano Glossy Polished',
                'Water Absorption': '< 0.5%',
                'Abrasion Resistance': 'Class 4',
                'Packaging': '3 pcs / box (1.92 m²)',
            },
            features: [
                'Xương gạch Porcelain siêu cứng, độ bền uốn vượt trội',
                'Bề mặt phủ men Nano kháng khuẩn và chống bám bẩn',
                'Họa tiết vân đá cẩm thạch sang trọng, độ tinh xảo cao',
                'Chống trơn trượt đạt tiêu chuẩn xây dựng dân dụng',
            ],
            features_en: [
                'Ultra-durable Porcelain body with high flexural strength',
                'Nano anti-bacterial and stain-resistant glazed coating',
                'Luxurious marble vein design with high graphic fidelity',
                'Slip-resistant rating meeting modern architectural standards',
            ],
        },
        // --- 2. GẠCH TAICERA ---
        {
            name: 'GẠCH TAICERA 60x60 THẠCH ANH BÓNG KIẾNG CRYSTAL',
            name_en: 'Taicera 60x60 Polished Quartz Crystal Tiles',
            slug: 'gach-taicera-60x60-thach-anh-bong-kieng-crystal',
            sku: 'TAI-G68028',
            price: 385000,
            stock: 450,
            category_name: 'Gạch Ốp Lát Taicera',
            image_url: '/images/dongduong/p-gach-spec.png',
            gallery: ['/images/dongduong/p-gach-spec.png', '/images/dongduong/cat-gachmen.png'],
            is_featured: true,
            warranty: 'Chính hãng 10 năm',
            origin: 'Taicera - Công nghệ Đài Loan',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận nơi toàn quốc',
            tech_summary: 'Gạch thạch anh đồng chất 60x60 cm, độ cứng Mohs 7, chịu lực nén cực đại, bề mặt xử lý bóng Nano chống trầy.',
            tech_summary_en: 'Full-body homogeneous quartz tile 60x60 cm, Mohs 7 hardness, maximum compressive resistance with Nano anti-scratch polish.',
            description: '<p>Gạch Taicera Thạch Anh bóng kiếng là giải pháp số 1 cho các khu vực có mật độ đi lại cao như hành lang, trung tâm thương mại, showroom ô tô và căn hộ cao cấp.</p>',
            description_en: '<p>Taicera Polished Quartz tile is the premier solution for heavy traffic zones such as commercial corridors, shopping malls, car showrooms, and luxury residences.</p>',
            tech_specs: {
                'Kích thước': '60 x 60 cm',
                'Chủng loại': 'Thạch anh đồng chất (Full body)',
                'Bề mặt': 'Mài bóng Nano Crystal',
                'Độ hút nước': '< 0.1%',
                'Độ cứng bề mặt': '7 Mohs',
                'Đóng gói': '4 viên / hộp (1.44 m²)',
            },
            tech_specs_en: {
                'Dimensions': '60 x 60 cm',
                'Classification': 'Full-body homogeneous Quartz',
                'Surface': 'Nano Crystal Polished',
                'Water Absorption': '< 0.1%',
                'Surface Hardness': '7 Mohs',
                'Packaging': '4 pcs / box (1.44 m²)',
            },
            features: [
                'Cốt liệu thạch anh đồng chất từ đáy lên bề mặt',
                'Khả năng chống trầy xước và chịu mài mòn hoàn hảo',
                'Không bị bay màu hay ố vàng sau hàng chục năm sử dụng',
                'Độ phẳng và góc cạnh chuẩn xác theo tiêu chuẩn ISO 10545',
            ],
            features_en: [
                'Homogeneous quartz body throughout the tile structure',
                'Superior resistance to abrasion and scratch damage',
                'Never fades, discolors, or yellows over decades of use',
                'Precision rectified edges compliant with ISO 10545',
            ],
        },
        // --- 3. GẠCH VIGLACERA ---
        {
            name: 'GẠCH VIGLACERA 60x120 PLATINUM NANO KHÁNG KHUẨN',
            name_en: 'Viglacera 60x120 Platinum Anti-bacterial Large Slab',
            slug: 'gach-viglacera-60x120-platinum-nano-khang-khuan',
            sku: 'VIG-PL-612',
            price: 490000,
            stock: 350,
            category_name: 'Gạch Men Viglacera',
            image_url: '/images/dongduong/cat-gachmen.png',
            gallery: ['/images/dongduong/cat-gachmen.png', '/images/dongduong/partners/viglacera.png'],
            is_featured: true,
            warranty: 'Chính hãng 10 năm',
            origin: 'Viglacera - Việt Nam',
            availability: 'Sẵn hàng tại kho',
            delivery_info: 'Vận chuyển xe tải chuyên dụng tận công trình',
            tech_summary: 'Gạch khổ lớn 60x120 cm thuộc dòng Platinum cao cấp, men Nano TiO2 tự làm sạch và tiêu diệt 99% vi khuẩn có hại.',
            tech_summary_en: 'Large-format slab 60x120 cm Platinum series, equipped with Nano TiO2 self-cleaning coating destroying 99% of harmful bacteria.',
            description: '<p>Dòng sản phẩm Viglacera Platinum khổ lớn kiến tạo không gian mở đẳng cấp với ít đường ron, mang lại vẻ đẹp liền mạch cho tường phòng khách và sàn nhà tắm hiện đại.</p>',
            description_en: '<p>Viglacera Platinum large slab collection provides minimal grout lines for open, modern architectural continuity across walls and floors.</p>',
            tech_specs: {
                'Kích thước': '60 x 120 cm',
                'Độ dày': '10 mm',
                'Bề mặt': 'Men Satin bán mờ chống trơn',
                'Công nghệ': 'Nano TiO2 diệt khuẩn tự nhiên',
                'Tiêu chuẩn': 'TCVN 7745 / ISO 13006',
                'Đóng gói': '2 viên / hộp (1.44 m²)',
            },
            tech_specs_en: {
                'Dimensions': '60 x 120 cm',
                'Thickness': '10 mm',
                'Surface': 'Anti-slip Semi-matte Satin',
                'Technology': 'Nano TiO2 natural bacterial elimination',
                'Standards': 'TCVN 7745 / ISO 13006',
                'Packaging': '2 pcs / box (1.44 m²)',
            },
            features: [
                'Kích thước khổ lớn hiện đại, giảm thiểu đường ron chỉ',
                'Công nghệ Nano TiO2 bảo vệ sức khỏe cả gia đình',
                'Khả năng chống trơn trượt R10 an toàn cho người lớn tuổi',
                'Chống bám ố cà phê, dầu mỡ và hóa chất tẩy rửa gia dụng',
            ],
            features_en: [
                'Contemporary large format minimizing grout joints',
                'Nano TiO2 active technology protecting family health',
                'R10 slip-resistance rating safe for senior citizens',
                'Resistant to coffee, grease stains and household chemicals',
            ],
        },
        // --- 4. GẠCH CATALAN ---
        {
            name: 'GẠCH CATALAN 80x80 TITAN PORCELAIN XUẤT KHẨU',
            name_en: 'Catalan 80x80 Titan Export Porcelain Tiles',
            slug: 'gach-catalan-80x80-titan-porcelain-xuat-khau',
            sku: 'CTL-TITAN-80',
            price: 350000,
            stock: 600,
            category_name: 'Gạch Catalan Cao Cấp',
            image_url: '/images/dongduong/p-gach-spec.png',
            gallery: ['/images/dongduong/p-gach-spec.png', '/images/dongduong/partners/catalan.png'],
            is_featured: false,
            warranty: 'Chính hãng 10 năm',
            origin: 'Catalan - Việt Nam xuất khẩu',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận nơi toàn quốc',
            tech_summary: 'Xương gạch Porcelain nung 1220 độ C, hoa văn vân đá Calacatta Italy sắc nét, độ hút nước dưới 0.2%.',
            tech_summary_en: 'Porcelain body kiln-fired at 1220°C, sharp Italian Calacatta marble veins with water absorption under 0.2%.',
            description: '<p>Gạch Catalan Titan đạt chuẩn xuất khẩu sang thị trường châu Âu và Mỹ. Thiết kế tinh xảo, vân đá đối xứng sang trọng cho căn hộ và biệt thự.</p>',
            description_en: '<p>Catalan Titan series certified for export to European and American markets. Sophisticated bookmatch marble designs for luxury homes.</p>',
            tech_specs: {
                'Kích thước': '80 x 80 cm',
                'Chất liệu': 'Porcelain nung nhiệt độ cao',
                'Bề mặt': 'Bóng gương Super Glossy',
                'Độ dày': '9.5 mm',
                'Quy cách': '3 viên / hộp (1.92 m²)',
            },
            tech_specs_en: {
                'Dimensions': '80 x 80 cm',
                'Material': 'High-temperature fired Porcelain',
                'Surface': 'Super Glossy Mirror Polish',
                'Thickness': '9.5 mm',
                'Packaging': '3 pcs / box (1.92 m²)',
            },
            features: [
                'Nung nhiệt độ cao 1220°C cho xương gạch đanh chắc',
                'Màu men nhập khẩu từ Tây Ban Nha và Italy',
                'Chống thấm nước tuyệt đối, không ẩm mốc nồm mùa mưa',
            ],
            features_en: [
                'Fired at 1220°C for exceptional structural rigidity',
                'Imported glaze pigments from Spain and Italy',
                'Zero moisture penetration preventing mold and dampness',
            ],
        },
        // --- 5. GẠCH MOSAIC TRANG TRÍ ---
        {
            name: 'GẠCH MOSAIC THỦY TINH TRANG TRÍ HỒ BƠI & RESORT',
            name_en: 'Decorative Glass Mosaic Tiles for Pools & Resorts',
            slug: 'gach-mosaic-thuy-tinh-trang-tri-ho-boi-resort',
            sku: 'MOSAIC-GL-01',
            price: 680000,
            stock: 300,
            category_name: 'Gạch Trang Trí & Mosaic',
            image_url: '/images/dongduong/prod-mosaic.png',
            gallery: ['/images/dongduong/prod-mosaic.png', '/images/dongduong/p-gach-spec.png'],
            is_featured: true,
            warranty: 'Chính hãng 5 năm',
            origin: 'Nhập khẩu cao cấp',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận chân công trình',
            tech_summary: 'Vỉ Mosaic thủy tinh cao cấp chống hóa chất clo, phản chiếu ánh sáng lấp lánh cho hồ bơi, spa và điểm nhấn phòng tắm.',
            tech_summary_en: 'Premium glass mosaic sheet resistant to pool chlorine, reflecting sparkling light for swimming pools and luxury spas.',
            description: '<p>Gạch Mosaic thủy tinh cao cấp được xử lý nhiệt bề mặt chống phai màu, chịu được axit và kiềm nhẹ của hóa chất xử lý nước hồ bơi.</p>',
            description_en: '<p>Thermally treated glass mosaic sheets engineered to withstand pool chemicals, UV exposure, and heavy moisture environments.</p>',
            tech_specs: {
                'Kích thước vỉ': '30 x 30 cm',
                'Kích thước viên': '25 x 25 mm',
                'Độ dày': '4 mm',
                'Chất liệu': 'Thủy tinh nung màu đặc',
                'Lưới dán': 'Lưới thủy tinh chịu lực',
            },
            tech_specs_en: {
                'Sheet Size': '30 x 30 cm',
                'Chip Size': '25 x 25 mm',
                'Thickness': '4 mm',
                'Material': 'Solid Pigmented Glass',
                'Backing': 'Fiberglass structural mesh',
            },
            features: [
                'Phản quang lấp lánh dưới ánh nắng và đèn chiếu hồ bơi',
                'Chống thấm nước và kháng hóa chất xử lý nước 100%',
                'Dễ dàng cắt uốn theo các đường cong kiến trúc phức tạp',
            ],
            features_en: [
                'Sparkling light reflection under sunlight and underwater fixtures',
                '100% waterproof and chemical-resistant construction',
                'Flexible mesh backing easily installs along curved surfaces',
            ],
        },
        // --- 6. MÁY LẠNH GREE 1.5 HP ---
        {
            name: 'MÁY LẠNH GREE INVERTER 1.5 HP REAL COOL (GWC12PB)',
            name_en: 'Gree Inverter 1.5 HP Real Cool Air Conditioner',
            slug: 'may-lanh-gree-inverter-1-5-hp-real-cool-gwc12pb',
            sku: 'GREE-INV-15HP',
            price: 8990000,
            stock: 80,
            category_name: 'Máy Lạnh Treo Tường Inverter',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/partners/gree.png'],
            is_featured: true,
            warranty: '3 năm toàn máy, 5 năm máy nén',
            origin: 'Gree - Tập đoàn điều hòa số 1 toàn cầu',
            availability: 'Sẵn hàng, lắp đặt trong ngày',
            delivery_info: 'Miễn phí giao hàng nội thành',
            tech_summary: 'Công nghệ Real Inverter tiết kiệm điện 65%, môi chất lạnh R32 thân thiện môi trường, cảm biến thông minh I-Feel.',
            tech_summary_en: 'Real Inverter technology saving up to 65% power, eco-friendly R32 refrigerant, smart I-Feel room temperature sensor.',
            description: '<p>Máy lạnh Gree 1.5 HP GWC12PB làm lạnh nhanh với chế độ Turbo chỉ sau 3 phút khởi động. Màng lọc mật độ cao kết hợp Cold Plasma bảo vệ hệ hô hấp toàn diện.</p>',
            description_en: '<p>Gree 1.5 HP GWC12PB delivers rapid cooling within 3 minutes of startup. High-density filter with Cold Plasma protects respiratory health.</p>',
            tech_specs: {
                'Công suất làm lạnh': '12.000 BTU/h (1.5 HP)',
                'Công nghệ Inverter': 'Real Inverter tiết kiệm 65% điện',
                'Môi chất lạnh': 'Gas R32',
                'Hiệu suất năng lượng': 'CSPF 4.85 (5 Sao)',
                'Độ ồn dàn lạnh': 'Chỉ 24 dB (Cực kỳ êm)',
                'Điện năng tiêu thụ': '0.98 kW/h',
            },
            tech_specs_en: {
                'Cooling Capacity': '12,000 BTU/h (1.5 HP)',
                'Inverter Technology': 'Real Inverter (65% energy savings)',
                'Refrigerant': 'R32 Eco Gas',
                'Energy Efficiency': 'CSPF 4.85 (5 Stars)',
                'Indoor Sound Level': 'Only 24 dB (Ultra Quiet)',
                'Power Consumption': '0.98 kW/h',
            },
            features: [
                'Tiết kiệm điện vượt trội với động cơ Real Inverter',
                'Cảm biến I-Feel điều chỉnh nhiệt độ chính xác vị trí người dùng',
                'Vận hành cực êm ái, rất phù hợp cho phòng ngủ người già và trẻ nhỏ',
                'Màng lọc kháng khuẩn Cold Plasma khử sạch 99% mùi hôi và bụi bẩn',
            ],
            features_en: [
                'Superior power savings with Real Inverter motor',
                'I-Feel sensor delivers precision temperature right where you sit',
                'Whisper-quiet operation perfect for seniors and children bedrooms',
                'Cold Plasma antimicrobial filtration eliminating 99% of odors and dust',
            ],
        },
        // --- 7. MÁY LẠNH MIDEA 2.0 HP ---
        {
            name: 'MÁY LẠNH MIDEA INVERTER QUATTRO 2.0 HP (MSFRA-18CRDN8)',
            name_en: 'Midea Inverter Quattro 2.0 HP Air Conditioner',
            slug: 'may-lanh-midea-inverter-quattro-2-0-hp-msfra-18crdn8',
            sku: 'MIDEA-QUAT-20HP',
            price: 11450000,
            stock: 60,
            category_name: 'Máy Lạnh Treo Tường Inverter',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/partners/midea.png'],
            is_featured: true,
            warranty: '3 năm máy, 5 năm máy nén',
            origin: 'Midea - Chính hãng',
            availability: 'Sẵn hàng tại kho',
            delivery_info: 'Giao hàng và lắp đặt tận nơi',
            tech_summary: 'Công nghệ Inverter Quattro làm lạnh tức thì chỉ 30 giây, dàn tản nhiệt mạ vàng Golden Fin chống ăn mòn muối biển.',
            tech_summary_en: 'Inverter Quattro technology cooling rooms in 30 seconds, Golden Fin anti-corrosive heat exchanger resisting coastal salinity.',
            description: '<p>Máy lạnh Midea Inverter Quattro 2.0 HP phù hợp cho không gian phòng khách hoặc văn phòng 20 - 30 m². Dàn nóng mạ vàng Golden Fin chống chịu thời tiết khắc nghiệt.</p>',
            description_en: '<p>Midea Inverter Quattro 2.0 HP is tailored for 20-30 m² rooms. Golden Fin heat exchanger withstands heavy salt air and rain corrosion.</p>',
            tech_specs: {
                'Công suất làm lạnh': '18.000 BTU/h (2.0 HP)',
                'Công nghệ': 'Inverter Quattro thế hệ mới',
                'Môi chất làm lạnh': 'Gas R32',
                'Dàn tản nhiệt': 'Mạ vàng Golden Fin chống gỉ sét',
                'Phạm vi làm mát': '20 - 30 m²',
                'Điện áp': '220V / 50Hz',
            },
            tech_specs_en: {
                'Cooling Capacity': '18,000 BTU/h (2.0 HP)',
                'Technology': 'Next-gen Inverter Quattro',
                'Refrigerant': 'R32 Gas',
                'Heat Exchanger': 'Anti-rust Golden Fin coating',
                'Recommended Area': '20 - 30 m²',
                'Electrical': '220V / 50Hz',
            },
            features: [
                'Công nghệ Quattro làm lạnh siêu tốc chỉ trong 30 giây',
                'Dàn tản nhiệt mạ vàng bền bỉ gấp 3 lần dàn thường',
                'Chế độ GearShift tùy chỉnh mức tiết kiệm điện linh hoạt 50% - 70%',
                'Hệ thống tự làm sạch Self-Cleaning sấy khô dàn lạnh chống nấm mốc',
            ],
            features_en: [
                'Quattro technology cooling the space in just 30 seconds',
                'Golden Fin coating lasts 3x longer than conventional condensers',
                'GearShift mode flexibly adjusts power savings between 50% and 70%',
                'Self-Cleaning function automatically dries internal coils preventing mold',
            ],
        },
        // --- 8. MÁY LẠNH DAIKIN 1.0 HP ---
        {
            name: 'MÁY LẠNH DAIKIN INVERTER 1.0 HP FTKF25XVMV STREAMER',
            name_en: 'Daikin Inverter 1.0 HP FTKF25 Streamer Air Conditioner',
            slug: 'may-lanh-daikin-inverter-1-0-hp-ftkf25xvmv-streamer',
            sku: 'DAIKIN-FTKF25',
            price: 10850000,
            stock: 90,
            category_name: 'Máy Lạnh Treo Tường Inverter',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/p-hvac-spec.png'],
            is_featured: true,
            warranty: '1 năm thiết bị, 5 năm máy nén',
            origin: 'Daikin - Công nghệ Nhật Bản (Sản xuất tại Việt Nam)',
            availability: 'Sẵn hàng tại kho',
            delivery_info: 'Miễn phí giao hàng & lắp đặt nhanh',
            tech_summary: 'Công nghệ lọc khí độc quyền Streamer, luồng gió Coanda không thổi trực tiếp vào người già và trẻ nhỏ, bảo vệ sức khỏe tối đa.',
            tech_summary_en: 'Exclusive Streamer air purification, Coanda airflow preventing direct drafts onto elderly and children, maximum health protection.',
            description: '<p>Daikin FTKF25XVMV là chuẩn mực điều hòa cao cấp Nhật Bản với phin lọc Enzyme Blue tích hợp PM2.5, dàn tản nhiệt Microchannel chống ăn mòn siêu bền.</p>',
            description_en: '<p>Daikin FTKF25XVMV embodies Japanese premium engineering with Enzyme Blue + PM2.5 filtration and durable Microchannel condenser coils.</p>',
            tech_specs: {
                'Công suất làm lạnh': '9.200 BTU/h (1.0 HP)',
                'Công nghệ Inverter': 'Biến tần Inverter tiết kiệm điện',
                'Lọc không khí': 'Streamer độc quyền + Enzyme Blue PM2.5',
                'Luồng gió': 'Coanda thổi lên trần nhà, êm dịu',
                'Dàn tản nhiệt': 'Ống vi ống Microchannel siêu bền',
            },
            tech_specs_en: {
                'Cooling Capacity': '9,200 BTU/h (1.0 HP)',
                'Inverter Technology': 'Precision Inverter energy saver',
                'Air Filtration': 'Proprietary Streamer + Enzyme Blue PM2.5',
                'Airflow Distribution': 'Coanda gentle upward ceiling draft',
                'Heat Exchanger': 'Heavy-duty Microchannel alloy',
            },
            features: [
                'Luồng gió Coanda hướng lên trần nhà, hoàn toàn không gây buốt lạnh cho người già',
                'Công nghệ Streamer phân hủy vi khuẩn và chất gây dị ứng tận gốc',
                'Phin lọc Enzyme Blue loại bỏ 99.9% mùi hôi và bụi mịn PM2.5',
                'Bo mạch điện tử chịu được điện áp trồi sụt từ 150V đến 440V',
            ],
            features_en: [
                'Coanda airflow directs cold air along ceiling, preventing harsh drafts on seniors',
                'Streamer discharge technology decomposes bacteria and allergens at molecular level',
                'Enzyme Blue filter eliminates 99.9% of odors and airborne PM2.5 particles',
                'Voltage-surge protected PCB operational between 150V and 440V',
            ],
        },
        // --- 9. MÁY LẠNH LG 2.5 HP ---
        {
            name: 'MÁY LẠNH LG DUAL INVERTER 2.5 HP V24WIN PLASMASTER',
            name_en: 'LG Dual Inverter 2.5 HP V24WIN Plasmaster AC',
            slug: 'may-lanh-lg-dual-inverter-2-5-hp-v24win-plasmaster',
            sku: 'LG-V24WIN',
            price: 16900000,
            stock: 40,
            category_name: 'Máy Lạnh Treo Tường Inverter',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/p-hvac-spec.png'],
            is_featured: false,
            warranty: '2 năm toàn máy, 10 năm máy nén',
            origin: 'LG - Thái Lan',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng và lắp đặt tận nhà',
            tech_summary: 'Máy nén Dual Inverter tiết kiệm điện 70%, làm lạnh nhanh 40%, ion Plasmaster khử khuẩn và kết nối điều khiển qua smartphone qua Wifi.',
            tech_summary_en: 'Dual Inverter compressor saves 70% power and cools 40% faster, Plasmaster ion purification and smartphone Wi-Fi control.',
            description: '<p>Máy lạnh LG Dual Inverter 2.5 HP V24WIN thích hợp không gian lớn 30 - 40 m². Kết nối ứng dụng LG ThinQ cho phép bật tắt và hẹn giờ từ bất kỳ đâu.</p>',
            description_en: '<p>LG Dual Inverter 2.5 HP V24WIN cools spacious areas up to 40 m². LG ThinQ smart app allows full remote management anywhere.</p>',
            tech_specs: {
                'Công suất': '24.000 BTU/h (2.5 HP)',
                'Công nghệ máy nén': 'Dual Inverter 2 mô-tơ độc lập',
                'Tiết kiệm điện': 'Lên tới 70% so với máy thường',
                'Tính năng thông minh': 'Wifi LG ThinQ kết nối điện thoại',
                'Khử khuẩn': 'Plasmaster Ionizer++',
            },
            tech_specs_en: {
                'Capacity': '24,000 BTU/h (2.5 HP)',
                'Compressor': 'Dual Inverter dual-motor design',
                'Energy Savings': 'Up to 70% vs non-inverter units',
                'Smart Features': 'LG ThinQ app Wi-Fi connectivity',
                'Purification': 'Plasmaster Ionizer++',
            },
            features: [
                'Máy nén Dual Inverter bảo hành chính hãng lên tới 10 năm',
                'Phát hàng triệu ion Plasmaster tiêu diệt vi khuẩn bám dính',
                'Điều khiển nhiệt độ từ xa qua điện thoại bằng giọng nói',
            ],
            features_en: [
                'Dual Inverter compressor backed by official 10-year warranty',
                'Emits millions of Plasmaster ions neutralizing surface bacteria',
                'Remote climate monitoring and voice control via smartphone',
            ],
        },
        // --- 10. ĐIỀU HÒA ÂM TRẦN CASSETTE DAIKIN 4.0 HP ---
        {
            name: 'ĐIỀU HÒA ÂM TRẦN CASSETTE DAIKIN 4.0 HP FCF100CVM',
            name_en: 'Daikin 4.0 HP Cassette Ceiling Air Conditioner',
            slug: 'dieu-hoa-am-tran-cassette-daikin-4-0-hp-fcf100cvm',
            sku: 'DAIKIN-CAS-4HP',
            price: 36800000,
            stock: 35,
            category_name: 'Máy Lạnh Âm Trần Cassette',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: ['/images/dongduong/p-hvac-spec.png', '/images/dongduong/cat-maylanh.png'],
            is_featured: true,
            warranty: '1 năm thiết bị, 5 năm máy nén',
            origin: 'Daikin - Thái Lan',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận chân công trình toàn quốc',
            tech_summary: 'Thiết kế âm trần tinh tế, đảo gió 360 độ Round Flow không góc chết, biến tần Inverter tiết kiệm điện cho văn phòng và nhà hàng sang trọng.',
            tech_summary_en: 'Sleek cassette ceiling unit, 360-degree Round Flow circulation eliminating dead spots, Inverter efficiency for offices and luxury dining.',
            description: '<p>Điều hòa âm trần Cassette Daikin FCF100CVM 4.0 HP tỏa gió đồng đều 360 độ, bơm nước xả tự động đưa nước ngưng lên cao 850mm, lắp đặt thẩm mỹ hoàn hảo.</p>',
            description_en: '<p>Daikin Cassette FCF100CVM 4.0 HP circulates airflow in a complete 360° circle, built-in condensate lift pump raising drain water up to 850mm.</p>',
            tech_specs: {
                'Công suất làm lạnh': '34.100 BTU/h (4.0 HP)',
                'Công nghệ luồng gió': 'Round Flow 360 độ không điểm mù',
                'Biến tần': 'Inverter tiết kiệm điện cao cấp',
                'Bơm nước xả': 'Tích hợp sẵn nâng cao 850 mm',
                'Nguồn điện': '380V / 3 Pha / 50Hz',
            },
            tech_specs_en: {
                'Cooling Capacity': '34,100 BTU/h (4.0 HP)',
                'Airflow Distribution': '360° Round Flow without blind spots',
                'Inverter': 'Premium energy-efficient inverter',
                'Drain Pump': 'Built-in high-lift pump up to 850 mm',
                'Power Supply': '380V / 3 Phase / 50Hz',
            },
            features: [
                'Mặt nạ chuẩn vuông 950x950 mm thẩm mỹ hài hòa với mọi hệ trần thạch cao',
                'Luồng gió 360 độ giúp nhiệt độ phòng luôn đồng đều, không gây sốc nhiệt',
                'Tích hợp bơm xả nước ngưng áp lực cao ngăn chặn rò rỉ nước tràn trần',
            ],
            features_en: [
                'Standard 950x950 mm square architectural panel seamlessly fits ceiling tiles',
                '360° circular airflow ensures uniform room climate without cold blasts',
                'High-pressure built-in drain pump prevents any ceiling condensation overflow',
            ],
        },
        // --- 11. ĐIỀU HÒA GIẤU TRẦN NỐI ỐNG GIÓ MIDEA 5.0 HP ---
        {
            name: 'ĐIỀU HÒA GIẤU TRẦN NỐI ỐNG GIÓ MIDEA INVERTER 5.0 HP',
            name_en: 'Midea 5.0 HP Inverter Duct Connected Air Conditioner',
            slug: 'dieu-hoa-giau-tran-noi-ong-gio-midea-inverter-5-0-hp',
            sku: 'MIDEA-DUCT-5HP',
            price: 34500000,
            stock: 30,
            category_name: 'Máy Lạnh Giấu Trần Nối Ống Gió',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: ['/images/dongduong/p-hvac-spec.png', '/images/dongduong/cat-maylanh.png'],
            is_featured: true,
            warranty: '3 năm toàn máy, 5 năm máy nén',
            origin: 'Midea - Chính hãng',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận chân công trình',
            tech_summary: 'Áp suất tĩnh cao lên tới 160Pa, thiết kế siêu mỏng giấu gọn trong trần thạch cao, phân phối khí tươi đều khắp các phòng qua hệ thống cửa gió khuếch tán.',
            tech_summary_en: 'High static pressure up to 160Pa, ultra-slim concealed ceiling design delivering fresh conditioned air through diffused ducts.',
            description: '<p>Điều hòa nối ống gió Midea 5.0 HP Inverter là lựa chọn hàng đầu cho biệt thự và căn hộ penthouse cao cấp yêu cầu tính thẩm mỹ không lộ dàn lạnh.</p>',
            description_en: '<p>Midea 5.0 HP Inverter Ducted AC is the top choice for luxury villas and penthouses requiring completely concealed HVAC aesthetic.',
            tech_specs: {
                'Công suất làm lạnh': '48.000 BTU/h (5.0 HP)',
                'Áp suất tĩnh': 'Lên tới 160 Pa (Dẫn gió xa)',
                'Công nghệ': 'Full DC Inverter tiết kiệm điện',
                'Độ dày thân máy': 'Chỉ 270 mm (Lắp trần hẹp dễ dàng)',
                'Môi chất lạnh': 'Gas R410A / R32',
            },
            tech_specs_en: {
                'Cooling Capacity': '48,000 BTU/h (5.0 HP)',
                'Static Pressure': 'Up to 160 Pa (Long-distance ducting)',
                'Motor Type': 'Full DC Inverter efficiency',
                'Unit Height': 'Only 270 mm (Fits shallow ceiling plenums)',
                'Refrigerant': 'R410A / R32',
            },
            features: [
                'Giấu kín hoàn toàn trong trần, chỉ nhìn thấy miệng gió trang trí tinh tế',
                'Có thể chia ra nhiều cửa gió làm mát đồng thời nhiều vị trí trong phòng',
                'Động cơ quạt DC điều khiển vô cấp êm ái, không gây rung lắc trần',
            ],
            features_en: [
                'Fully concealed inside ceiling; only elegant air grilles remain visible',
                'Easily splits into multiple supply grilles cooling diverse room sectors',
                'Stepless DC fan motor runs vibration-free with ultra-low acoustic footprint',
            ],
        },
        // --- 12. HỆ THỐNG VRV DAIKIN 20 HP ---
        {
            name: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM DAIKIN VRV X 20 HP',
            name_en: 'Daikin VRV X 20 HP Central Commercial HVAC System',
            slug: 'he-thong-dieu-hoa-trung-tam-daikin-vrv-x-20-hp',
            sku: 'DAIKIN-VRV-20HP',
            price: 285000000,
            stock: 15,
            category_name: 'Điều Hòa Trung Tâm VRV / VRF',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/p-hvac-spec.png'],
            is_featured: true,
            warranty: 'Chính hãng 5 năm máy nén',
            origin: 'Daikin - Nhật Bản / Thái Lan',
            availability: 'Tư vấn khảo sát & thiết kế kỹ thuật',
            delivery_info: 'Bàn giao và lắp đặt trọn gói hệ thống',
            tech_summary: 'Tổ hợp dàn nóng VRV X thế hệ mới, chỉ số hiệu suất năng lượng COP vượt trội 4.41, kết nối tối đa 32 dàn lạnh đa dạng chủng loại.',
            tech_summary_en: 'New-generation VRV X outdoor system, outstanding COP efficiency 4.41, connecting up to 32 indoor units of diverse styles.',
            description: '<p>Daikin VRV X là giải pháp điều hòa trung tâm đỉnh cao cho biệt thự vườn, tòa nhà văn phòng và khách sạn. Hệ thống điều khiển nhiệt độ độc lập từng phòng.</p>',
            description_en: '<p>Daikin VRV X represents the pinnacle of central climate engineering for estate villas, corporate buildings, and hotels with room-by-room zone control.</p>',
            tech_specs: {
                'Công suất dàn nóng': '20 HP (191.000 BTU/h)',
                'Hệ số hiệu suất COP': '4.41 (Tiết kiệm năng lượng hàng đầu)',
                'Số dàn lạnh tối đa': 'Kết nối 32 dàn lạnh',
                'Chiều dài đường ống': 'Lên tới 1000 mét',
                'Môi chất': 'Gas R410A bảo vệ môi trường',
            },
            tech_specs_en: {
                'Outdoor Unit Capacity': '20 HP (191,000 BTU/h)',
                'COP Rating': '4.41 (Industry-leading efficiency)',
                'Max Indoor Units': 'Connects up to 32 indoor units',
                'Total Pipe Length': 'Up to 1,000 meters',
                'Refrigerant': 'Eco R410A gas',
            },
            features: [
                'Kiểm soát nhiệt độ độc lập từng phòng, bật phòng nào tốn điện phòng đó',
                'Hệ thống quản lý thông minh trung tâm I-Touch Manager',
                'Độ tin cậy vận hành 24/7 với chế độ sao lưu máy nén tự động',
            ],
            features_en: [
                'Individual zone climate control; only consumes power in occupied rooms',
                'Centralized building intelligence via I-Touch Manager interface',
                '24/7 bulletproof reliability with automatic compressor backup redundancy',
            ],
        },
        // --- 13. HỆ THỐNG VRF GREE GMV6 24 HP ---
        {
            name: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM GREE GMV6 24 HP',
            name_en: 'Gree GMV6 24 HP Central VRF System',
            slug: 'he-thong-dieu-hoa-trung-tam-gree-gmv6-24-hp',
            sku: 'GREE-GMV6-24HP',
            price: 320000000,
            stock: 12,
            category_name: 'Điều Hòa Trung Tâm VRV / VRF',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: ['/images/dongduong/p-hvac-spec.png', '/images/dongduong/cat-maylanh.png'],
            is_featured: false,
            warranty: 'Chính hãng 5 năm toàn diện',
            origin: 'Gree - Tập đoàn điều hòa số 1 thế giới',
            availability: 'Khảo sát & thiết kế kỹ thuật',
            delivery_info: 'Bàn giao và nghiệm thu công trình',
            tech_summary: 'Hệ thống VRF GMV6 tích hợp trí tuệ nhân tạo AI dự đoán tải lạnh, công nghệ sưởi ấm & làm lạnh nhanh, tự làm sạch dàn nóng.',
            tech_summary_en: 'GMV6 VRF system infused with artificial intelligence predictive load modeling, fast thermal response, and self-cleaning coils.',
            description: '<p>Gree GMV6 24 HP sở hữu công nghệ biến tần kỹ thuật số 360 độ, dải điện áp vận hành cực rộng, đáp ứng tiêu chuẩn khắt khe của tòa nhà xanh LOTUS/LEED.</p>',
            description_en: '<p>Gree GMV6 24 HP features 360° digital inverter control and wide operational voltage, qualifying for LOTUS/LEED green building standards.</p>',
            tech_specs: {
                'Công suất': '24 HP (230.000 BTU/h)',
                'Công nghệ AI': 'Tự tối ưu hóa điện năng theo thời tiết',
                'Tỷ lệ kết nối': '50% đến 135% công suất',
                'Điện áp': '380V - 415V / 3P / 50Hz',
            },
            tech_specs_en: {
                'Capacity': '24 HP (230,000 BTU/h)',
                'AI Technology': 'Weather-adaptive load optimization',
                'Connection Ratio': '50% to 135% capacity',
                'Power Supply': '380V - 415V / 3P / 50Hz',
            },
            features: [
                'Trí tuệ nhân tạo AI tiết kiệm thêm 20% điện năng so với thế hệ GMV5',
                'Hệ thống tự động rũ bụi và tuyết trên cánh tản nhiệt dàn nóng',
                'Vận hành bền bỉ ở nhiệt độ ngoài trời từ -25°C đến 52°C',
            ],
            features_en: [
                'AI algorithms saving an extra 20% power compared to GMV5 generation',
                'Automatic reverse fan purge shakes off dust and debris from outdoor coils',
                'Rugged operational envelope enduring ambient temps from -25°C up to 52°C',
            ],
        },
        // --- 14. CHILLER MIDEA GIẢI NHIỆT GIÓ 50 RT ---
        {
            name: 'MÁY LÀM LẠNH NƯỚC CHILLER GIẢI NHIỆT GIÓ TRỤC VÍT 50 RT MIDEA',
            name_en: 'Midea 50 RT Air-Cooled Screw Chiller System',
            slug: 'may-lam-lanh-nuoc-chiller-giai-nhiet-gio-truc-vit-50-rt-midea',
            sku: 'MIDEA-CHILL-50RT',
            price: 480000000,
            stock: 8,
            category_name: 'Hệ Thống Chiller Làm Lạnh Nước',
            image_url: '/images/dongduong/p-hvac-spec.png',
            gallery: ['/images/dongduong/p-hvac-spec.png', '/images/dongduong/cat-maylanh.png'],
            is_featured: true,
            warranty: '3 năm trọn bộ hệ thống',
            origin: 'Midea Carrier - Tiêu chuẩn công nghiệp',
            availability: 'Sẵn hàng, tư vấn lắp đặt kỹ thuật',
            delivery_info: 'Cẩu hạ và lắp đặt tận móng máy công trình',
            tech_summary: 'Máy nén trục vít bán kín hiệu suất cao, dàn ngưng tụ ống đồng cánh nhôm mạ Hydrophilic, điều khiển vi xử lý PLC thông minh.',
            tech_summary_en: 'High-efficiency semi-hermetic twin-screw compressor, copper tube with Hydrophilic coated aluminum fins, intelligent PLC microprocessor.',
            description: '<p>Chiller giải nhiệt gió 50 RT Midea làm lạnh nước tuần hoàn cho hệ thống AHU/FCU của nhà máy sản xuất dược phẩm, điện tử và bệnh viện.</p>',
            description_en: '<p>Midea 50 RT Air-Cooled Screw Chiller circulates chilled water to AHU/FCU arrays in pharmaceutical plants, cleanrooms, and hospitals.</p>',
            tech_specs: {
                'Công suất lạnh': '50 RT (175 kW lạnh)',
                'Loại máy nén': 'Trục vít đôi bán kín Semi-hermetic',
                'Môi chất làm lạnh': 'R134a thân thiện môi trường',
                'Kiểm soát công suất': 'Vô cấp từ 25% đến 100%',
                'Lưu lượng nước lạnh': '30 m³/h',
            },
            tech_specs_en: {
                'Cooling Capacity': '50 RT (175 kW thermal)',
                'Compressor Type': 'Semi-hermetic twin-screw',
                'Refrigerant': 'R134a eco-friendly refrigerant',
                'Capacity Stepping': 'Stepless 25% to 100% modulation',
                'Chilled Water Flow': '30 m³/h',
            },
            features: [
                'Không cần tháp giải nhiệt nước, tiết kiệm chi phí hóa chất xử lý nước giải nhiệt',
                'Máy nén trục vít chuyển động êm, tuổi thọ vòng bi trên 50.000 giờ',
                'Giao thức kết nối BMS Modbus / BACnet tiêu chuẩn tự động hóa tòa nhà',
            ],
            features_en: [
                'Eliminates cooling towers, slashing water treatment and chemical expenses',
                'Twin-screw smooth rotary motion ensures bearing life exceeding 50,000 hours',
                'BMS integration ready with native Modbus / BACnet automation protocols',
            ],
        },
        // --- 15. CHILLER DAIKIN GIẢI NHIỆT NƯỚC 80 RT ---
        {
            name: 'HỆ THỐNG CHILLER GIẢI NHIỆT NƯỚC DAIKIN INVERTER 80 RT',
            name_en: 'Daikin Inverter Water-Cooled Chiller 80 RT',
            slug: 'he-thong-chiller-giai-nhiet-nuoc-daikin-inverter-80-rt',
            sku: 'DAIKIN-CHILL-80RT',
            price: 690000000,
            stock: 5,
            category_name: 'Hệ Thống Chiller Làm Lạnh Nước',
            image_url: '/images/dongduong/cat-maylanh.png',
            gallery: ['/images/dongduong/cat-maylanh.png', '/images/dongduong/p-hvac-spec.png'],
            is_featured: false,
            warranty: '5 năm máy nén chính hãng',
            origin: 'Daikin Nhật Bản',
            availability: 'Đặt hàng kỹ thuật dự án',
            delivery_info: 'Bàn giao, đấu nối và chuyển giao công nghệ',
            tech_summary: 'Chiller giải nhiệt nước công nghệ biến tần Inverter, hệ số IPLV lên tới 9.2, vận hành siêu tiết kiệm điện năng cho cao ốc thương mại.',
            tech_summary_en: 'Water-cooled centrifugal/screw inverter chiller, IPLV rating reaching 9.2, optimal utility savings for commercial high-rises.',
            description: '<p>Chiller giải nhiệt nước Daikin 80 RT là biểu tượng công nghệ làm mát hiệu suất cao số 1 thế giới, giúp tiết kiệm hàng trăm triệu tiền điện mỗi năm.</p>',
            description_en: '<p>Daikin 80 RT Water-Cooled Inverter Chiller represents world-class HVAC performance, cutting utility bills by hundreds of millions annually.</p>',
            tech_specs: {
                'Công suất lạnh': '80 RT (281 kW lạnh)',
                'Công nghệ máy nén': 'Trục vít biến tần Inverter đơn',
                'Hệ số IPLV': 'Đạt 9.2 (Siêu tiết kiệm điện tải non)',
                'Bình bốc hơi': 'Ống chùm ngập lỏng hiệu suất cao',
            },
            tech_specs_en: {
                'Cooling Capacity': '80 RT (281 kW thermal)',
                'Compressor': 'Single inverter-driven screw design',
                'IPLV Efficiency': 'Reaches 9.2 (Ultra-efficient part-load performance)',
                'Evaporator': 'High-performance flooded shell & tube',
            },
            features: [
                'Hệ số IPLV 9.2 cắt giảm tối đa chi phí tiền điện trong các khung giờ tải non',
                'Độ ồn cực thấp dưới 75 dB(A) đạt tiêu chuẩn âm học khu đô thị',
                'Màn hình cảm ứng màu LCD 10 inch hiển thị đầy đủ thông số áp suất và nhiệt độ',
            ],
            features_en: [
                'IPLV 9.2 slashes operational electricity costs during part-load hours',
                'Sub-75 dB(A) acoustic envelope meeting strict urban environmental codes',
                '10-inch color touchscreen interface with real-time pressure & temperature diagnostics',
            ],
        },
        // --- 16. GẠCH THẺ GỖ ĐỒNG TÂM ---
        {
            name: 'GẠCH THẺ VÂN GỖ TỰ NHIÊN ĐỒNG TÂM 15x80 WOOD VENEER',
            name_en: 'Dong Tam 15x80 Natural Wood Grain Tiles',
            slug: 'gach-the-van-go-tu-nhien-dong-tam-15x80-wood-veneer',
            sku: 'DT-WOOD-1580',
            price: 310000,
            stock: 550,
            category_name: 'Gạch Ốp Lát Đồng Tâm',
            image_url: '/images/dongduong/cat-gachmen.png',
            gallery: ['/images/dongduong/cat-gachmen.png', '/images/dongduong/p-gach-spec.png'],
            is_featured: false,
            warranty: 'Chính hãng 10 năm',
            origin: 'Đồng Tâm - Việt Nam',
            availability: 'Sẵn hàng tại tổng kho',
            delivery_info: 'Giao hàng tận nhà toàn quốc',
            tech_summary: 'Kích thước thanh gỗ 15x80 cm vân sồi tự nhiên, xương gạch Granite chịu ẩm tuyệt đối thay thế sàn gỗ tự nhiên không lo mối mọt.',
            tech_summary_en: '15x80 cm oak grain porcelain plank, moisture-proof alternative to hardwood with zero termite or warping vulnerability.',
            description: '<p>Gạch vân gỗ Đồng Tâm mang lại vẻ ấm cúng mộc mạc của gỗ tự nhiên kết hợp độ bền vĩnh cửu của đá Granite. Thích hợp lát phòng ngủ và ban công ngoài trời.</p>',
            description_en: '<p>Dong Tam wood-look tiles fuse the warmth of timber with the eternal durability of granite, perfect for bedrooms and outdoor terraces.</p>',
            tech_specs: {
                'Kích thước': '15 x 80 cm',
                'Bề mặt': 'Men mờ vân nổi tự nhiên (Sugar)',
                'Xương gạch': 'Granite bán sứ',
                'Đóng gói': '8 viên / hộp (0.96 m²)',
            },
            tech_specs_en: {
                'Dimensions': '15 x 80 cm',
                'Surface': 'Natural textured matte (Sugar effect)',
                'Body': 'Semi-porcelain granite',
                'Packaging': '8 pcs / box (0.96 m²)',
            },
            features: [
                'Không lo mối mọt, không cong vênh phồng rộp khi dính nước',
                'Vân gỗ in kỹ thuật số ngẫu nhiên 6 faces chân thực như gỗ tự nhiên',
                'Chống trầy xước từ móng vuốt thú cưng và giày cao gót',
            ],
            features_en: [
                'Zero risk of termite infestation, water warping or swelling',
                'Random 6-face digital printing authentic to natural timber grains',
                'Highly resistant to pet claws, furniture dragging, and high heels',
            ],
        },
    ];

    for (const p of masterProducts) {
        const catId = categoryMap[p.category_name];
        if (!catId) {
            console.warn('Skipping product with missing category:', p.name, p.category_name);
            continue;
        }

        const localizedName = { vi: p.name, en: p.name_en };
        const localizedDesc = { vi: p.description, en: p.description_en };
        const localizedSummary = { vi: p.tech_summary, en: p.tech_summary_en };
        const localizedSpecs = { vi: p.tech_specs, en: p.tech_specs_en };
        const localizedFeatures = { vi: p.features, en: p.features_en };

        const existing = (
            await pool.query('SELECT id FROM products WHERE slug = $1', [p.slug])
        ).rows[0];

        if (existing) {
            await pool.query(
                `UPDATE products SET
                    name = $1,
                    name_localized = $2,
                    description = $3,
                    description_localized = $4,
                    price = $5,
                    sku = $6,
                    stock = $7,
                    category_id = $8,
                    status = 'active',
                    image_url = $9,
                    gallery = $10,
                    is_featured = $11,
                    warranty = $12,
                    origin = $13,
                    availability = $14,
                    delivery_info = $15,
                    tech_summary = $16,
                    tech_summary_localized = $17,
                    tech_specs = $18,
                    tech_specs_localized = $19,
                    features = $20,
                    features_localized = $21,
                    updated_at = NOW()
                 WHERE id = $22`,
                [
                    p.name,
                    JSON.stringify(localizedName),
                    p.description,
                    JSON.stringify(localizedDesc),
                    p.price,
                    p.sku,
                    p.stock,
                    catId,
                    p.image_url,
                    JSON.stringify(p.gallery),
                    p.is_featured,
                    p.warranty,
                    p.origin,
                    p.availability,
                    p.delivery_info,
                    p.tech_summary,
                    JSON.stringify(localizedSummary),
                    JSON.stringify(p.tech_specs),
                    JSON.stringify(localizedSpecs),
                    JSON.stringify(p.features),
                    JSON.stringify(localizedFeatures),
                    existing.id,
                ]
            );
            console.log('Updated Product:', p.name, existing.id);
        } else {
            const inserted = (
                await pool.query(
                    `INSERT INTO products (
                        name, name_localized, slug, description, description_localized,
                        price, sku, stock, category_id, status, image_url, gallery,
                        is_featured, warranty, origin, availability, delivery_info,
                        tech_summary, tech_summary_localized, tech_specs, tech_specs_localized,
                        features, features_localized, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11,
                        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW()
                    ) RETURNING id`,
                    [
                        p.name,
                        JSON.stringify(localizedName),
                        p.slug,
                        p.description,
                        JSON.stringify(localizedDesc),
                        p.price,
                        p.sku,
                        p.stock,
                        catId,
                        p.image_url,
                        JSON.stringify(p.gallery),
                        p.is_featured,
                        p.warranty,
                        p.origin,
                        p.availability,
                        p.delivery_info,
                        p.tech_summary,
                        JSON.stringify(localizedSummary),
                        JSON.stringify(p.tech_specs),
                        JSON.stringify(localizedSpecs),
                        JSON.stringify(p.features),
                        JSON.stringify(localizedFeatures),
                    ]
                )
            ).rows[0];
            console.log('Inserted Product:', p.name, inserted.id);
        }
    }

    // 4. SEED NEWS ARTICLES (Specialized for Tiles and Air Conditioners)
    const newsArticles = [
        {
            title: 'Kinh nghiệm chọn gạch ốp lát Đồng Tâm & Viglacera cho biệt thự và nhà phố',
            title_en: 'Guide to Selecting Dong Tam & Viglacera Tiles for Villas and Townhouses',
            slug: 'kinh-nghiem-chon-gach-op-lat-dong-tam-viglacera-cho-biet-thu-nha-pho',
            summary: 'Chia sẻ các tiêu chí quan trọng về kích thước khổ lớn 80x80, 60x120, độ hút nước và độ chống trơn trượt an toàn cho gia đình có người lớn tuổi.',
            summary_en: 'Key selection criteria for large format slabs (80x80, 60x120), water resistance and slip safety for households with elderly family members.',
            image_url: '/images/dongduong/news-1.png',
            content: '<p>Lựa chọn gạch ốp lát không chỉ đơn thuần là vấn đề thẩm mỹ mà còn quyết định đến sự an toàn và độ bền lâu dài của công trình. Với gia đình có người già và trẻ nhỏ, bề mặt men Satin hoặc Sugar chống trơn trượt chuẩn R10 của Viglacera và Đồng Tâm luôn là ưu tiên hàng đầu.</p>',
            content_en: '<p>Selecting tiles goes beyond aesthetics to determine structural longevity and home safety. For homes with seniors and children, R10-rated satin and textured slip-resistant surfaces from Viglacera and Dong Tam are essential.</p>',
        },
        {
            title: 'So sánh chi tiết điều hòa trung tâm VRV Daikin và VRF Gree / Midea thế hệ mới',
            title_en: 'Comprehensive Comparison: Daikin VRV vs Next-Gen Gree & Midea VRF Systems',
            slug: 'so-sanh-chi-tiet-dieu-hoa-trung-tam-vrv-daikin-va-vrf-gree-midea',
            summary: 'Phân tích hiệu suất năng lượng COP, chi phí đầu tư ban đầu và độ ổn định khi lắp đặt cho cao ốc văn phòng và khách sạn 4-5 sao.',
            summary_en: 'Energy COP analysis, capital expenditure tradeoffs, and operational reliability for corporate offices and 4-star hotels.',
            image_url: '/images/dongduong/news-2.png',
            content: '<p>Hệ thống điều hòa trung tâm VRV và VRF là giải pháp tối ưu cho không gian thương mại. Bài viết so sánh công nghệ máy nén, hệ số tiết kiệm điện và dịch vụ bảo hành chính hãng giữa các thương hiệu hàng đầu.</p>',
            content_en: '<p>VRV and VRF central climate systems are the gold standard for commercial facilities. This article reviews compressor engineering, energy efficiency, and warranty support among top brands.</p>',
        },
        {
            title: 'Top 5 xu hướng gạch Mosaic thủy tinh trang trí bể bơi và khu nghỉ dưỡng 2026',
            title_en: 'Top 5 Glass Mosaic Tile Trends for Luxury Pools and Resorts in 2026',
            slug: 'top-5-xu-huong-gach-mosaic-thuy-tinh-trang-tri-be-boi-resort-2026',
            summary: 'Khám phá các gam màu xanh biển ngọc lam, hoa văn chuyển màu gradient và chất liệu thủy tinh phản quang đẳng cấp.',
            summary_en: 'Explore turquoise sea tones, gradient color shifts, and radiant reflective glass materials redefining contemporary leisure spaces.',
            image_url: '/images/dongduong/news-3.png',
            content: '<p>Gạch Mosaic thủy tinh đang là xu hướng kiến trúc nổi bật cho các công trình resort ven biển nhờ khả năng chống muối mặn và phản chiếu ánh sáng lấp lánh dưới làn nước.</p>',
            content_en: '<p>Glass mosaic tiles lead outdoor architectural aesthetics for coastal resorts thanks to complete salinity resistance and shimmering water optics.</p>',
        },
        {
            title: 'Hướng dẫn bảo dưỡng và vệ sinh máy lạnh định kỳ giúp tiết kiệm 30% điện năng',
            title_en: 'Step-by-Step Air Conditioner Maintenance Guide Saving 30% on Electric Bills',
            slug: 'huong-dan-bao-duong-ve-sinh-may-lanh-dinh-ky-tiet-kiem-dien',
            summary: 'Quy trình kiểm tra lưới lọc, dàn tản nhiệt và áp suất gas lạnh định kỳ giúp máy chạy êm ái, kéo dài tuổi thọ trên 10 năm.',
            summary_en: 'Proper inspection routines for air filters, condenser coils, and refrigerant pressure ensuring quiet operation and 10+ year lifespan.',
            image_url: '/images/dongduong/news-1.png',
            content: '<p>Bảo dưỡng điều hòa đúng cách không chỉ bảo vệ máy nén mà còn giúp không khí trong nhà luôn trong lành, ngăn ngừa các bệnh về đường hô hấp cho người lớn tuổi.</p>',
            content_en: '<p>Routine AC servicing preserves compressor longevity while sustaining clean indoor air quality, reducing respiratory discomfort for elderly residents.</p>',
        },
    ];

    for (const art of newsArticles) {
        const existing = (await pool.query('SELECT id FROM news_articles WHERE slug = $1', [art.slug])).rows[0];
        const localizedTitle = { vi: art.title, en: art.title_en };
        const localizedSummary = { vi: art.summary, en: art.summary_en };
        const localizedContent = { vi: art.content, en: art.content_en };

        if (existing) {
            await pool.query(
                `UPDATE news_articles SET
                    title = $1, title_localized = $2,
                    summary = $3, summary_localized = $4,
                    content = $5, content_localized = $6,
                    image_url = $7, status = 'published', updated_at = NOW()
                 WHERE id = $8`,
                [
                    art.title, JSON.stringify(localizedTitle),
                    art.summary, JSON.stringify(localizedSummary),
                    art.content, JSON.stringify(localizedContent),
                    art.image_url, existing.id
                ]
            );
            console.log('Updated News Article:', art.title);
        } else {
            await pool.query(
                `INSERT INTO news_articles (
                    title, title_localized, slug, summary, summary_localized,
                    content, content_localized, image_url, category_id, status,
                    published_at, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', NOW(), NOW(), NOW())`,
                [
                    art.title, JSON.stringify(localizedTitle), art.slug,
                    art.summary, JSON.stringify(localizedSummary),
                    art.content, JSON.stringify(localizedContent),
                    art.image_url, newsCatId
                ]
            );
            console.log('Inserted News Article:', art.title);
        }
    }

    // 5. SEED PROJECTS (Real Construction Projects for Dong Duong)
    const projectsList = [
        {
            name: 'KHÁCH SẠN 5 SAO PREMIER NHA TRANG',
            name_en: 'Premier 5-Star Hotel & Suites Nha Trang',
            slug: 'khach-san-5-sao-premier-nha-trang',
            client_name: 'Tập đoàn Du lịch & Nghỉ dưỡng Biển Xanh',
            description: 'Cung cấp toàn bộ 15.000 m² gạch lát nền Granite Taicera, gạch Mosaic hồ bơi và tổ hợp hệ thống điều hòa trung tâm VRV Daikin 160 HP.',
            description_en: 'Supplied 15,000 m² of Taicera Granite tiles, pool mosaics, and Daikin 160 HP Central VRV climate system.',
            image_url: '/images/dongduong/hero-building.png',
        },
        {
            name: 'TÒA NHÀ VĂN PHÒNG ĐÔNG DƯƠNG TOWER TP. HỒ CHÍ MINH',
            name_en: 'Dong Duong Office Tower Ho Chi Minh City',
            slug: 'toa-nha-van-phong-dong-duong-tower-tp-ho-chi-minh',
            client_name: 'Công ty Cổ phần Bất Động Sản Đông Dương',
            description: 'Hoàn thiện gạch khổ lớn Viglacera Platinum 60x120 cm, điều hòa âm trần Cassette 4 hướng thổi LG và hệ thống Chiller Midea 120 RT.',
            description_en: 'Furnished Viglacera Platinum 60x120 cm slabs, LG 4-way Cassette units, and Midea 120 RT Chiller systems.',
            image_url: '/images/dongduong/hero-building-clean.png',
        },
        {
            name: 'KHU BIỆT THỰ SINH THÁI THẢO ĐIỀN VILLA COMPLEX',
            name_en: 'Thao Dien Luxury Ecological Villa Complex',
            slug: 'khu-biet-thu-sinh-thai-thao-dien-villa-complex',
            client_name: 'Ban Quản Lý Khu Đô Thị Cao Cấp Thảo Điền',
            description: 'Gói thầu cung cấp gạch vân gỗ Đồng Tâm, gạch ốp lát Catalan và hệ thống điều hòa giấu trần nối ống gió Gree Inverter cho 28 căn biệt thự đơn lập.',
            description_en: 'Supplied Dong Tam wood plank tiles, Catalan slabs, and Gree Inverter concealed ducted HVAC for 28 luxury villas.',
            image_url: '/images/dongduong/building_left.png',
        },
        {
            name: 'NHÀ MÁY SẢN XUẤT LINH KIỆN ĐIỆN TỬ KCN VSIP BÌNH DƯƠNG',
            name_en: 'Electronics Manufacturing Plant VSIP Binh Duong',
            slug: 'nha-may-san-xuat-linh-kien-dien-tu-kcn-vsip-binh-duong',
            client_name: 'Tập đoàn Công nghệ Cao Quốc Tế',
            description: 'Thi công hệ thống Chiller giải nhiệt nước Daikin 160 RT và gạch Ceramic chống tĩnh điện phục vụ phòng sạch sản xuất vi mạch.',
            description_en: 'Turnkey installation of Daikin 160 RT water-cooled chillers and anti-static tiles for cleanroom production.',
            image_url: '/images/dongduong/hero-building.png',
        },
    ];

    for (const proj of projectsList) {
        const existing = (await pool.query('SELECT id FROM projects WHERE slug = $1', [proj.slug])).rows[0];
        const localizedName = { vi: proj.name, en: proj.name_en };
        const localizedDesc = { vi: proj.description, en: proj.description_en };

        if (existing) {
            await pool.query(
                `UPDATE projects SET
                    name = $1, name_localized = $2,
                    description = $3, description_localized = $4,
                    client_name = $5, image_url = $6, status = 'completed', updated_at = NOW()
                 WHERE id = $7`,
                [proj.name, JSON.stringify(localizedName), proj.description, JSON.stringify(localizedDesc), proj.client_name, proj.image_url, existing.id]
            );
            console.log('Updated Project:', proj.name);
        } else {
            await pool.query(
                `INSERT INTO projects (
                    name, name_localized, slug, description, description_localized,
                    client_name, image_url, category_id, status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', NOW(), NOW())`,
                [
                    proj.name, JSON.stringify(localizedName), proj.slug,
                    proj.description, JSON.stringify(localizedDesc),
                    proj.client_name, proj.image_url, projCatId
                ]
            );
            console.log('Inserted Project:', proj.name);
        }
    }

    // 6. SEED VERIFIED BRAND PARTNERS (Full 10 Brands: Tiles & AC)
    const brandPartners = [
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
            id: 'taicera',
            name: 'TAICERA CERAMICS',
            shortName: 'Taicera',
            category: 'tiles',
            sector: 'Gạch Thạch Anh & Granite Đồng Chất',
            desc: 'Nhà sản xuất gạch thạch anh đồng chất số 1, chịu lực cao cho công trình hiện đại.',
            badge: 'Đối tác chiến lược',
            discount: 'Ưu đãi 18% - 22%',
            logo: '/images/dongduong/p-gach-spec.png',
            website: 'https://taicera.com',
            featured: true,
        },
        {
            id: 'viglacera',
            name: 'VIGLACERA',
            shortName: 'Viglacera',
            category: 'tiles',
            sector: 'Gạch Khổ Lớn & Granite Nano',
            desc: 'Tiên phong công nghệ gạch khổ lớn Big Slab, men Nano kháng khuẩn phục vụ đại công trình.',
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
            sector: 'Porcelain Stoneware Xuất Khẩu',
            desc: 'Thương hiệu gạch ốp lát Porcelain Stoneware chuẩn châu Âu, men bóng vi tính công nghệ cao.',
            badge: 'Nhà phân phối ủy quyền',
            discount: 'Ưu đãi 17% - 20%',
            logo: '/images/dongduong/partners/catalan.png',
            website: 'https://catalan.vn',
            featured: true,
        },
        {
            id: 'gree',
            name: 'GREE ELECTRIC',
            shortName: 'Gree',
            category: 'hvac',
            sector: 'Máy Lạnh Inverter / VRF & Chiller',
            desc: 'Tập đoàn điều hòa không khí số 1 toàn cầu, công nghệ Real Inverter siêu tiết kiệm điện năng.',
            badge: 'Thương hiệu đối tác',
            discount: 'Ưu đãi đặc biệt 20% - 25%',
            logo: '/images/dongduong/partners/gree.png',
            website: 'https://gree.com.vn',
            featured: true,
        },
        {
            id: 'midea',
            name: 'MIDEA HVAC',
            shortName: 'Midea',
            category: 'hvac',
            sector: 'Hệ Thống Chiller & VRF Thương Mại',
            desc: 'Giải pháp điều hòa thương mại toàn diện: Chiller trục vít/ly tâm & hệ thống VRF thông minh.',
            badge: 'Thương hiệu đối tác',
            discount: 'Ưu đãi đặc biệt 20% - 25%',
            logo: '/images/dongduong/partners/midea_transparent.png',
            website: 'https://www.midea.com/vn',
            featured: true,
        },
        {
            id: 'daikin',
            name: 'DAIKIN AIR CONDITIONING',
            shortName: 'Daikin',
            category: 'hvac',
            sector: 'Điều Hòa Dân Dụng & Trung Tâm VRV',
            desc: 'Thương hiệu Nhật Bản dẫn đầu công nghệ điều hòa trung tâm VRV và công nghệ lọc khí Streamer.',
            badge: 'Đối tác chiến lược',
            discount: 'Ưu đãi dự án 15% - 20%',
            logo: '/images/dongduong/p-hvac-spec.png',
            website: 'https://daikin.com.vn',
            featured: true,
        },
        {
            id: 'lg',
            name: 'LG ELECTRONICS',
            shortName: 'LG HVAC',
            category: 'hvac',
            sector: 'Dual Inverter & Cassette Round',
            desc: 'Đột phá thiết kế điều hòa âm trần tròn 360 độ và máy nén Dual Inverter bảo hành 10 năm.',
            badge: 'Đối tác chiến lược',
            discount: 'Ưu đãi 18% - 22%',
            logo: '/images/dongduong/cat-maylanh.png',
            website: 'https://lg.com/vn',
            featured: true,
        },
    ];

    await pool.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
        ['site_brand_partners', JSON.stringify(brandPartners), 'Verified brand partners of Dong Duong Corporation']
    );
    console.log('Upserted site_brand_partners into system_settings');

    // 7. SEED HERO BANNER SLIDES (Matching Tiles & HVAC Specialization)
    const heroSlides = [
        {
            id: 'slide-1',
            title: 'ĐÔNG DƯƠNG CORPORATION',
            highlight: 'GẠCH MEN CAO CẤP & MÁY LẠNH CHÍNH HÃNG',
            subtitle: 'Tổng đại lý phân phối gạch ốp lát Đồng Tâm, Taicera, Viglacera, Catalan và hệ thống điều hòa Gree, Midea, Daikin, LG uy tín hàng đầu.',
            image_url: '/images/dongduong/hero-building.png',
            badge: 'TỔNG ĐẠI LÝ PHÂN PHỐI CHÍNH THỨC',
            cta_primary: { text: 'NHẬN BÁO GIÁ DỰ ÁN', link: '#quote-form' },
            cta_secondary: { text: 'DANH MỤC SẢN PHẨM', link: '/san-pham' },
        },
        {
            id: 'slide-2',
            title: 'BỘ SƯU TẬP GẠCH KHỔ LỚN',
            highlight: 'ĐỒNG TÂM - TAICERA - VIGLACERA',
            subtitle: 'Gạch Porcelain và Granite siêu bền, hoa văn vân đá cẩm thạch sang trọng kiến tạo không gian sống và công trình thương mại đẳng cấp.',
            image_url: '/images/banners/banner2.png',
            badge: 'TIÊU CHUẨN XUẤT KHẨU CHÂU ÂU',
            cta_primary: { text: 'XEM BỘ SƯU TẬP GẠCH', link: '/san-pham' },
            cta_secondary: { text: 'TƯ VẤN THIẾT KẾ', link: '#quote-form' },
        },
        {
            id: 'slide-3',
            title: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM',
            highlight: 'VRV / VRF & CHILLER LÀM LẠNH NƯỚC',
            subtitle: 'Giải pháp làm mát thông minh cho biệt thự, tòa nhà và khu công nghiệp. Tiết kiệm năng lượng lên tới 65% với biến tần Inverter cao cấp.',
            image_url: '/images/banners/banner3.png',
            badge: 'GIẢI PHÁP TIẾT KIỆM NĂNG LƯỢNG HÀNG ĐẦU',
            cta_primary: { text: 'GIẢI PHÁP MÁY LẠNH', link: '/san-pham' },
            cta_secondary: { text: 'LIÊN HỆ KỸ SƯ', link: '#quote-form' },
        },
    ];

    await pool.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
        ['homepage_hero_slides', JSON.stringify(heroSlides), 'Homepage hero carousel slides for Dong Duong']
    );
    console.log('Upserted homepage_hero_slides into system_settings');

    // 8. VERIFY SAIGONVALVE CONTACT INFO IN SYSTEM_SETTINGS
    const officialSiteInfo = {
        name: 'Đông Dương Corporation',
        shortName: 'Đông Dương',
        fullName: 'CÔNG TY CỔ PHẦN ĐẦU TƯ & THƯƠNG MẠI ĐÔNG DƯƠNG',
        address: 'Số 124/16-18 Võ Văn Hát, Long Trường, TP. Thủ Đức, TP. Hồ Chí Minh',
        hotline: '090 695 54 59',
        hotlineRaw: '0906955459',
        email: 'info@saigonvalve.vn',
        supportEmail: 'support@saigonvalve.vn',
        website: 'https://saigonvalve.vn',
        websiteLabel: 'saigonvalve.vn',
        taxCode: '0312345678',
        foundedYear: 2015,
        slogan: 'Tổng đại lý phân phối Gạch Men & Gạch Trang Trí, Hệ Thống Máy Lạnh Điều Hòa Trung Tâm VRV - Chiller Hàng Đầu Việt Nam.',
        copyrightName: 'ĐÔNG DƯƠNG CORPORATION',
        copyrightText: 'BẢO LƯU TẤT CẢ QUYỀN.',
        social: {
            facebook: 'https://www.facebook.com/saigon.valve.2024',
            zalo: 'https://zalo.me/0906955459',
            linkedin: 'https://linkedin.com/company/saigonvalve',
            youtube: 'https://youtube.com/@saigonvalve',
        },
        workingHours: {
            weekdays: '08:00 - 17:30',
            saturday: '08:00 - 12:00',
            sunday: 'Nghỉ',
        },
    };

    await pool.query(
        `INSERT INTO system_settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
        ['site_info', JSON.stringify(officialSiteInfo), 'Official corporate identity and contact details']
    );
    console.log('Verified and updated site_info in system_settings');

    console.log('====================================================');
    console.log('--- MASTER DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('====================================================');
    await pool.end();
}

seedMaster().catch((err) => {
    console.error('CRITICAL ERROR DURING SEEDING:', err);
    process.exit(1);
});
