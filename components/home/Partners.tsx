'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import $api from '@/utils/axios';
import TechSvgBackground from '@/components/ui/TechSvgBackground';

export interface BrandPartnerItem {
    id?: string;
    name: string;
    shortName?: string;
    shortName_en?: string;
    shortName_zh?: string;
    category?: 'tiles' | 'hvac' | 'steel' | string;
    sector: string;
    sector_en?: string;
    sector_zh?: string;
    desc: string;
    desc_en?: string;
    desc_zh?: string;
    badge: string;
    badge_en?: string;
    badge_zh?: string;
    discount?: string;
    discount_en?: string;
    discount_zh?: string;
    logo?: string;
    website?: string;
    featured?: boolean;
}

export const DEFAULT_PARTNERS: BrandPartnerItem[] = [
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
        sector_en: 'Porcelain Stoneware Tiles',
        sector_zh: '欧标致密高光微晶 Porcelain Stoneware',
        desc: 'Thương hiệu gạch ốp lát Porcelain Stoneware chuẩn châu Âu, men bóng vi tính công nghệ cao.',
        desc_en: 'European standard porcelain stoneware tiles with ultra-glossy digital nano glazes.',
        desc_zh: '采用欧洲先进压机与数码喷墨釉线，专供高档写字楼与豪华住宅。',
        badge: 'Nhà phân phối ủy quyền',
        badge_en: 'Authorized Distributor',
        badge_zh: '特级授权总代',
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
        shortName_zh: '顺海陶瓷 (Thuan Hai)',
        category: 'tiles',
        sector: 'Gạch Men & Ốp Lát Vaceramic',
        sector_en: 'Vaceramic Tiles & Cladding',
        sector_zh: 'Vaceramic 瓷砖与防滑地砖大仓',
        desc: 'Tổng kho và nhà phân phối gạch ốp lát Vaceramic uy tín hàng đầu khu vực miền Nam.',
        desc_en: 'Leading southern warehouse and distributor for prestigious Vaceramic architectural tiles.',
        desc_zh: '越南南部地区大型瓷砖现货总仓，花色丰富，供货周转迅速。',
        badge: 'Đối tác chiến lược',
        badge_en: 'Strategic Partner',
        badge_zh: '核心战略伙伴',
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
        shortName_en: 'Dai Ha Thanh',
        shortName_zh: '大河清建材 (DHT Group)',
        category: 'tiles',
        sector: 'Gạch Men & Bê Tông Xây Dựng',
        sector_en: 'DHT Ceramics & Concrete Materials',
        sector_zh: 'DHT 瓷砖、预应力混凝土与建材',
        desc: 'Tập đoàn sản xuất gạch men cao cấp DHT, cấu kiện bê tông và vật liệu xây dựng bền vững.',
        desc_en: 'DHT Group manufacturer of premium architectural ceramics, precast concrete, and sustainable materials.',
        desc_zh: '集高端瓷砖生产、大型混凝土构件与绿色新型建材于一体的领军企业。',
        badge: 'Đối tác chiến lược',
        badge_en: 'Strategic Partner',
        badge_zh: '核心战略伙伴',
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
        sector_en: 'HVAC (Split Units, VRF & Chillers)',
        sector_zh: '格力空调 (分体商用 / VRF / Chiller)',
        desc: 'Tập đoàn điều hòa không khí số 1 toàn cầu, công nghệ Real Inverter siêu tiết kiệm điện năng.',
        desc_en: 'World-leading HVAC manufacturer featuring ultra energy-saving Real Inverter technology.',
        desc_zh: '全球领先暖通空调集团，核心掌握直流变频压缩机技术，极致节能低噪。',
        badge: 'Thương hiệu đối tác',
        badge_en: 'Partner Brand',
        badge_zh: '官方战略合作品牌',
        discount: 'Ưu đãi đặc biệt 20% - 25%',
        discount_en: 'Special Discount 20% - 25%',
        discount_zh: '直降特惠 20% - 25%',
        logo: '/images/dongduong/partners/gree.png',
        website: 'https://gree.com.vn',
    },
    {
        id: 'midea',
        name: 'MIDEA',
        shortName: 'Midea HVAC',
        shortName_en: 'Midea HVAC',
        shortName_zh: '美的暖通设备 (Midea)',
        category: 'hvac',
        sector: 'Hệ Thống Chiller & VRF',
        sector_en: 'Commercial Chiller & VRF Systems',
        sector_zh: '美的中央空调 (Chiller 冷水机 & VRF)',
        desc: 'Giải pháp điều hòa thương mại toàn diện: Chiller trục vít/ly tâm & hệ thống VRF thông minh.',
        desc_en: 'Comprehensive commercial HVAC solutions: Centrifugal/Screw Chillers and intelligent VRF systems.',
        desc_zh: '全场景商用建筑温控方案：超大冷吨螺杆离心机组与智能群控 VRF。',
        badge: 'Thương hiệu đối tác',
        badge_en: 'Partner Brand',
        badge_zh: '官方战略合作品牌',
        discount: 'Ưu đãi đặc biệt 20% - 25%',
        discount_en: 'Special Discount 20% - 25%',
        discount_zh: '直降特惠 20% - 25%',
        logo: '/images/dongduong/partners/midea_transparent.png',
        website: 'https://www.midea.com/vn',
    },
    {
        id: 'vnsteel_hmc',
        name: 'CTY CP KIM KHÍ TP. HỒ CHÍ MINH - VNSTEEL',
        shortName: 'VNSTEEL (HMC)',
        shortName_en: 'VNSTEEL (HMC)',
        shortName_zh: '胡志明市金属股份 (VNSTEEL HMC)',
        category: 'steel',
        sector: 'Sắt & Thép Xây Dựng',
        sector_en: 'Structural & Construction Steel',
        sector_zh: 'VNSTEEL 建筑工程用钢、线材与螺纹钢',
        desc: 'Cung ứng đủ loại thép xây dựng từ VNSTEEL, cam kết báo giá tốt nhất tại kho khu vực miền Nam.',
        desc_en: 'Direct supply of comprehensive VNSTEEL construction rebar and structural steel at southern mill pricing.',
        desc_zh: 'VNSTEEL 越南钢铁总公司南部现货总库直供，规格齐全，提供出厂质保书。',
        badge: 'Nhà cung ứng chiến lược',
        badge_en: 'Strategic Supplier',
        badge_zh: '战略供应总包',
        discount: 'Cam kết giá gốc tại kho',
        discount_en: 'Direct Mill Warehouse Pricing',
        discount_zh: '钢厂直发保供底价',
        logo: '/images/dongduong/partners/hmc_vnsteel.png',
        website: 'https://metalhcm.com.vn',
    },
];

interface PartnersProps {
    initialPartners?: BrandPartnerItem[];
}

export default function Partners({ initialPartners }: PartnersProps) {
    const t = useTranslations('Partners');
    const locale = useLocale();
    const [partners, setPartners] = useState<BrandPartnerItem[]>(initialPartners || DEFAULT_PARTNERS);
    const [activeTab, setActiveTab] = useState<string>('all');

    useEffect(() => {
        $api.get(`/settings/brand-partners?locale=${locale}`)
            .then((res) => {
                if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
                    setPartners(res.data.data);
                }
            })
            .catch(() => {});
    }, [locale]);

    const filteredPartners = activeTab === 'all'
        ? partners
        : partners.filter((p) => p.category === activeTab);

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative py-20 lg:py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80 overflow-hidden"
        >
            {/* Strategic Brand Partner Network Background */}
            <TechSvgBackground variant="partner-network" glowColor="blue" className="absolute inset-0 z-0" />

            <div className="container relative z-10 mx-auto px-4 lg:px-8 max-w-[1340px]">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0A2958]/5 border border-[#0A2958]/10 text-xs font-black tracking-widest text-[#0A2958] uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                        {t('badge')}
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2958] uppercase tracking-tight">
                        {t('title')}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        {t('description')}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-12">
                    {[
                        { key: 'all', label: t('all') },
                        { key: 'tiles', label: t('tiles') },
                        { key: 'hvac', label: t('hvac') },
                        { key: 'steel', label: t('steel') },
                    ].map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] ${
                                    isActive
                                        ? 'bg-[#0A2958] text-white shadow-lg shadow-[#0A2958]/20 border border-[#0A2958]'
                                        : 'bg-white text-slate-700 hover:text-[#0A2958] hover:bg-slate-100 border border-slate-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Partners Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredPartners.map((partner, index) => {
                            const isZh = locale === 'zh';
                            const isEn = locale === 'en';
                            const partnerName = (isZh && partner.shortName_zh) ? partner.shortName_zh : (isEn && partner.shortName_en) ? partner.shortName_en : (partner.shortName || partner.name);
                            const partnerSector = (isZh && partner.sector_zh) ? partner.sector_zh : (isEn && partner.sector_en) ? partner.sector_en : partner.sector;
                            const partnerDesc = (isZh && partner.desc_zh) ? partner.desc_zh : (isEn && partner.desc_en) ? partner.desc_en : partner.desc;
                            const partnerBadge = (isZh && partner.badge_zh) ? partner.badge_zh : (isEn && partner.badge_en) ? partner.badge_en : partner.badge;
                            const partnerDiscount = (isZh && partner.discount_zh) ? partner.discount_zh : (isEn && partner.discount_en) ? partner.discount_en : partner.discount;
                            const logoSrc = partner.logo || '/images/dongduong/partners/dongtam.png';

                            return (
                                <motion.div
                                    layout
                                    key={partner.id || `${partner.name}-${index}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-[#E5B869] hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
                                >
                                    {/* Top Bar: Badge & Discount */}
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <span className="inline-block px-3 py-1 rounded-lg text-xs sm:text-sm font-bold bg-[#0A2958]/10 text-[#0A2958] uppercase tracking-wide">
                                            {partnerBadge}
                                        </span>
                                        {partnerDiscount && (
                                            <span className="inline-block px-3 py-1 rounded-lg text-xs sm:text-sm font-black bg-amber-500/15 text-amber-800 border border-amber-500/30">
                                                {partnerDiscount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Logo Display Container */}
                                    <div className="relative w-full h-32 sm:h-36 mb-4 bg-slate-50/80 rounded-xl p-4 flex items-center justify-center border border-slate-200 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                                        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                                            <Image
                                                src={logoSrc}
                                                alt={partner.name}
                                                fill
                                                className="object-contain p-2"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            />
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="space-y-2.5 flex-grow">
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#0A2958] transition-colors uppercase tracking-tight line-clamp-1">
                                            {partnerName}
                                        </h3>
                                        <div className="text-base sm:text-lg font-extrabold text-[#C29236] uppercase tracking-wide">
                                            {partnerSector}
                                        </div>
                                        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed line-clamp-3">
                                            {partnerDesc}
                                        </p>
                                    </div>

                                    {/* Footer: Genuine Badge & Official Link */}
                                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-base">
                                        <div className="flex items-center gap-1.5 font-bold text-[#0A2958]">
                                            <CheckCircle2 size={18} className="text-[#E5B869]" />
                                            <span>{t('officialBadge')}</span>
                                        </div>
                                        {partner.website && (
                                            <Link
                                                href={partner.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#0A2958] transition-colors"
                                                title={partner.name}
                                            >
                                                <span>{t('viewPartner')}</span>
                                                <ExternalLink size={16} />
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.section>
    );
}
