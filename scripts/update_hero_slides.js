/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const newHeroSlides = [
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
    image_url: '/images/banners/hero-dongduong-corp.jpg',
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
    title: 'BỘ SƯU TẬP GẠCH KHỔ LỚN BIG SLAB',
    title_en: 'BIG SLAB TILE COLLECTION',
    title_zh: '超大规格高端岩板大板瓷砖系列',
    highlight: 'ĐỒNG TÂM - TAICERA - VIGLACERA - CATALAN',
    highlight_en: 'DONG TAM - TAICERA - VIGLACERA - CATALAN',
    highlight_zh: '董心 · 大马 · 维格拉塞拉 · 卡塔兰',
    subtitle: 'Gạch Porcelain và Granite siêu bền, hoa văn vân đá cẩm thạch sang trọng kiến tạo không gian sống và công trình thương mại đẳng cấp.',
    subtitle_en: 'Ultra-durable Porcelain and Granite tiles with luxurious marble veins, elevating living spaces and premier commercial landmarks.',
    subtitle_zh: '高致密度同质通体石英砖与抗菌白金大板，莫氏高硬度、零渗污、意大利逼真连纹大理石质感，赋能五星级地标工程。',
    image_url: '/images/banners/banner-big-slab-tiles.jpg',
    badge: 'TIÊU CHUẨN XUẤT KHẨU CHÂU ÂU',
    badge_en: 'EUROPEAN EXPORT STANDARDS',
    badge_zh: '欧洲出口级优等品标准',
    cta_primary: {
      text: 'NHẬN BÁO GIÁ DỰ ÁN',
      text_en: 'REQUEST PROJECT QUOTE',
      text_zh: '获取工程大宗底价',
      link: '#quote-form',
    },
    cta_secondary: {
      text: 'DANH MỤC SẢN PHẨM',
      text_en: 'EXPLORE PRODUCTS',
      text_zh: '浏览全部核心产品',
      link: '/san-pham',
    },
  },
  {
    id: 'slide-3',
    title: 'HỆ THỐNG ĐIỀU HÒA TRUNG TÂM',
    title_en: 'CENTRAL HVAC & CHILLER SYSTEMS',
    title_zh: 'VRV / VRF 智能多联机 & 螺杆离心式冷水机组',
    highlight: 'VRV / VRF & CHILLER DAIKIN - GREE - MIDEA',
    highlight_en: 'VRV / VRF & CHILLERS DAIKIN - GREE - MIDEA',
    highlight_zh: '大金 · 格力 · 美的 · LG 核心战略集采总代',
    subtitle: 'Giải pháp làm mát thông minh cho biệt thự, tòa nhà và khu công nghiệp. Tiết kiệm năng lượng lên tới 65% với biến tần Inverter cao cấp.',
    subtitle_en: 'Smart cooling solutions for luxury villas, high-rise buildings, and industrial parks. Save up to 65% energy with advanced Inverters.',
    subtitle_zh: '为独栋豪宅别墅、甲级商务写字楼及大型高科技洁净厂房提供定制温控方案，搭载变频核心技术，节电高达 65%。',
    image_url: '/images/banners/banner-central-hvac.jpg',
    badge: 'GIẢI PHÁP TIẾT KIỆM NĂNG LƯỢNG HÀNG ĐẦU',
    badge_en: 'TOP ENERGY-SAVING SOLUTIONS',
    badge_zh: '全球领先绿色节能制冷方案',
    cta_primary: {
      text: 'NHẬN BÁO GIÁ DỰ ÁN',
      text_en: 'REQUEST PROJECT QUOTE',
      text_zh: '获取工程大宗底价',
      link: '#quote-form',
    },
    cta_secondary: {
      text: 'DANH MỤC SẢN PHẨM',
      text_en: 'EXPLORE PRODUCTS',
      text_zh: '浏览全部核心产品',
      link: '/san-pham',
    },
  },
];

async function run() {
  await pool.query(
    'INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
    ['homepage_hero_slides', JSON.stringify(newHeroSlides)]
  );
  console.log('Successfully updated homepage_hero_slides in PostgreSQL with real product banners!');
  await pool.end();
}

run().catch(console.error);
