const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function seedTrilingualSettings() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Seeding trilingual homepage settings...');

        // 1. HERO SLIDES
        const heroSlides = [
            {
                id: 'slide-1',
                title: 'ĐÔNG DƯƠNG CORPORATION',
                title_en: 'DONG DUONG CORPORATION',
                title_zh: '东洋集团 (DONG DUONG CORP)',
                highlight: 'GẠCH MEN CAO CẤP & MÁY LẠNH CHÍNH HÃNG',
                highlight_en: 'PREMIUM TILES & GENUINE AIR CONDITIONING',
                highlight_zh: '高端工程瓷砖岩板 · 原厂正品中央空调总代',
                subtitle: 'Tổng đại lý phân phối gạch ốp lát Đồng Tâm, Taicera, Viglacera, Catalan và hệ thống điều hòa Gree, Midea, Daikin, LG uy tín hàng đầu.',
                subtitle_en: 'Official top distributor of Dong Tam, Taicera, Viglacera, Catalan tiles and Gree, Midea, Daikin, LG HVAC systems.',
                subtitle_zh: '越南国家级核心总代理：董心 (Dongtam)、大马 (Taicera)、维格拉塞拉 (Viglacera)、卡塔兰 (Catalan) 陶瓷大板，及格力 (Gree)、美的 (Midea)、大金 (Daikin)、LG 商用及工业空调。',
                image_url: '/images/dongduong/hero-building.png',
                badge: 'TỔNG ĐẠI LÝ PHÂN PHỐI CHÍNH THỨC',
                badge_en: 'OFFICIAL GENERAL DISTRIBUTOR',
                badge_zh: '越南特级官方授权总代理',
                cta_primary: {
                    text: 'NHẬN BÁO GIÁ DỰ ÁN',
                    text_en: 'REQUEST PROJECT QUOTE',
                    text_zh: '获取工程大宗底价',
                    link: '#quote-form',
                },
                cta_secondary: {
                    text: 'DANH MỤC SẢN PHẨM',
                    text_en: 'PRODUCT CATALOG',
                    text_zh: '浏览全部核心产品',
                    link: '/san-pham',
                },
            },
            {
                id: 'slide-2',
                title: 'BỘ SƯU TẬP GẠCH KHỔ LỚN',
                title_en: 'BIG SLAB TILE COLLECTION',
                title_zh: '超大规格高端岩板大板瓷砖系列',
                highlight: 'ĐỒNG TÂM - TAICERA - VIGLACERA',
                highlight_en: 'DONG TAM - TAICERA - VIGLACERA',
                highlight_zh: '董心 · 大马 · 维格拉塞拉 · 卡塔兰',
                subtitle: 'Gạch Porcelain và Granite siêu bền, hoa văn vân đá cẩm thạch sang trọng kiến tạo không gian sống và công trình thương mại đẳng cấp.',
                subtitle_en: 'Ultra-durable Porcelain and Granite tiles with luxurious marble veins, elevating living spaces and premier commercial landmarks.',
                subtitle_zh: '高致密度同质通体石英砖与抗菌白金大板，莫氏高硬度、零渗污、意大利逼真连纹大理石质感，赋能五星级地标工程。',
                image_url: '/images/banners/banner2.png',
                badge: 'TIÊU CHUẨN XUẤT KHẨU CHÂU ÂU',
                badge_en: 'EUROPEAN EXPORT STANDARDS',
                badge_zh: '欧洲出口级优等品标准',
                cta_primary: {
                    text: 'XEM BỘ SƯU TẬP GẠCH',
                    text_en: 'EXPLORE TILE CATALOG',
                    text_zh: '查看全系列瓷砖岩板',
                    link: '/san-pham',
                },
                cta_secondary: {
                    text: 'TƯ VẤN THIẾT KẾ',
                    text_en: 'DESIGN CONSULTATION',
                    text_zh: '工程技术方案咨询',
                    link: '#quote-form',
                },
            },
            {
                id: 'slide-3',
                title: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM',
                title_en: 'CENTRAL HVAC & CHILLER SYSTEMS',
                title_zh: 'VRV / VRF 智能多联机 & 螺杆离心式冷水机组',
                highlight: 'VRV / VRF & CHILLER LÀM LẠNH NƯỚC',
                highlight_en: 'VRV / VRF & WATER-COOLED CHILLERS',
                highlight_zh: '全直流变频节能 · 超大冷量工业楼宇系统',
                subtitle: 'Giải pháp làm mát thông minh cho biệt thự, tòa nhà và khu công nghiệp. Tiết kiệm năng lượng lên tới 65% với biến tần Inverter cao cấp.',
                subtitle_en: 'Smart cooling solutions for luxury villas, high-rise buildings, and industrial parks. Save up to 65% energy with advanced Inverters.',
                subtitle_zh: '为独栋豪宅别墅、甲级商务写字楼及大型高科技洁净厂房提供定制温控方案，搭载变频核心技术，节电高达 65%。',
                image_url: '/images/banners/banner3.png',
                badge: 'GIẢI PHÁP TIẾT KIỆM NĂNG LƯỢNG HÀNG ĐẦU',
                badge_en: 'TOP ENERGY-SAVING SOLUTIONS',
                badge_zh: '全球领先绿色节能制冷方案',
                cta_primary: {
                    text: 'GIẢI PHÁP MÁY LẠNH',
                    text_en: 'HVAC SOLUTIONS',
                    text_zh: '暖通工程产品中心',
                    link: '/san-pham',
                },
                cta_secondary: {
                    text: 'LIÊN HỆ KỸ SƯ',
                    text_en: 'CONTACT ENGINEERS',
                    text_zh: '对接暖通总工程师',
                    link: '#quote-form',
                },
            },
        ];

        await client.query(
            `UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'homepage_hero_slides'`,
            [JSON.stringify(heroSlides)]
        );
        console.log(' - Updated homepage_hero_slides');

        // 2. WHY CHOOSE US
        const whyChooseUs = [
            {
                id: 'reason-1',
                iconSrc: '/images/dongduong/reason-icon-1.png',
                title: 'UY TÍN VÀ KINH NGHIỆM',
                title_en: 'PRESTIGE & EXPERIENCE',
                title_zh: '行业信誉与二十年深耕',
                desc: 'Hơn 20 năm trong ngành',
                desc_en: 'Over 20 years of industry experience.',
                desc_zh: '深耕建材与机电暖通领域逾 20 年，实力卓著',
            },
            {
                id: 'reason-2',
                iconSrc: '/images/dongduong/reason-icon-2.png',
                title: 'CHẤT LƯỢNG SẢN PHẨM',
                title_en: 'PRODUCT QUALITY',
                title_zh: '卓越产品质量保障',
                desc: 'Đáp ứng tiêu chuẩn quốc tế.',
                desc_en: 'Meeting strict international standards.',
                desc_zh: '100% 正品出厂一级检验，符合国际与国家严苛标准',
            },
            {
                id: 'reason-3',
                iconSrc: '/images/dongduong/reason-icon-3.png',
                title: 'SẢN PHẨM ĐA DẠNG',
                title_en: 'DIVERSE PORTFOLIO',
                title_zh: '全品类一站式集采',
                desc: 'Cung cấp nhiều loại vật liệu & thiết bị.',
                desc_en: 'Supplying comprehensive materials & equipment.',
                desc_zh: '仓储常备数万平米陶瓷岩板与全系列暖通设备',
            },
            {
                id: 'reason-4',
                iconSrc: '/images/dongduong/reason-icon-4.png',
                title: 'DỊCH VỤ CHUYÊN NGHIỆP',
                title_en: 'PROFESSIONAL SERVICE',
                title_zh: '全流程管家式专业服务',
                desc: 'Hỗ trợ khách hàng tận tâm, chu đáo.',
                desc_en: 'Dedicated, attentive 24/7 customer support.',
                desc_zh: '专业工程师团队 24/7 快速响应，出图选型与配送无忧',
            },
        ];

        await client.query(
            `UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'homepage_why_choose_us'`,
            [JSON.stringify(whyChooseUs)]
        );
        console.log(' - Updated homepage_why_choose_us');

        // 3. WORKFLOW STEPS
        const workflowSteps = [
            {
                num: 1,
                title: 'Tìm Kiếm &\nĐánh Giá Đối Tác',
                title_en: 'Search &\nEvaluate Partners',
                title_zh: '需求对接 &\n品牌方案评估',
                icon: 'Search',
            },
            {
                num: 2,
                title: 'Thương Lượng Giá\n& Điều Khoản',
                title_en: 'Negotiate Pricing\n& Terms',
                title_zh: '工程底价核算\n& 商务条款谈判',
                icon: 'Handshake',
            },
            {
                num: 3,
                title: 'Hợp Đồng &\nĐặt Hàng',
                title_en: 'Contract &\nPlace Order',
                title_zh: '正式签约 &\n大宗排产锁定',
                icon: 'FileCheck2',
            },
            {
                num: 4,
                title: 'Vận Chuyển &\nLogistics',
                title_en: 'Shipping &\nLogistics',
                title_zh: '专业干线物流\n& 仓储直抵工地',
                icon: 'Globe2',
            },
            {
                num: 5,
                title: 'Giao Hàng &\nHỗ Trợ Sau Bán',
                title_en: 'Delivery &\nAfter-Sales Support',
                title_zh: '现场验收交付\n& 终身质保维保',
                icon: 'ShieldCheck',
            },
        ];

        await client.query(
            `UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'homepage_workflow_steps'`,
            [JSON.stringify(workflowSteps)]
        );
        console.log(' - Updated homepage_workflow_steps');

        // 4. BRAND PARTNERS
        const brandPartners = [
            {
                id: 'dongtam',
                name: 'DONGTAM GROUP',
                shortName: 'Đồng Tâm',
                shortName_en: 'Dong Tam Group',
                shortName_zh: '董心集团 (Dongtam)',
                category: 'tiles',
                sector: 'Gạch Men, Granite & Gạch Bông',
                sector_en: 'Ceramic Tiles, Granite & Encaustic',
                sector_zh: '陶瓷地砖、微晶石板与艺术装饰砖',
                desc: 'Thương hiệu quốc gia hàng đầu về gạch ốp lát, porcelain cao cấp và gạch bông nghệ thuật.',
                desc_en: 'Vietnam leading national brand in porcelain tiles, granite, and artistic encaustic cement tiles.',
                desc_zh: '越南国家级建材领导品牌，专注高抗折通体大理石地砖与艺术复古瓷砖。',
                badge: 'Đối tác chiến lược',
                badge_en: 'Strategic Partner',
                badge_zh: '核心战略总代',
                discount: 'Ưu đãi 17% - 20%',
                discount_en: 'Discount 17% - 20%',
                discount_zh: '工程特惠 17% - 20%',
                logo: '/images/dongduong/partners/dongtam.png',
                website: 'https://dongtam.com.vn',
            },
            {
                id: 'viglacera',
                name: 'VIGLACERA',
                shortName: 'Viglacera',
                shortName_en: 'Viglacera',
                shortName_zh: '维格拉塞拉 (Viglacera)',
                category: 'tiles',
                sector: 'Gạch Khổ Lớn & Granite',
                sector_en: 'Big Slab & Granite Tiles',
                sector_zh: '大规格岩板 (Big Slab) 与抗菌瓷砖',
                desc: 'Tiên phong công nghệ gạch khổ lớn Big Slab, granite cao cấp phục vụ các đại công trình.',
                desc_en: 'Pioneering Big Slab porcelain technology, premium granite for major national projects.',
                desc_zh: '引领超大规格岩板制造科技，纳米抗菌釉面，广泛服务国家重点工程。',
                badge: 'Đối tác chiến lược',
                badge_en: 'Strategic Partner',
                badge_zh: '核心战略伙伴',
                discount: 'Ưu đãi 17% - 20%',
                discount_en: 'Discount 17% - 20%',
                discount_zh: '工程特惠 17% - 20%',
                logo: '/images/dongduong/partners/viglacera.png',
                website: 'https://viglacera.com.vn',
            },
            {
                id: 'catalan',
                name: 'CATALAN',
                shortName: 'Catalan',
                shortName_en: 'Catalan',
                shortName_zh: '卡塔兰 (Catalan)',
                category: 'tiles',
                sector: 'Porcelain Stoneware',
                sector_en: 'Porcelain Stoneware',
                sector_zh: '全瓷欧标仿石岩板',
                desc: 'Thương hiệu gạch ốp lát Porcelain Stoneware chuẩn châu Âu, men bóng vi tính công nghệ cao.',
                desc_en: 'European standard Porcelain Stoneware, high-tech digital glazing and elegant aesthetics.',
                desc_zh: '全套引进欧洲萨克米原装生产线，意大利原创石纹设计，出口欧美品质。',
                badge: 'Nhà phân phối ủy quyền',
                badge_en: 'Authorized Distributor',
                badge_zh: '特级授权经销商',
                discount: 'Ưu đãi 17% - 20%',
                discount_en: 'Discount 17% - 20%',
                discount_zh: '工程特惠 17% - 20%',
                logo: '/images/dongduong/partners/catalan.png',
                website: 'https://catalan.vn',
            },
            {
                id: 'thuanhai',
                name: 'GẠCH MEN THUẬN HẢI',
                shortName: 'Thuận Hải Vaceramic',
                shortName_en: 'Thuan Hai Vaceramic',
                shortName_zh: '顺海建材 (Vaceramic)',
                category: 'tiles',
                sector: 'Gạch Men & Ốp Lát Vaceramic',
                sector_en: 'Vaceramic Tiles & Cladding',
                sector_zh: '工程陶瓷地砖与外墙砖',
                desc: 'Tổng kho và nhà phân phối gạch ốp lát Vaceramic uy tín hàng đầu khu vực miền Nam.',
                desc_en: 'Premier warehouse and distributor of Vaceramic architectural tiles in Southern Vietnam.',
                desc_zh: '越南南部规模最大的瓷砖仓储与配供基地之一，出厂价直供工区。',
                badge: 'Đối tác chiến lược',
                badge_en: 'Strategic Partner',
                badge_zh: '战略合作伙伴',
                discount: 'Ưu đãi 17% - 20%',
                discount_en: 'Discount 17% - 20%',
                discount_zh: '工程特惠 17% - 20%',
                logo: '/images/dongduong/partners/thuanhai.png',
                website: 'http://gachmenthuanhai.vn',
            },
            {
                id: 'hathanh',
                name: 'HÀ THANH (DHT)',
                shortName: 'Đại Hà Thanh',
                shortName_en: 'Dai Ha Thanh (DHT)',
                shortName_zh: '河清实业 (DHT)',
                category: 'tiles',
                sector: 'Gạch Men & Bê Tông Xây Dựng',
                sector_en: 'Ceramic Tiles & Concrete',
                sector_zh: '高强度地砖与建筑混凝土构件',
                desc: 'Tập đoàn sản xuất gạch men cao cấp DHT, cấu kiện bê tông và vật liệu xây dựng bền vững.',
                desc_en: 'Leading manufacturing conglomerate of high-grade DHT tiles and sustainable construction concrete.',
                desc_zh: '大型多元化建材产业集团，生产品质卓越的重载高抗折工程地砖。',
                badge: 'Đối tác chiến lược',
                badge_en: 'Strategic Partner',
                badge_zh: '战略合作单位',
                discount: 'Ưu đãi 17% - 20%',
                discount_en: 'Discount 17% - 20%',
                discount_zh: '工程特惠 17% - 20%',
                logo: '/images/dongduong/partners/hathanh.png',
                website: 'https://daihathanh.vn',
            },
            {
                id: 'gree',
                name: 'GREE',
                shortName: 'Gree Electric',
                shortName_en: 'Gree Electric',
                shortName_zh: '格力电器 (Gree)',
                category: 'hvac',
                sector: 'Máy Lạnh (Hệ Cục Bộ / VRF & Chiller)',
                sector_en: 'HVAC (Split / VRF & Chillers)',
                sector_zh: '变频分体空调 / GMV 多联机 / 冷水机组',
                desc: 'Tập đoàn điều hòa không khí số 1 toàn cầu, công nghệ Real Inverter siêu tiết kiệm điện năng.',
                desc_en: 'World No.1 air conditioning manufacturer, proprietary Real Inverter ultra energy-saving tech.',
                desc_zh: '全球最大空调制造商之一，核心掌握全直流变频科技，超级节能。',
                badge: 'Thương hiệu đối tác',
                badge_en: 'Partner Brand',
                badge_zh: '一级战略总代理',
                discount: 'Ưu đãi đặc biệt 20% - 25%',
                discount_en: 'Special Discount 20% - 25%',
                discount_zh: '工程特惠 20% - 25%',
                logo: '/images/dongduong/partners/gree.png',
                website: 'https://gree.com.vn',
            },
            {
                id: 'midea',
                name: 'MIDEA',
                shortName: 'Midea HVAC',
                shortName_en: 'Midea HVAC',
                shortName_zh: '美的暖通 (Midea)',
                category: 'hvac',
                sector: 'Hệ Thống Chiller & VRF',
                sector_en: 'Chiller & VRF Systems',
                sector_zh: '商用空调 / 螺杆与离心式冷水机组',
                desc: 'Giải pháp điều hòa thương mại toàn diện: Chiller trục vít/ly tâm & hệ thống VRF thông minh.',
                desc_en: 'Comprehensive commercial HVAC solutions: Screw/Centrifugal Chillers & smart VRF systems.',
                desc_zh: '世界500强全方位暖通楼宇解决方案，从超薄风管机到特大型工业冷水机。',
                badge: 'Thương hiệu đối tác',
                badge_en: 'Partner Brand',
                badge_zh: '一级战略总代理',
                discount: 'Ưu đãi đặc biệt 20% - 25%',
                discount_en: 'Special Discount 20% - 25%',
                discount_zh: '工程特惠 20% - 25%',
                logo: '/images/dongduong/partners/midea_transparent.png',
                website: 'https://www.midea.com/vn',
            },
            {
                id: 'vnsteel_hmc',
                name: 'CTY CP KIM KHÍ TP. HỒ CHÍ MINH - VNSTEEL',
                shortName: 'VNSTEEL (HMC)',
                shortName_en: 'VNSTEEL (HMC)',
                shortName_zh: '越南钢铁 (VNSTEEL)',
                category: 'steel',
                sector: 'Sắt & Thép Xây Dựng',
                sector_en: 'Construction Steel & Rebars',
                sector_zh: '建筑螺纹钢、型钢与结构钢',
                desc: 'Cung ứng đủ loại thép xây dựng từ VNSTEEL, cam kết báo giá tốt nhất tại kho khu vực miền Nam.',
                desc_en: 'Supplying authentic VNSTEEL construction steels with guaranteed direct mill pricing.',
                desc_zh: '越南国家级大型钢铁龙头，保质保量直供越南南部各大施工项目仓库。',
                badge: 'Nhà cung ứng chiến lược',
                badge_en: 'Strategic Supplier',
                badge_zh: '核心钢材供应商',
                discount: 'Cam kết giá gốc tại kho',
                discount_en: 'Direct Mill Price Guarantee',
                discount_zh: '原厂直发出厂价',
                logo: '/images/dongduong/partners/hmc_vnsteel.png',
                website: 'https://metalhcm.com.vn',
            },
        ];

        await client.query(
            `UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'site_brand_partners'`,
            [JSON.stringify(brandPartners)]
        );
        console.log(' - Updated site_brand_partners');

        await client.query('COMMIT');
        console.log('Trilingual homepage settings successfully seeded!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error seeding trilingual settings:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedTrilingualSettings();
