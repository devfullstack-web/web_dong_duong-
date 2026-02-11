'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';

const ITEMS = [
    {
        title: 'PHÁT TRIỂN BỀN VỮNG',
        desc: 'Thúc đẩy sự bền vững trong chuỗi giá trị và kinh tế tuần hoàn trong xây dựng.',
        linkText: 'TÌM HIỂU THÊM',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
        url: '/ben-vung',
    },
    {
        title: 'HỢP TÁC DỰ ÁN',
        desc: 'Mỗi ngày, trên mọi dự án, chúng tôi làm việc vì bạn. Thành công của bạn là sứ mệnh của chúng tôi.',
        linkText: 'KHÁM PHÁ QUAN HỆ HỢP TÁC',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200',
        url: '/hop-tac',
    },
    {
        title: 'CÔNG CỤ TẠO HỒ SƠ',
        desc: 'Giờ đây bất kỳ ai cũng có thể tạo bộ hồ sơ kỹ thuật được xuất file PDF chuyên nghiệp.',
        linkText: 'TẠO HỒ SƠ NGAY',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1200',
        url: '/cong-cu',
    },
    {
        title: 'DANH MỤC ĐẦU PHUN',
        desc: 'Dễ dàng lựa chọn các loại đầu phun hàng đầu phù hợp với nhu cầu dự án của bạn.',
        linkText: 'KHÁM PHÁ SẢN PHẨM',
        image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?auto=format&fit=crop&q=80&w=1200',
        url: '/san-pham/sprinkler',
    },
    {
        title: 'THIẾT KẾ HỆ THỐNG',
        desc: 'Tìm kiếm sản phẩm hoặc giải pháp phù hợp và xây dựng cấu hình cho dự án của bạn.',
        linkText: 'XEM HƯỚNG DẪN SẢN PHẨM',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200',
        url: '/thiet-ke',
    },
    {
        title: 'TUYỂN DỤNG',
        desc: 'Cơ hội nghề nghiệp, thăng tiến và môi trường làm việc chuyên nghiệp đang chờ đón bạn.',
        linkText: 'XEM VỊ TRÍ ĐANG TUYỂN',
        image: 'https://images.unsplash.com/photo-1522071823995-578fb4836486?auto=format&fit=crop&q=80&w=1200',
        url: '/tuyen-dung',
    },
    {
        title: 'ỨNG DỤNG DI ĐỘNG',
        desc: 'Trải nghiệm bộ ứng dụng di động mới nhất để quản lý dự án mọi lúc mọi nơi.',
        linkText: 'XEM VICTAULIC MOBILE',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200',
        url: '/mobile-app',
    },
    {
        title: 'GIẢI PHÁP HỆ THỐNG',
        desc: 'Các sản phẩm của chúng tôi kết hợp hoàn hảo tạo nên hệ thống giải pháp tối ưu cho công trình.',
        linkText: 'TÌM HIỂU THÊM',
        image: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&q=80&w=1200',
        url: '/giai-phap',
    },
];

export default function FeaturedGrid() {
    return (
        <section className="bg-slate-50 py-12 sm:py-20">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ITEMS.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative h-[320px] overflow-hidden bg-slate-900"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-start space-y-4">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-white/80 font-medium leading-relaxed max-w-[240px]">
                                    {item.desc}
                                </p>
                                <Link
                                    href={item.url}
                                    className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors border-b border-brand-primary/20 hover:border-brand-primary"
                                >
                                    {item.linkText}
                                </Link>
                            </div>

                            <Link href={item.url} className="absolute inset-0 z-10">
                                <span className="sr-only">Go to {item.title}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
