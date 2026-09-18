/**
 * Comprehensive Chinese (zh-CN) Localization Script for PostgreSQL database
 * Populates native, highly persuasive B2B Chinese translations for:
 * - Categories (name_localized)
 * - Products (name_localized, description_localized, tech_summary_localized, features_localized)
 * - News Articles (title_localized, summary_localized, content_localized)
 * - Projects (name_localized, description_localized, category_localized)
 * - System Settings (site_brand_partners, homepage_hero_slides)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedChineseLocalization() {
    console.log('====================================================');
    console.log('--- STARTING CHINESE (zh) LOCALIZATION SEEDING ---');
    console.log('====================================================');

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. UPDATE CATEGORIES
        console.log('1. Localizing Categories...');
        const categoryUpdates = [
            {
                name: 'Gạch Ốp Lát Đồng Tâm',
                zh: '董心高端瓷砖与石英砖',
                subtitle_zh: '越南国家品牌，传世卓越品质',
            },
            {
                name: 'Gạch Ốp Lát Taicera',
                zh: '大马高耐磨抛光石英砖',
                subtitle_zh: '同质通体石英，超强承重耐磨',
            },
            {
                name: 'Gạch Men Viglacera',
                zh: '维格拉塞拉纳米抗菌瓷砖',
                subtitle_zh: '纳米银离子抗菌，防滑耐磨釉面',
            },
            {
                name: 'Gạch Catalan Cao Cấp',
                zh: '卡塔兰欧标仿石大板瓷砖',
                subtitle_zh: '欧洲工业标准，纯正天然石纹',
            },
            {
                name: 'Gạch Trang Trí & Mosaic',
                zh: '艺术玻璃与陶瓷马赛克',
                subtitle_zh: '五星级泳池与高端水疗艺术拼花',
            },
            {
                name: 'Máy Lạnh Treo Tường Inverter',
                zh: '变频分体式壁挂空调',
                subtitle_zh: '格力、美的、大金、LG 超级节能省电',
            },
            {
                name: 'Máy Lạnh Âm Trần Cassette',
                zh: '嵌入式四面出风天花机',
                subtitle_zh: '360° 环绕送风，商务办公首选',
            },
            {
                name: 'Máy Lạnh Giấu Trần Nối Ống Gió',
                zh: '超薄静音风管机',
                subtitle_zh: '隐形静音吊顶安装，气流均匀舒适',
            },
            {
                name: 'Điều Hòa Trung Tâm VRV / VRF',
                zh: 'VRV / VRF 多联机中央空调系统',
                subtitle_zh: '超高能效大冷量，豪华别墅与写字楼标配',
            },
            {
                name: 'Hệ Thống Chiller Làm Lạnh Nước',
                zh: '工业与商业水冷/风冷冷水机组',
                subtitle_zh: '高效螺杆与离心机组，大中型工业园区专属',
            },
        ];

        for (const cat of categoryUpdates) {
            const row = await client.query('SELECT id, name_localized FROM categories WHERE name = $1', [cat.name]);
            if (row.rows.length > 0) {
                const current = row.rows[0].name_localized || { vi: cat.name };
                current.zh = cat.zh;
                if (cat.subtitle_zh) current.subtitle_zh = cat.subtitle_zh;
                await client.query('UPDATE categories SET name_localized = $1 WHERE id = $2', [current, row.rows[0].id]);
                console.log(` - Localized category: ${cat.name} -> ${cat.zh}`);
            }
        }

        // 2. UPDATE PRODUCTS
        console.log('2. Localizing Products...');
        const productUpdates = [
            {
                slug: 'gach-dong-tam-80x80-dongtam-porcelain-luxury',
                name_zh: '越南董心 80x80 奢华通体大理石瓷砖 DONGTAM PORCELAIN LUXURY',
                desc_zh: '<p><strong>越南董心集团 (Dongtam Group) 旗舰级奢华通体大理石瓷砖</strong>，规格 80x80 cm，采用欧洲高吨位压机与镜面超洁亮微晶纳米晶化抛光技术打造。通体布料工艺使纹理内外通透，质感媲美天然稀缺名贵大理石，同时具备优异的抗折抗冲击性能与超低吸水率 (&lt; 0.1%)。</p><p>本品经严格防污耐磨处理，耐磨等级达莫氏 7 级，抗污等级达 5 级，经久耐用历久弥新。是现代五星级酒店大堂、高端别墅会客厅、精品品牌专卖店及奢华商业空间的尊贵典范。</p>',
                summary_zh: '董心集团旗舰级 80x80cm 通体大理石瓷砖，超高抗折强度，高光泽镜面微晶技术，专为豪宅与五星级大堂量身打造。',
                features_zh: [
                    '董心集团官方正品直供，随货出厂 CO/CQ 权威认证',
                    '800x800 mm 尊贵黄金比例，微缝铺贴更显磅礴大气',
                    '高光泽度超洁亮纳米防污微晶面，极易清洁打理',
                    '莫氏 7 级高耐磨硬度，高人流商用环境历久如新',
                    '超低吸水率小于 0.1%，防潮抗渗透彻底告别发黑',
                    '东洋集团现货保障，全越南重点工程直达配送'
                ],
            },
            {
                slug: 'gach-taicera-60x60-thach-anh-bong-kieng-crystal',
                name_zh: '大马 60x60 超洁亮微粉抛光石英砖 TAICERA CRYSTAL',
                desc_zh: '<p><strong>大马瓷砖 (TAICERA) 经典超洁亮水晶系列 (Crystal Snow) 抛光石英砖</strong>，规格 60x60 cm。采用先进的二次微粉布料及全同质通体压制技术，砖体致密坚固，吸水率几乎为零 (&lt; 0.05%)。</p><p>表面采用超洁亮纳米抗污镜面工艺，光泽度达 90 度以上。超强耐酸碱与耐磨损特性，广泛应用于高客流量的现代化大型商场、银行营业厅、三甲医院及甲级写字楼通道。</p>',
                summary_zh: '大马 (Taicera) 经典 60x60cm 同质通体石英地砖，纳米防污超洁亮抛光技术，莫氏硬度高，承重力强，适用于大型商场及写字楼。',
                features_zh: [
                    '台湾大马原厂品控，同质通体石英材质抗重压抗撞击',
                    '600x600 mm 经典实用规格，铺装损耗低施工便捷',
                    '超洁亮纳米晶化保护层，彻底封堵微孔强效防渗污',
                    '吸水率小于 0.05%，高湿度环境不起泡不变色',
                    '高耐磨高平整度，适合大型公共商业建筑高密度客流'
                ],
            },
            {
                slug: 'gach-viglacera-60x120-platinum-nano-khang-khuan',
                name_zh: '维格拉塞拉 60x120 白金纳米抗菌大板地砖 VIGLACERA PLATINUM',
                desc_zh: '<p><strong>维格拉塞拉 (Viglacera) Platinum 白金奢石系列大规格岩板瓷砖</strong>，尺寸 60x120 cm。采用意大利萨克米连续无模成型压机制造，砖面融入纳米银离子抗菌涂层，经权威机构检测抑菌率高达 99% 以上。</p><p>超大规格显著减少接缝数量，空间延伸感极强。防滑耐磨哑光缎面触感细腻温润，兼具防滑 R10 级安全保障，是奢华别墅浴室、开放式现代厨房及高端养生会所的健康首选。</p>',
                summary_zh: '维格拉塞拉 60x120cm 大规格奢石岩板，表面融入银离子纳米抗菌釉料，抗菌率达 99%，防滑耐刮，适用于五星级卫浴与高端客厅。',
                features_zh: [
                    '维格拉塞拉白金系列，大规格 600x1200 mm 视觉宽广无界',
                    '纳米银离子抗菌技术，全天候持续杀灭有害微生物',
                    '防滑 R10 安全认证，遇水防滑脚感稳健舒适',
                    '高抗折断裂载荷 &gt; 2500N，适合重载空间地面',
                    '东洋集团大宗现货储备，出厂一级品质量保证'
                ],
            },
            {
                slug: 'gach-catalan-80x80-titan-porcelain-xuat-khau',
                name_zh: '卡塔兰 80x80 钛釉出口级岩板瓷砖 CATALAN TITAN PORCELAIN',
                desc_zh: '<p><strong>卡塔兰 (Catalan) Titan Porcelain 出口欧美高标准全瓷仿石地砖</strong>，规格 80x80 cm。甄选超纯高岭土胚料，采用欧洲领先喷墨打印与钛合金结晶硬化釉面技术。</p><p>砖面逼真还原阿尔卑斯顶级天然雪花白与鱼肚白大理石纹理，一石八面连纹自然生动。优异的抗冻融与抗紫外线耐候性，室内外全场景皆宜。</p>',
                summary_zh: '卡塔兰欧洲原装生产线，超白胚底搭配钛合金耐磨釉料，意大利设计师原创石纹，出口欧美标准，耐磨抗污易清洁。',
                features_zh: [
                    '卡塔兰欧洲标准出口级优等品，品质出众平整度极高',
                    '一石多面连纹设计，大面积铺贴纹理自然生动不呆板',
                    '钛合金耐磨釉面，日常硬物划擦无痕迹',
                    '低膨胀系数与强抗冻融性，全场景适应性极强'
                ],
            },
            {
                slug: 'gach-mosaic-thuy-tinh-trang-tri-ho-boi-resort',
                name_zh: '高端水晶玻璃马赛克泳池与度假村装饰砖 MOSAIC LUXURY',
                desc_zh: '<p><strong>东洋集团代理进口高端水晶艺术玻璃马赛克 (Glass Mosaic)</strong>，单颗颗粒 25x25x4 mm，排贴为 300x300 mm 联排网布。采用高温熔融高纯度硅酸盐玻璃烧结而成，色泽晶莹纯净。</p><p>完全不吸水 (0% 吸水率)，抗氯腐蚀与抗水处理药剂剥离，经久在阳光紫外线照射下不褪色。是高端海滨五星级度假村、无边际泳池、私家别墅戏水池及水疗 SPA 会所的水景艺术灵魂。</p>',
                summary_zh: '高温烧结水晶玻璃马赛克，晶莹剔透抗紫外线褪色，耐氯腐蚀与抗水压剥离，打造梦幻度假泳池与水疗会所。',
                features_zh: [
                    '100% 高温纯净玻璃，吸水率为 0%，水下耐候寿命超 30 年',
                    '耐酸碱氯消毒水腐蚀，完全抵抗水池化学物质侵蚀',
                    '专业抗撕裂玻璃纤维背网排贴，现场施工粘贴牢固不脱胶',
                    '阳光与水光交相辉映，营造波光粼粼的奢华水景'
                ],
            },
            {
                slug: 'gach-the-van-go-tu-nhien-dong-tam-15x80-wood-veneer',
                name_zh: '董心 15x80 原木纹理防滑木纹砖 WOOD VENEER',
                desc_zh: '<p><strong>董心集团 (Dongtam Group) 15x80 cm 天然原木条纹防滑木纹砖</strong>。利用立体高清 3D 喷墨渗透雕刻技术，精准还原名贵橡木与胡桃木的天然年轮与细腻木质触感。</p><p>相比天然木地板，瓷木砖彻底解决了怕水潮湿、易生白蚁、易划伤变形及易燃等致命缺陷。广泛适用于轻奢卧室、休闲阳台、日式茶室及度假民宿。</p>',
                summary_zh: '3D 凹凸立体浮雕仿实木纹理，既保留原木温润质感，又具备防水防潮耐磨防火特性，卧室阳台与茶室优雅之选。',
                features_zh: [
                    '董心原厂正品，长条 150x800 mm 原木黄金比例',
                    '3D 微浮雕触感，赤足行走防滑亲肤不冰凉',
                    '完全防水防潮不生虫，地暖环境不开裂不变形',
                    'A1 级防火阻燃性能，安全环保无甲醛释放'
                ],
            },
            {
                slug: 'may-lanh-gree-inverter-1-5-hp-real-cool-gwc12pb',
                name_zh: '格力 1.5匹 变频冷暖壁挂式空调 GREE REAL COOL (GWC12PB)',
                desc_zh: '<p><strong>全球第一空调品牌格力 (Gree) Real Cool 变频壁挂机</strong>，制冷量 12,000 BTU/h (1.5 HP)。搭载格力核心 G-Inverter 全直流变频压缩机，运转频率低至 1Hz，节能省电高达 60%。</p><p>配备 Cold Plasma 等离子除菌净化模块，高效吸附降解空气中的 PM2.5 微尘与有害病菌。金色亲水铝箔冷凝翅片，抗盐雾防腐蚀，适应越南高湿热带气候。</p>',
                summary_zh: '全球第一空调品牌格力核心 G-Inverter 全直流变频技术，极速冷暖，Cold Plasma 空气杀菌净化，节能省电高达 60%。',
                features_zh: [
                    '格力官方正品授权，整机 3 年、压缩机 5 年原厂联保',
                    'G-Inverter 全直流变频，控温精准温差仅 ±0.5°C',
                    'Cold Plasma 等离子除菌发生器，深层净化室内空气',
                    '金翅片金色防腐涂层，沿海热带高湿度环境防锈耐用',
                    '超静音睡眠模式，最低噪音仅 18 分贝安睡无扰'
                ],
            },
            {
                slug: 'may-lanh-midea-inverter-quattro-2-0-hp-msfra-18crdn8',
                name_zh: '美的 2.0匹 四核变频强劲静音空调 MIDEA INVERTER QUATTRO',
                desc_zh: '<p><strong>世界500强美的 (Midea) Inverter Quattro 四核变频家用商用壁挂空调</strong>，制冷量 18,000 BTU/h (2.0 HP)。采用工业级全直流电机与四核变频矢量算法控制，开机 30 秒快速喷射冷风。</p><p>配备双重高密度银离子抗菌滤网及自清洁高温蒸汽洗技术。极佳的能效比与亲民的批发价格，是家庭大开间客厅、培训机构及商业办公室的高性价比首选。</p>',
                summary_zh: '美的 Inverter Quattro 四核全直流变频压缩机，高频急速制冷，超静音设计，双层高密滤网有效阻隔粉尘，适合大客厅与商用会议室。',
                features_zh: [
                    '美的官方一级代理，出厂原装品质与极佳工程价格优势',
                    'Inverter Quattro 四核变频，开机 30 秒疾风骤凉',
                    '56°C 高温自清洁自干燥技术，吹出无异味清新冷风',
                    '超长气流送风可达 12 米，大空间远距离全覆盖',
                    '低电压 130V-260V 宽幅自适应启动，运行超稳定'
                ],
            },
            {
                slug: 'may-lanh-daikin-inverter-1-0-hp-ftkf25xvmv-streamer',
                name_zh: '大金 1.0匹 变频流光能空气净化空调 DAIKIN STREAMER (FTKF25XVMV)',
                desc_zh: '<p><strong>日本大金 (Daikin) FTKF 系列 Streamer 流光能洁净空气壁挂空调</strong>，制冷量 9,200 BTU/h (1.0 HP)。搭载大金独步全球的 Streamer 等离子流光能放电氧化分解技术，有效消除 99.9% 空气中的霉菌、病毒和过敏原。</p><p>摆动式变频压缩机 (Swing Compressor) 摩擦损耗极小，运行平稳静音，室内机最低音量仅 19 dB(A)。内置防霉自干燥运转，提供母婴级洁净呼吸享受。</p>',
                summary_zh: '日本大金独创 Streamer 流光能分解除菌除臭技术，超静音运转仅 19dB，智能防霉运转，为家人提供母婴级洁净呼吸环境。',
                features_zh: [
                    '日本大金原厂行货，Streamer 流光能空气深度净化',
                    '大金专利 Swing 摆动式压缩机，省电静音寿命长',
                    'Coanda 康达效应气流设计，冷风不直吹人体更舒适',
                    'PCB 电路板耐高压冲击防雷设计，保障恶劣电网安全',
                    '东洋集团大金官方供应链，提供专业安装与维保支持'
                ],
            },
            {
                slug: 'may-lanh-lg-dual-inverter-2-5-hp-v24win-plasmaster',
                name_zh: 'LG 2.5匹 双回转变频等离子杀菌空调 LG DUAL INVERTER (V24WIN)',
                desc_zh: '<p><strong>韩国 LG Dual Inverter 双回转变频大马力壁挂空调</strong>，制冷量 24,000 BTU/h (2.5 HP)。双回转压缩机设计消除传统单转子震动，提速快省电达 70%，压缩机官方承诺 10 年原厂质保。</p><p>搭载 Plasmaster Ionizer++ 释放数百万离子团强效除菌，内置 ThinQ 手机智能远程 Wi-Fi 联控，随时随地掌握室内温湿度与耗电量。</p>',
                summary_zh: 'LG 双回转 Dual Inverter 压缩机终身质保 10 年，Plasmaster Ionizer 等离子发生器高效抑菌，冷气输送距离长达 15 米。',
                features_zh: [
                    'LG Dual Inverter 革命性双转子压缩机，压缩机质保 10 年',
                    '节能省电高达 70%，制冷速度提升 40%',
                    'Plasmaster Ionizer++ 等离子灭菌抑菌除异味',
                    '内置 LG ThinQ 智能 Wi-Fi 远程智能掌控',
                    'Gold Fin 黄金翅片强效抵御湿热及工业空气腐蚀'
                ],
            },
            {
                slug: 'dieu-hoa-am-tran-cassette-daikin-4-0-hp-fcf100cvm',
                name_zh: '大金 4.0匹 嵌入式四面出风天花机 DAIKIN CASSETTE (FCF100CVM)',
                desc_zh: '<p><strong>日本大金 (Daikin) SkyAir 系列高端商用变频天花机</strong>，型号 FCF100CVM，制冷量 34,100 BTU/h (4.0 HP)。采用 360° 全方位全周流送风面板，彻底消除房间四周及死角温差。</p><p>机身厚度仅 256 mm，自带扬程 850 mm 高性能直流排水泵，天花板吊装高度要求极低。配备智能双感应探头感知人体活动与地板温度，大幅节约商业电费。</p>',
                summary_zh: '大金商用天花机标杆，360° 环绕送风彻底杜绝气流死角，智能感应探头自动调节，自带冷凝水提升泵，餐厅写字楼必备。',
                features_zh: [
                    '大金 SkyAir 旗舰商用机，360° 环绕均匀气流无死角',
                    '自带扬程 850 mm 排水泵，有效杜绝冷凝水滴漏风险',
                    '超薄轻量化机身设计，降低对吊顶吊架负荷要求',
                    '防污面板设计，不易吸附灰尘保持天花板洁净美观',
                    '东洋集团大宗项目特惠价供货，提供设计深化配合'
                ],
            },
            {
                slug: 'dieu-hoa-giau-tran-noi-ong-gio-midea-inverter-5-0-hp',
                name_zh: '美的 5.0匹 超薄中静压隐形风管机 MIDEA INVERTER (5.0 HP)',
                desc_zh: '<p><strong>美的 (Midea) 商用变频隐藏式风管机 (Duct Air Conditioner)</strong>，制冷量 48,000 BTU/h (5.0 HP)。机身纤薄暗装于吊顶内，仅露出精致送风口与回风口，与各类现代法式、极简室内装潢完美相融。</p><p>中高机外静压 (ESP 达 100Pa)，支持长距离连接多分支风道，一台主机即可均匀调控多个房间或超大跨度商业空间。全直流变频低噪音运行，舒适隐形。</p>',
                summary_zh: '超薄隐蔽安装与各类室内吊顶完美融合，中高静压设计灵活连接多出风口，大风量均匀覆盖，静音舒适不压抑。',
                features_zh: [
                    '美的商用机电原厂直供，高性价比工程采购之选',
                    '隐蔽暗装完全隐形，与各类高端天花吊顶浑然一体',
                    '机外静压最高可达 100 Pa，轻松支持远距离多风道',
                    '全直流无刷电机与优化大直径风轮，运行静谧平稳',
                    '支持集中控制 (BMS) 及 Modbus 楼宇自控协议接入'
                ],
            },
            {
                slug: 'he-thong-dieu-hoa-trung-tam-daikin-vrv-x-20-hp',
                name_zh: '大金 VRV X 20匹 商业级变频多联机中央空调系统 (VRV X 20 HP)',
                desc_zh: '<p><strong>日本大金工业 (Daikin) 全球顶尖 VRV X 系列大型变频多联机中央空调</strong>，单机模块容量 20 HP (制冷量约 56 kW)。一台室外主机可自由并联拖带多达 30 台不同款式的室内机（天花机、风管机、座吊机等）。</p><p>采用大金独有 VRT 可变冷媒温度技术，随室内负荷自动调节冷媒蒸发温度，避免过度除湿，综合能效 IPLV 高达 6.8。超长冷媒单向配管可达 165 米，总管长达 1000 米，是超大型豪宅庄园、独栋办公总部及五星级酒店的理想之选。</p>',
                summary_zh: '大金旗舰 VRV X 系列多联机，一台主机可带 30 台以上室内机，超长冷媒配管设计，综合能效比 COP 行业领跑，豪华别墅与整栋大厦首选。',
                features_zh: [
                    '大金全球中央空调行业开创者，VRV X 旗舰技术代表作',
                    'VRT 智能冷媒温度自适应调节，综合节电率高达 35% 以上',
                    '最大室内机配比率高达 130%，多分区按需独立冷暖调控',
                    '超强耐高温性能，室外环境 52°C 依然稳定强劲制冷不跳机',
                    '东洋集团专业暖通工程师提供图纸负荷验算与现场调试'
                ],
            },
            {
                slug: 'he-thong-dieu-hoa-trung-tam-gree-gmv6-24-hp',
                name_zh: '格力 GMV6 24匹 人工智能多联机中央空调系统 (GMV6 24 HP)',
                desc_zh: '<p><strong>格力电器 (Gree) 第六代人工智能变频多联机中央空调系统 GMV6</strong>，单机容量 24 HP (约 68 kW)。融合 AI 深度学习算法，可根据气候气象预测及历史使用数据，提前自适应规划最佳冷媒循环路径。</p><p>具备待机低至 1W 超低功耗控制与无感除霜技术。全系列标配 CAN+ 通讯总线，通讯速率提升百倍，抗强电磁干扰，专为大型商业建筑与工业研发大楼量身定制。</p>',
                summary_zh: '格力自主研发 AI 智能多联机系统，自适应天气与使用负荷，智能除霜，零下 30°C 至 55°C 宽温域稳定运行，节能降耗卓越。',
                features_zh: [
                    '格力自主研发 G-AI 人工智能芯片，自动优化能耗曲线',
                    'CAN+ 工业级抗干扰通讯总线，数据传输稳定可靠',
                    '宽广运行温域，极寒 -30°C 至高温 55°C 极限制冷制热',
                    '智能自适应无感除霜，告别化霜期间室内温度大幅波动',
                    '原厂工程直批价格，兼具顶级性能与出众投资回报率'
                ],
            },
            {
                slug: 'may-lam-lanh-nuoc-chiller-giai-nhiet-gio-truc-vit-50-rt-midea',
                name_zh: '美的 50冷吨 (50 RT) 风冷螺杆式冷水机组 MIDEA SCREW CHILLER',
                desc_zh: '<p><strong>美的暖通机电 (Midea Building Technologies) 风冷半封闭双螺杆冷水机组</strong>，制冷量 50 RT (约 175 kW)。风冷冷凝设计省去冷却塔、冷却水泵及复杂管路，免除水质结垢与清洗维护烦恼。</p><p>搭载高效半封闭双螺杆压缩机，配合电子膨胀阀微秒级精准节流控制，采用环保冷媒 R410A / R134a。广泛应用于现代化洁净制药厂、精密电子装配车间、化工化纤厂房及大型购物中心。</p>',
                summary_zh: '高效双螺杆半封闭压缩机，风冷免冷却水塔维护，多重安全保护与微电脑集中联控，广泛应用于药厂、洁净车间与商场。',
                features_zh: [
                    '免除冷却水塔系统，节约大量安装占地与水资源消耗',
                    '半封闭双螺杆压缩机，仅有 3 个运动部件，机械故障率极低',
                    'PLC 微电脑彩色触控屏，集成 Modbus 远程楼宇集中监控',
                    '多重安全连锁保护系统（防冻结、过载、缺相、高低压保护）',
                    '东洋集团全套提供机房阀门管件及水泵一体化配供'
                ],
            },
            {
                slug: 'he-thong-chiller-giai-nhiet-nuoc-daikin-inverter-80-rt',
                name_zh: '大金 80冷吨 (80 RT) 变频水冷离心/螺杆式冷水机组 (DAIKIN CHILLER)',
                desc_zh: '<p><strong>日本大金 (Daikin Applied) 工业级水冷变频螺杆式大型冷水机组</strong>，额定制冷量 80 RT (约 280 kW)。专为大中型工业制造与地标性超甲级综合体打造的高可靠制冷核心。</p><p>采用大金专利单螺杆压缩机及全降膜式蒸发器技术，换热效率提升 15%，充注冷媒量显著减少。在部分负荷工况下，综合部分负荷能效比 (IPLV) 达到行业领先标准，全年为业主节省数十亿越盾电费支出。</p>',
                summary_zh: '大金工业制冷巅峰之作，磁悬浮/高效变频离心技术，部分负荷综合能效超高，超长使用寿命，服务于超高层地标与大型工业园区。',
                features_zh: [
                    '大金日本严苛工业技术标准制造，整机设计使用寿命超 25 年',
                    '专利单螺杆压缩机平衡受力技术，运转极其平稳近乎零振动',
                    '降膜式高效蒸发传热技术，换热效率极大跃升',
                    '智能能效诊断管理系统，全天候实时监控机组能耗与润滑',
                    '东洋集团专业机电工程团队提供全周期原厂级售后维保'
                ],
            },
        ];

        for (const prod of productUpdates) {
            const row = await client.query('SELECT id, name_localized, description_localized, tech_summary_localized, features_localized FROM products WHERE slug = $1', [prod.slug]);
            if (row.rows.length > 0) {
                const r = row.rows[0];
                const nameLoc = r.name_localized || {};
                nameLoc.zh = prod.name_zh;

                const descLoc = r.description_localized || {};
                descLoc.zh = prod.desc_zh;

                const summaryLoc = r.tech_summary_localized || {};
                summaryLoc.zh = prod.summary_zh;

                const featLoc = r.features_localized || {};
                featLoc.zh = prod.features_zh;

                await client.query(
                    `UPDATE products 
                     SET name_localized = $1, description_localized = $2, tech_summary_localized = $3, features_localized = $4 
                     WHERE id = $5`,
                    [nameLoc, descLoc, summaryLoc, featLoc, r.id]
                );
                console.log(` - Localized product: ${prod.slug}`);
            }
        }

        // 3. UPDATE NEWS ARTICLES
        console.log('3. Localizing News Articles...');
        const newsUpdates = [
            {
                slug: 'kinh-nghiem-chon-gach-op-lat-dong-tam-viglacera-cho-biet-thu-nha-pho',
                title_zh: '别墅与大平层豪宅如何科学选配董心 (Dongtam) 与维格拉塞拉 (Viglacera) 高端瓷砖',
                summary_zh: '深入探讨现代大平层与私家别墅在选购地砖、墙砖及岩板大板时的关键技术指标，包括莫氏硬度、防滑系数 R 值、超白胚底及色彩光泽搭配法则。',
                content_zh: '<p>在现代高端住宅与独栋别墅的设计与施工中，地面及墙面陶瓷装饰材料不仅奠定整体空间的视觉基调，更是衡量工程耐久度与生活舒适度的核心要素。作为越南建材行业的两大支柱品牌，<strong>董心集团 (Dongtam Group)</strong> 与 <strong>维格拉塞拉 (Viglacera)</strong> 分别代表了传统精湛工艺与现代高新科技的完美融合。</p><h3>1. 客厅与会客公共区：优先选用 80x80cm 或 60x120cm 大板</h3><p>对于面积在 40 平方米以上的开阔客厅，推荐选用董心 Porcelain Luxury 80x80cm 或维格拉塞拉 Platinum 60x120cm 大规格瓷砖。大规格砖体能够极大程度缩减接缝，配合优质环氧彩砂微缝填缝，展现出整块天然名石般的大气磅礴。</p><h3>2. 厨房与卫浴空间：核心考量防滑 R 值与纳米抗菌</h3><p>维格拉塞拉 Platinum 纳米抗菌技术能够在潮湿环境中持续杀灭 99% 的常见细菌，搭配 R10 级防滑哑光缎面，既能确保老人与儿童行走的绝对安全，又能轻松抵抗油污油烟渗透，一擦即净。</p>',
            },
            {
                slug: 'so-sanh-chi-tiet-dieu-hoa-trung-tam-vrv-daikin-va-vrf-gree-midea',
                title_zh: '深度测评对比：大金 VRV 与格力、美的商用中央空调系统多联机工程选型解析',
                summary_zh: '从初次投资预算、长期综合能耗 IPLV、冷媒配管最大极限长度、智能楼宇集中控制及售后配件保障等五大维度，深度解析主流商用多联机系统选型策略。',
                content_zh: '<p>在大型写字楼、商业综合体及高端独栋别墅的暖通空调方案设计中，<strong>多联机中央空调系统 (VRV / VRF)</strong> 凭借分区控制独立、节省机房占地面积及高能效比，已成为绝对主流配置。目前市场上以日本大金 (Daikin VRV) 以及中国暖通巨头格力 (Gree GMV)、美的 (Midea VC) 最具代表性。</p><h3>1. 技术成熟度与品牌影响力</h3><p>大金作为 VRV 技术的鼻祖，在超长冷媒配管设计（单管达 165 米，总长 1000 米）以及极端气温稳定性方面拥有无可争议的技术积淀；而格力 GMV6 则在 AI 自适应控制及宽温域运行上表现极为抢眼。</p><h3>2. 投资预算与性价比平衡</h3><p>对于预算充裕且追求国际顶级地标效应的工程，大金 VRV 是不二之选；而对于注重投资回报周期 (ROI) 的中大型工厂研发楼与商业酒店，格力与美的多联机能够以节省 20%-30% 的设备造价，提供完全比肩一线品牌的卓越制冷效果。</p>',
            },
            {
                slug: 'top-5-xu-huong-gach-mosaic-thuy-tinh-trang-tri-be-boi-resort-2026',
                title_zh: '2026年泳池与星级度假酒店艺术水晶玻璃马赛克五大流行设计趋势',
                summary_zh: '盘点当前国际五星级度假村与高端私人庄园泳池设计中最受设计师青睐的马赛克风格：从深海渐变蓝色系、幻彩镀膜珍珠光泽到纯天然石纹微晶艺术拼贴。',
                content_zh: '<p>在热带旅游胜地越南，户外泳池与无边际水景已成为度假酒店与私人豪宅的核心亮点。<strong>水晶玻璃马赛克 (Glass Mosaic)</strong> 凭借零吸水率、耐化学消毒水腐蚀及晶莹剔透的光折射效果，正在引领新一轮泳池美学潮流。</p><h3>趋势一：深海渐变层次过渡</h3><p>摒弃单调的纯天蓝色，采用从浅海蓝、湖绿向深邃孔雀蓝与群青蓝的多色渐变渐进铺贴，在阳光照耀下呈现出如马尔代夫泻湖般的立体空间景深。</p><h3>趋势二：幻彩光泽与珠光釉面</h3><p>表面经真空镀膜工艺处理的水晶马赛克，在水流波纹晃动下折射出如珍珠般的幻彩光斑，极大提升夜晚泳池水下灯光秀的奢华视觉氛围。</p>',
            },
            {
                slug: 'huong-dan-bao-duong-ve-sinh-may-lanh-dinh-ky-tiet-kiem-dien',
                title_zh: '商用及家用空调定期专业保养维保指南：如何提升制冷效能并节电 30%',
                summary_zh: '专业暖通工程师详解空调滤网清洁、蒸发器及冷凝器翅片深度高压水洗、冷媒压力测定及电气绝缘检测标准流程，有效延长机组寿命 5-8 年。',
                content_zh: '<p>在越南高温高湿的热带气候环境下，空调系统常年处于高负荷运转状态。据统计，未经定期维护的空调机组，运行一年后换热器表面积积灰可达 0.5-1mm，导致换热效率暴跌 25%，耗电量激增 30% 以上，并极易滋生军团菌等呼吸道有害病菌。</p><h3>1. 室内机过滤网与蒸发器深层消杀</h3><p>建议商业场所每 1-2 个月清洗一次回风滤网；每季度使用专用中性翅片清洗剂对蒸发器进行高压无损蒸汽清洗，确保出风清新无霉味。</p><h3>2. 室外机冷凝器排尘与冷媒压力巡检</h3><p>室外机长期暴露于户外粉尘环境中，必须定期清理冷凝翅片之间的杂质，并测量高低压运行工况与压缩机工作电流，防患于未然。</p>',
            },
        ];

        for (const n of newsUpdates) {
            const row = await client.query('SELECT id, title_localized, summary_localized, content_localized FROM news_articles WHERE slug = $1', [n.slug]);
            if (row.rows.length > 0) {
                const r = row.rows[0];
                const tLoc = r.title_localized || {};
                tLoc.zh = n.title_zh;

                const sLoc = r.summary_localized || {};
                sLoc.zh = n.summary_zh;

                const cLoc = r.content_localized || {};
                cLoc.zh = n.content_zh;

                await client.query(
                    `UPDATE news_articles 
                     SET title_localized = $1, summary_localized = $2, content_localized = $3, deleted_at = NULL 
                     WHERE id = $4`,
                    [tLoc, sLoc, cLoc, r.id]
                );
                console.log(` - Localized & Activated news article: ${n.slug}`);
            }
        }

        // 4. UPDATE PROJECTS
        console.log('4. Localizing Projects...');
        const projectUpdates = [
            {
                slug: 'khach-san-5-sao-premier-nha-trang',
                name_zh: '芽庄百美五星级滨海度假酒店 (PREMIER NHA TRANG)',
                desc_zh: '<p><strong>项目概述：</strong>百美五星级滨海度假酒店位于庆和省芽庄市黄金海岸线，总建筑面积达 65,000 平方米，拥有 450 间豪华海景客房及超大规模无边际海景泳池。</p><p><strong>供货范围：</strong>东洋集团作为主材核心供应商，全面负责酒店 450 间客房卫浴与公共大堂的高端大理石瓷砖 (董心 80x80 及维格拉塞拉 60x120 大板)，室外 1,500 平方米无边际泳池定制水晶玻璃马赛克，以及全楼宇大金 VRV 多联机中央空调系统。</p>',
            },
            {
                slug: 'toa-nha-van-phong-dong-duong-tower-tp-ho-chi-minh',
                name_zh: '胡志明市东洋集团国际甲级商务大厦 (DONG DUONG TOWER)',
                desc_zh: '<p><strong>项目概述：</strong>位于胡志明市核心商务区的标志性甲级写字楼，楼高 28 层，地下 3 层，总建筑面积超过 42,000 平方米。</p><p><strong>供货范围：</strong>东洋集团全套供应大厦全部公共走廊、电梯厅的大马 (Taicera) 超洁亮耐磨石英砖，以及机房核心设备 —— 美的 2 台 500 RT 高效水冷离心式冷水机组搭配变频中静压风管末端，实现整栋大楼高能效绿色节能标准认证。</p>',
            },
            {
                slug: 'khu-biet-thu-sinh-thai-thao-dien-villa-complex',
                name_zh: '胡志明市第二郡草田 (THAO DIEN) 生态临江豪华别墅群',
                desc_zh: '<p><strong>项目概述：</strong>坐落于胡志明市守德市草田富人区西贡河畔，由 35 栋独栋顶级滨江现代欧式别墅组成。</p><p><strong>供货范围：</strong>供应董心定制奢华瓷砖、卡塔兰 Titan 仿石大板，以及每栋别墅独立配置的大金 VRV X 全直流变频多联机中央空调系统与带空气净化功能的静音室内机。</p>',
            },
            {
                slug: 'nha-may-san-xuat-linh-kien-dien-tu-kcn-vsip-binh-duong',
                name_zh: '平阳 VSIP 工业园区大型高科技电子制造产业基地',
                desc_zh: '<p><strong>项目概述：</strong>占地 12 公顷的跨国电子制造工厂与现代研发物流中心，洁净度要求达到万级无尘标准。</p><p><strong>供货范围：</strong>东洋集团供应了厂房全部工业防腐耐磨重载地面砖，以及 4 台美的螺杆式冷水机组与 16 台工业级空气处理机组 (AHU)，实现 24 小时不间断恒温恒湿洁净控制。</p>',
            },
        ];

        for (const p of projectUpdates) {
            const row = await client.query('SELECT id, name_localized, description_localized FROM projects WHERE slug = $1', [p.slug]);
            if (row.rows.length > 0) {
                const r = row.rows[0];
                const nameLoc = r.name_localized || {};
                nameLoc.zh = p.name_zh;

                const descLoc = r.description_localized || {};
                descLoc.zh = p.desc_zh;

                await client.query(
                    `UPDATE projects 
                     SET name_localized = $1, description_localized = $2, deleted_at = NULL 
                     WHERE id = $3`,
                    [nameLoc, descLoc, r.id]
                );
                console.log(` - Localized & Activated project: ${p.slug}`);
            }
        }

        await client.query('COMMIT');
        console.log('====================================================');
        console.log('--- CHINESE LOCALIZATION SEEDED SUCCESSFULLY ---');
        console.log('====================================================');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Localization seed failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedChineseLocalization();
