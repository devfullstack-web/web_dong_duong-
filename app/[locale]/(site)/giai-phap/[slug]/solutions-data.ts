export interface SolutionItem {
    title: string;
    title_en?: string;
    title_zh?: string;
    desc: string;
    desc_en?: string;
    desc_zh?: string;
}

export interface SolutionData {
    brand: string;
    brand_en?: string;
    brand_zh?: string;
    title: string;
    title_en?: string;
    title_zh?: string;
    headerTitle: string;
    headerTitle_en?: string;
    headerTitle_zh?: string;
    description: string;
    description_en?: string;
    description_zh?: string;
    intro: string;
    intro_en?: string;
    intro_zh?: string;
    banner: string;
    image1: string;
    image2: string;
    core: {
        title: string;
        title_en?: string;
        title_zh?: string;
        intro: string;
        intro_en?: string;
        intro_zh?: string;
        items: SolutionItem[];
    };
    benefits: {
        title: string;
        title_en?: string;
        title_zh?: string;
        intro: string;
        intro_en?: string;
        intro_zh?: string;
        items: SolutionItem[];
        outro: string;
        outro_en?: string;
        outro_zh?: string;
    };
}

export const SOLUTIONS_DATA: Record<string, SolutionData> = {
    'dieu-hoa-trung-tam-vrv-chiller': {
        brand: 'ĐÔNG DƯƠNG HVAC SOLUTIONS',
        brand_en: 'DONG DUONG HVAC SOLUTIONS',
        brand_zh: '东洋暖通系统解决方案',
        title: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM VRV/VRF & CHILLER',
        title_en: 'CENTRAL VRV/VRF HVAC & CHILLER SYSTEMS',
        title_zh: 'VRV / VRF 多联机中央空调与大型冷水机组系统',
        headerTitle: 'ĐÔNG DƯƠNG HVAC - GIẢI PHÁP ĐIỀU HÒA TRUNG TÂM & CHILLER',
        headerTitle_en: 'DONG DUONG HVAC - CENTRAL AIR CONDITIONING & CHILLER SOLUTIONS',
        headerTitle_zh: '东洋暖通 - 高效商用多联机中央空调与工业冷水机组解决方案',
        description:
            'Đông Dương Corporation cung cấp giải pháp tư vấn, thiết kế và phân phối trọn gói hệ thống điều hòa trung tâm VRV/VRF, hệ thống Chiller giải nhiệt nước/gió (Centrifugal Chiller, Screw Chiller) và thiết bị xử lý không khí đầu cuối AHU/FCU cho tòa nhà cao tầng, trung tâm thương mại, khách sạn, bệnh viện và nhà máy công nghiệp.',
        description_en:
            'Dong Duong Corporation provides end-to-end consulting, engineering design, and distribution of VRV/VRF central HVAC systems, water/air-cooled Chillers (Centrifugal, Screw), and terminal air handling equipment (AHU/FCU) for skyscrapers, commercial complexes, luxury hotels, hospitals, and industrial facilities.',
        description_zh:
            '东洋集团 (Dong Duong Corp) 为超高层商务写字楼、大型购物中心、五星级豪华酒店、三甲医院及现代工业厂房提供 VRV/VRF 多联机中央空调、离心式及螺杆式水冷/风冷冷水机组 (Chiller) 以及 AHU/FCU 末端空气处理系统的一站式方案咨询、深化设计与原厂正品设备总代集采服务。',
        intro: 'Hệ thống điều hòa trung tâm VRV/VRF và Chiller là trái tim của mọi công trình kiến trúc hiện đại, đảm bảo môi trường vi khí hậu trong lành, nhiệt độ lý tưởng và tiết kiệm điện năng tối đa. Đông Dương tự hào là đối tác chiến lược của các thương hiệu hàng đầu thế giới như Gree & Midea mang đến giải pháp làm mát thông minh và bền vững.',
        intro_en: 'Central VRV/VRF and Chiller systems represent the engineering heart of modern architecture, ensuring pristine indoor microclimates, optimal temperatures, and maximum energy efficiency. Dong Duong proudly stands as an official distributor for world-leading brands including Daikin, Gree, Midea, and LG.',
        intro_zh: 'VRV/VRF 多联机中央空调与 Chiller 冷水机组是现代高端建筑的心脏，保障室内四季恒温恒湿恒氧的优越微气候，并实现极致节能降耗。东洋集团作为大金 (Daikin)、格力 (Gree)、美的 (Midea)、LG 等全球一线暖通品牌的战略级总代理，提供原厂直供高性价比设备。',
        banner: '/images/dongduong/hero-building.png',
        image1: '/images/dongduong/cat-maylanh.png',
        image2: '/images/banners/banner1.png',
        core: {
            title: 'DANH MỤC THIẾT BỊ CỐT LÕI',
            title_en: 'CORE EQUIPMENT PORTFOLIO',
            title_zh: '核心设备产品矩阵',
            intro: 'Hệ thống điều hòa trung tâm do Đông Dương cung cấp bao gồm các phân hệ chuyên sâu đạt tiêu chuẩn quốc tế:',
            intro_en: 'Our commercial HVAC portfolio encompasses comprehensive subsystems meeting rigorous international standards:',
            intro_zh: '东洋集团供应的全系列商用暖通系统包含国际高标准专业子系统:',
            items: [
                {
                    title: 'Hệ thống điều hòa trung tâm VRV / VRF',
                    title_en: 'VRV / VRF Multi-Split Central Systems',
                    title_zh: 'VRV / VRF 多联机中央空调系统',
                    desc: 'Dàn nóng trung tâm công suất lớn kết nối linh hoạt hàng chục dàn lạnh âm trần, giấu trần nối ống gió. Công nghệ biến tần thông minh điều khiển phân vùng độc lập, tiết kiệm điện năng vượt trội.',
                    desc_en: 'Heavy-duty outdoor condensers flexibly driving dozens of ducted and cassette indoor units with intelligent inverter zoning control and class-leading APF/IPLV efficiency.',
                    desc_zh: '大冷量室外主机灵活并联，驱动数十台天花嵌入式及超薄风管式室内机。全直流变频与独立温控，超高能效比 APF/IPLV。',
                },
                {
                    title: 'Hệ thống Chiller ly tâm & trục vít (Centrifugal & Screw)',
                    title_en: 'Centrifugal & Screw Industrial Chillers',
                    title_zh: '离心式与螺杆式冷水机组 (Centrifugal & Screw Chiller)',
                    desc: 'Các tổ máy Chiller giải nhiệt nước và giải nhiệt gió công suất hàng nghìn tấn lạnh (Ton), đáp ứng yêu cầu làm mát liên tục 24/7 cho các tòa nhà chọc trời và khu công nghệ cao.',
                    desc_en: 'Water-cooled and air-cooled chiller units delivering thousands of refrigeration tons (RT) for 24/7 continuous industrial-grade duty.',
                    desc_zh: '单机冷量高达数千冷吨 (RT)，水冷及风冷双系列，满足摩天大厦与高新产业园 24/7 不间断严苛制冷工况。',
                },
                {
                    title: 'Thiết bị xử lý không khí đầu cuối Terminal (AHU & FCU)',
                    title_en: 'Terminal Air Handling Equipment (AHU & FCU)',
                    title_zh: '末端空气处理设备 (AHU & FCU)',
                    desc: 'Air Handling Unit (AHU) và Fan Coil Unit (FCU) được tích hợp các cấp lọc bụi mịn, kiểm soát độ ẩm và khử khuẩn chuyên sâu, cung cấp khí tươi cho không gian sống và phòng sạch tiêu chuẩn.',
                    desc_en: 'AHU and FCU units integrated with advanced multi-stage particulate filters, humidity control, and air disinfection, providing hospital-grade clean air.',
                    desc_zh: '组合式空气处理机组与风机盘管，集成初中高效微尘过滤、杀菌除湿与温湿度恒定控制，提供医院级新风系统。',
                },
                {
                    title: 'Tủ đứng công nghiệp Packaged (Water & Air Cooled)',
                    title_en: 'Packaged Industrial Floor-Standing Units',
                    title_zh: '工业柜机与屋顶机 Packaged Unit',
                    desc: 'Giải pháp làm mát cục bộ công suất lớn cho nhà xưởng, showroom lớn, trung tâm hội nghị với luồng gió cực mạnh và độ bền bỉ cơ học cao.',
                    desc_en: 'Heavy-duty localized cooling solutions for manufacturing plants, exhibition halls, and convention centers with powerful airflow and robust mechanical durability.',
                    desc_zh: '针对重工车间、大型展厅及物流中心的高压头强劲送风与高耐久结构设计。',
                },
            ],
        },
        benefits: {
            title: 'GIÁ TRỊ ĐÔNG DƯƠNG MANG LẠI',
            title_en: 'VALUE DELIVERED BY DONG DUONG',
            title_zh: '东洋集团核心服务优势',
            intro: 'Hợp tác cùng Đông Dương Corporation mang lại lợi ích toàn diện về kỹ thuật, chi phí và dịch vụ hậu mãi:',
            intro_en: 'Partnering with Dong Duong Corporation delivers comprehensive advantages across engineering expertise, capital optimization, and lifetime support:',
            intro_zh: '携手东洋集团，尊享工程全周期技术赋能、原厂底价保障与终身售后维保:',
            items: [
                {
                    title: '100% Sản phẩm chính hãng & Chứng nhận CO/CQ',
                    title_en: '100% Genuine Products with Full CO/CQ Documentation',
                    title_zh: '100% 原厂正品直供与权威 CO/CQ 凭证',
                    desc: 'Toàn bộ thiết bị Gree, Midea, Daikin đều nhập khẩu trực tiếp, có đầy đủ hồ sơ pháp lý, bảo hành chính hãng từ nhà sản xuất.',
                    desc_en: 'All equipment is directly imported from manufacturers with complete legal customs clearance and official factory warranties.',
                    desc_zh: '所有大金、格力、美的设备均直采自厂家，具备完整海关出厂合法资质及原厂联保凭据。',
                },
                {
                    title: 'Tối ưu hóa chi phí đầu tư & Tiết kiệm điện năng',
                    title_en: 'Capital Cost & Energy Consumption Optimization',
                    title_zh: '全方位优化初期投资与长期运行电费',
                    desc: 'Ứng dụng công nghệ biến tần Inverter và thuật toán tải động giúp tiết kiệm 35% - 50% chi phí tiền điện hàng tháng cho chủ đầu tư.',
                    desc_en: 'Cutting-edge inverter technology and dynamic load balancing reduce operational energy costs by 35% to 50% monthly.',
                    desc_zh: '全变频动力与智能群控负荷算法，助业主每月节省 35% - 50% 巨额用电成本。',
                },
                {
                    title: 'Tư vấn kỹ thuật & Thiết kế chuyên sâu',
                    title_en: 'Expert Engineering Consultation & System Design',
                    title_zh: '资深暖通总工专业选型与深化图纸',
                    desc: 'Đội ngũ kỹ sư HVAC giàu kinh nghiệm hỗ trợ khảo sát mặt bằng, tính toán phụ tải lạnh và đưa ra phương án tối ưu nhất cho công trình.',
                    desc_en: 'Senior HVAC engineers provide site surveys, dynamic thermal calculations, and bespoke optimal design schemes.',
                    desc_zh: '专业暖通工程师团队实地勘测、负荷核算，量身定制投资与能耗最佳平衡方案。',
                },
                {
                    title: 'Bảo hành & Hỗ trợ kỹ thuật tận nơi 24/7',
                    title_en: 'Lifetime On-site Technical Support & Rapid Warranty',
                    title_zh: '24/7 现场技术支持与原厂备件常备',
                    desc: 'Cam kết đồng hành trọn đời công trình, bảo trì định kỳ, cung cấp linh kiện thay thế chính hãng nhanh chóng.',
                    desc_en: 'Committed to full lifecycle partnership with scheduled preventive maintenance and immediate access to original replacement components.',
                    desc_zh: '定期巡检保养，原厂正品零配件现货速递，为工程保驾护航。',
                },
            ],
            outro: 'Với năng lực cung ứng vượt trội và đội ngũ chuyên gia tận tâm, Đông Dương Corporation là sự lựa chọn hàng đầu cho các chủ đầu tư và nhà thầu cơ điện lạnh (M&E) trên toàn quốc.',
            outro_en: 'With superior supply capability and dedicated technical specialists, Dong Duong Corporation stands as the trusted choice for project developers and M&E contractors nationwide.',
            outro_zh: '凭借雄厚的供应链集采实力与专家技术团队，东洋集团已成为全国主流工程业主与机电安装总包商 (M&E) 值得信赖的战略合作伙伴。',
        },
    },
    'giai-phap-gach-op-lat-du-an': {
        brand: 'ĐÔNG DƯƠNG CERAMICS',
        brand_en: 'DONG DUONG CERAMICS',
        brand_zh: '东洋高端陶瓷岩板建材',
        title: 'GIẢI PHÁP GẠCH MEN & GẠCH TRANG TRÍ DỰ ÁN',
        title_en: 'PROJECT CERAMICS & DECORATIVE TILES SOLUTIONS',
        title_zh: '大型工程瓷砖与艺术装饰大板一站式解决方案',
        headerTitle: 'ĐÔNG DƯƠNG CERAMICS - VẬT LIỆU ỐP LÁT ĐẲNG CẤP',
        headerTitle_en: 'DONG DUONG CERAMICS - LUXURY ARCHITECTURAL SURFACES',
        headerTitle_zh: '东洋建材 - 越南国家品牌高端陶瓷岩板工程总代理',
        description:
            'Tổng đại lý phân phối gạch ốp lát, gạch lát nền, gạch granite porcelain, gạch mosaic nghệ thuật và gạch khổ lớn Big Slab chính hãng từ Đồng Tâm (Dongtam), Taicera, Viglacera cho các dự án căn hộ cao cấp, biệt thự, khách sạn và resort.',
        description_en:
            'Official general distributor of premium floor tiles, wall cladding, porcelain granite slabs, artistic mosaics, and Big Slab porcelain stoneware from Dongtam, Taicera, and Viglacera for luxury residential complexes, villas, hotels, and resorts.',
        description_zh:
            '越南国家品牌一级授权总代理：董心 (Dongtam)、大马 (Taicera)、维格拉塞拉 (Viglacera)、卡塔兰 (Catalan) 高端瓷砖、同质通体石英砖、艺术马赛克及超大规格岩板 Big Slab，赋能五星级酒店、豪华别墅群与地标工程。',
        intro: 'Gạch men và gạch trang trí là yếu tố quyết định vẻ đẹp thẩm mỹ, tính sang trọng và độ bền của mọi không gian sống. Đông Dương Corporation phân phối trực tiếp từ nhà máy các dòng gạch cao cấp nhất, đáp ứng các tiêu chuẩn khắt khe về độ hút nước, độ phẳng, khả năng chống trơn trượt và chống mài mòn.',
        intro_en: 'Ceramics and decorative tiles define the aesthetic elegance, prestige, and longevity of every architectural space. Dong Duong Corporation distributes directly from factory production lines, strictly meeting European standards for water absorption, surface planarity, and anti-slip endurance.',
        intro_zh: '高品质瓷砖与饰面岩板是建筑艺术、尊贵质感与百年耐久的关键基石。东洋集团直采自各品牌原厂核心窑线，产品符合欧洲吸水率 (<0.1%)、高莫氏硬度、超洁亮防污抗划及高防滑等级标准。',
        banner: '/images/dongduong/hero-building.png',
        image1: '/images/dongduong/cat-gachmen.png',
        image2: '/images/banners/banner2.png',
        core: {
            title: 'DANH MỤC GẠCH HOÀN THIỆN',
            title_en: 'ARCHITECTURAL TILE PORTFOLIO',
            title_zh: '高端建材产品体系',
            intro: 'Bộ sưu tập vật liệu ốp lát đa dạng phong cách từ cổ điển đến hiện đại tối giản:',
            intro_en: 'A diverse surface material collection spanning classical elegance to modern minimalism:',
            intro_zh: '汇聚古典与现代极简全系列工程建材精髓:',
            items: [
                {
                    title: 'Gạch Porcelain & Granite đồng chất',
                    title_en: 'Full-Body Homogeneous Porcelain & Granite Tiles',
                    title_zh: '同质通体石英砖与致密瓷质砖 (Porcelain & Granite)',
                    desc: 'Xương gạch đặc chắc, độ hút nước dưới 0.5%, chịu lực tốt, chống trầy xước và chống thấm hoàn hảo cho sảnh lớn, trung tâm thương mại và biệt thự.',
                    desc_en: 'Ultra-dense tile bodies with water absorption below 0.1%, high breaking strength, scratch resistance, and zero permeability for high-traffic halls.',
                    desc_zh: '超低吸水率、高密度致密坯体、莫氏 7 级高硬度耐磨防划，专为奢华大堂、机场、高铁站量身定制。',
                },
                {
                    title: 'Gạch khổ lớn Big Slab (1200x2400, 1600x3200mm)',
                    title_en: 'Continuous Marble Vein Big Slab Panels',
                    title_zh: '超大规格高端岩板 Big Slab (1200x2400, 1600x3200mm)',
                    desc: 'Đột phá kiến trúc hiện đại, hạn chế tối đa đường ron gạch, tạo nên không gian liền mạch, sang trọng đẳng cấp quốc tế.',
                    desc_en: 'Architectural breakthroughs minimizing grout lines, delivering continuous, seamless luxury surfaces for luxury penthouses and luxury suites.',
                    desc_zh: '现代奢华大宅首选，天然大理石逼真连纹，缝隙极小，打造无边界延伸的恢弘空间。',
                },
                {
                    title: 'Gạch Mosaic trang trí nghệ thuật',
                    title_en: 'Custom Artistic Glass & Ceramic Mosaics',
                    title_zh: '定制艺术玻璃与陶瓷马赛克',
                    desc: 'Chất liệu thủy tinh, gốm men rạn, mosaic đá tự nhiên tạo điểm nhấn độc đáo cho hồ bơi, phòng tắm master, spa và quầy bar nhà hàng.',
                    desc_en: 'Vibrant glass, crackle-glaze ceramic, and natural stone mosaics creating bespoke artistic expressions for infinity pools, master spas, and bars.',
                    desc_zh: '五星级度假泳池、水疗会所、豪华卫浴拼花艺术专属定制。',
                },
                {
                    title: 'Gạch thẻ ốp tường & gạch bông phong cách',
                    title_en: 'Architectural Subway Tiles & Vintage Encaustic Tiles',
                    title_zh: '天然实木纹理木纹砖与复古花砖',
                    desc: 'Đa dạng hoa văn hoài cổ và hiện đại, mang lại cá tính nghệ thuật ấn tượng cho các công trình dịch vụ, cafe, khách sạn boutique.',
                    desc_en: 'Classic and contemporary motifs offering artistic individuality for boutique hotels, fine dining, and hospitality interiors.',
                    desc_zh: '逼真微雕原木纹理与南洋法式复古花砖，兼具耐磨防潮与高雅艺术格调。',
                },
            ],
        },
        benefits: {
            title: 'ƯU THẾ CUNG ỨNG CỦA ĐÔNG DƯƠNG',
            title_en: 'SUPPLY CHAIN ADVANTAGES',
            title_zh: '东洋集团供应保障优势',
            intro: 'Chúng tôi đáp ứng mọi yêu cầu khắt khe về tiến độ và khối lượng của các đại dự án:',
            intro_en: 'Meeting the most demanding schedule and volume milestones for flagship developments:',
            intro_zh: '全面满足大型标杆项目的严格工期与供货批量要求:',
            items: [
                {
                    title: 'Nguồn hàng dồi dào, sẵn kho',
                    title_en: 'Massive Warehouse Stock & Multi-Hub Logistics',
                    title_zh: '仓储常备海量现货，多仓联动配货',
                    desc: 'Hệ thống kho bãi rộng lớn, đảm bảo nguồn hàng ổn định, giao hàng đúng tiến độ thi công của nhà thầu.',
                    desc_en: 'Expansive warehousing network ensuring seamless inventory continuity and prompt on-schedule jobsite delivery.',
                    desc_zh: '自有大型区域总仓，现货充足，严格匹配施工进度，杜绝断货延误工期。',
                },
                {
                    title: 'Chính sách giá đại lý cấp 1 cạnh tranh nhất',
                    title_en: 'Tier-1 Direct Factory Pricing',
                    title_zh: '厂家直供一级总代工程底价',
                    desc: 'Nhập trực tiếp từ các nhà máy Đồng Tâm, Viglacera, Catalan, Thuận Hải, Hà Thanh, chiết khấu tối đa cho chủ đầu tư dự án.',
                    desc_en: 'Sourced directly from major factory kilns, passing maximum wholesale discounts directly to developers.',
                    desc_zh: '直连董心、维格拉塞拉等核心工厂，去除中间环节，为项目业主保留最大利润空间。',
                },
                {
                    title: 'Mẫu mã cập nhật theo xu hướng mới nhất',
                    title_en: 'Physical Sample Dispatch & Design Support',
                    title_zh: '实物样板直达工地，协助设计师深化',
                    desc: 'Cung cấp mẫu gạch thực tế tận chân công trình, tư vấn giải pháp phối màu hài hòa theo hồ sơ thiết kế kiến trúc.',
                    desc_en: 'Complementary on-site material samples and technical consultation tailored to architectural specs.',
                    desc_zh: '免费送样到现场，资深建材工程师协助色系搭配、排版铺贴方案与技术指导。',
                },
            ],
            outro: 'Đông Dương Corporation tự hào đồng hành cùng các kiến trúc sư và nhà thầu kiến tạo nên những không gian sống đỉnh cao.',
            outro_en: 'Dong Duong Corporation takes pride in collaborating with leading architects and general contractors to create iconic landmarks.',
            outro_zh: '东洋集团深感自豪能与卓越的建筑师与工程团队紧密合作，共同铸就卓越地标。',
        },
    },
    'dieu-hoa-cuc-bo-thuong-mai': {
        brand: 'ĐÔNG DƯƠNG CLIMATE',
        brand_en: 'DONG DUONG CLIMATE',
        brand_zh: '东洋分体商用暖通',
        title: 'ĐIỀU HÒA CỤC BỘ: TREO TƯỜNG, ÂM TRẦN & NỐI ỐNG GIÓ',
        title_en: 'LIGHT COMMERCIAL HVAC: CASSETTE, DUCTED & WALL MOUNTED',
        title_zh: '商用分体式空调：壁挂、天花机与风管机',
        headerTitle: 'ĐÔNG DƯƠNG CLIMATE - MÁY LẠNH CỤC BỘ DÒNG 2 CỤC',
        headerTitle_en: 'DONG DUONG CLIMATE - 2-PIECE SPLIT AC SOLUTIONS',
        headerTitle_zh: '东洋暖通 - 格力 & 美的分体商用与轻型多联系统',
        description:
            'Phân phối máy lạnh cục bộ dòng 2 cục gồm máy lạnh treo tường (Wall mounted), âm trần (Cassette), giấu trần nối ống gió (Duct connected), dòng thương mại Umatch và Multi-split từ Gree & Midea.',
        description_en:
            'Distributing genuine split AC systems including Wall Mounted, 4-Way Ceiling Cassettes, Slim Ducted concealed units, Umatch commercial series, and Multi-splits from Gree and Midea.',
        description_zh:
            '精选格力 (Gree) 与美的 (Midea) 分体式壁挂机 (Wall mounted)、四面出风天花机 (Cassette)、超薄静音风管机 (Duct connected) 及一拖多轻商 Multi-split 系列。',
        intro: 'Dòng máy lạnh cục bộ 2 cục là giải pháp làm mát phổ biến, linh hoạt và chi phí hợp lý nhất cho nhà ở, chung cư, biệt thự liền kề và cửa hàng bán lẻ. Công nghệ Inverter thế hệ mới giúp làm lạnh siêu tốc và tiết kiệm năng lượng vượt bậc.',
        intro_en: 'Split air conditioning represents the most flexible, cost-effective cooling solution for residences, apartments, retail outlets, and office suites with swift installation and whisper-quiet inverter operation.',
        intro_zh: '高品质分体式空调是现代精品住宅、写字楼分室办公、临街商铺及精品酒店极具性价比的制冷解决方案。新一代变频动力实现强劲制冷与静音运行。',
        banner: '/images/banners/banner3.png',
        image1: '/images/dongduong/cat-maylanh.png',
        image2: '/images/banners/banner1.png',
        core: {
            title: 'CÁC DÒNG MÁY LẠNH 2 CỤC',
            title_en: 'SPLIT SYSTEM CATEGORIES',
            title_zh: '精选分体机型系列',
            intro: 'Đáp ứng hoàn hảo mọi yêu cầu thẩm mỹ và kết cấu trần:',
            intro_en: 'Engineered to harmonize seamlessly with diverse interior aesthetics and ceiling configurations:',
            intro_zh: '全方位契合室内空间美学与吊顶结构:',
            items: [
                {
                    title: 'Máy lạnh treo tường (Wall Mounted)',
                    title_en: 'Inverter Wall-Mounted Units',
                    title_zh: '高效直流变频壁挂机 (Wall Mounted)',
                    desc: 'Thiết kế thanh lịch, trang bị màng lọc kháng khuẩn khử mùi, luồng gió 3D êm ái cho phòng ngủ và phòng khách.',
                    desc_en: 'Streamlined design with antibacterial filtration and 3D gentle airflow for peaceful living comfort.',
                    desc_zh: '流线型优雅机身，配备银离子纳米抗菌滤网与 3D 柔风技术，呵护舒适呼吸。',
                },
                {
                    title: 'Máy lạnh âm trần Cassette 4 hướng thổi / 360 độ',
                    title_en: '4-Way & 360° Circular Airflow Ceiling Cassettes',
                    title_zh: '360° 环绕送风四面出风天花机 (Cassette)',
                    desc: 'Lắp đặt chìm vào trần thạch cao, phân bổ khí lạnh đồng đều khắp không gian, mặt nạ thẩm mỹ cao cấp.',
                    desc_en: 'Recessed ceiling installation distributing even air coverage across large open plan offices and restaurants.',
                    desc_zh: '隐蔽嵌入吊顶，气流柔和均匀覆盖各角落，商务空间标配。',
                },
                {
                    title: 'Máy lạnh giấu trần nối ống gió (Duct Connected)',
                    title_en: 'Concealed Slim Ducted Inverter AC',
                    title_zh: '超薄静音隐蔽风管机 (Duct Connected)',
                    desc: 'Hệ thống giấu hoàn toàn trong trần, chỉ để lộ cửa gió thanh lịch, mang lại vẻ đẹp sang trọng tuyệt đối cho căn hộ cao cấp và biệt thự.',
                    desc_en: 'Hidden completely within ceiling plenums with only sleek linear diffusers visible, offering pure understated luxury.',
                    desc_zh: '机身极薄，完美隐藏于天花板内，仅展现精致金属出风口，奢华简约。',
                },
                {
                    title: 'Hệ thống Multi-split (1 Dàn nóng - Nhiều Dàn lạnh)',
                    title_en: 'Space-Saving Multi-Split Systems',
                    title_zh: '一拖多轻商 Multi-split 系统',
                    desc: 'Giải pháp cứu cánh cho ban công chung cư hẹp, chỉ sử dụng 1 dàn nóng duy nhất để kết nối từ 2 đến 5 dàn lạnh khác nhau.',
                    desc_en: 'A lifesaver for space-constrained apartment balconies, utilizing a single outdoor unit to power 2 to 5 indoor zones.',
                    desc_zh: '单个外机驱动 2-5 个室内机，彻底释放阳台空间。',
                },
            ],
        },
        benefits: {
            title: 'CAM KẾT CHẤT LƯỢNG TỪ ĐÔNG DƯƠNG',
            title_en: 'OUR QUALITY COMMITMENT',
            title_zh: '原厂正品品质承诺',
            intro: 'Dịch vụ uy tín, tận tâm và chuyên nghiệp hàng đầu:',
            intro_en: 'Professional, transparent, and dedicated commercial services:',
            intro_zh: '官方特级授权，提供规范放心的工程服务:',
            items: [
                {
                    title: 'Hàng chính hãng mới 100% nguyên đai nguyên kiện',
                    title_en: '100% Factory-Sealed Genuine Units',
                    title_zh: '100% 原装正品全新未拆封',
                    desc: 'Bảo hành máy nén chính hãng lên tới 5 - 10 năm theo chính sách của Gree & Midea.',
                    desc_en: 'Official genuine warranties covering compressors for 5 to 10 years per manufacturer policies.',
                    desc_zh: '格力 & 美的官方正品，压缩机专享 5 - 10 年原厂联保政策。',
                },
                {
                    title: 'Đội ngũ kỹ thuật viên tay nghề cao',
                    title_en: 'Certified Technical Installation Teams',
                    title_zh: '高标准专业安装与机电调试',
                    desc: 'Lắp đặt đúng quy chuẩn kỹ thuật điện lạnh, đảm bảo an toàn, thẩm mỹ và hiệu suất làm mát cao nhất.',
                    desc_en: 'Strict compliance with HVAC technical standards, ensuring safety, aesthetics, and peak cooling efficiency.',
                    desc_zh: '严格依照国家电气与暖通施工规范，保障设备能效与超长运行寿命。',
                },
            ],
            outro: 'Liên hệ ngay hotline Đông Dương để nhận báo giá ưu đãi tốt nhất cho công trình của bạn.',
            outro_en: 'Contact Dong Duong Corporation hotline today for the most competitive commercial volume quotations.',
            outro_zh: '欢迎随时致电东洋集团客服热线，获取工程专属优惠底价。',
        },
    },
};

// Aliases for legacy URLs to prevent 404s
SOLUTIONS_DATA['quan-ly-nuoc-thong-minh'] = SOLUTIONS_DATA['dieu-hoa-trung-tam-vrv-chiller'];
SOLUTIONS_DATA['nong-nghiep-chinh-xac'] = SOLUTIONS_DATA['giai-phap-gach-op-lat-du-an'];
SOLUTIONS_DATA['quan-trac-thuy-san'] = SOLUTIONS_DATA['dieu-hoa-cuc-bo-thuong-mai'];
