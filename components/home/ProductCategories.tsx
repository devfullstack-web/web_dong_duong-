'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const SECTORS = [
    {
        name: 'Tổng thầu thi công',
        desc: 'Xử lý nước thải & Cấp nước đô thị',
        image: 'https://saigonvalve.vn/themes/seval.com.vn/assets/imgs/home/field/field-2.png',
    },
    {
        name: 'Tư vấn thiết kế',
        desc: 'Giải pháp trạm quan trắc tự động',
        image: 'https://giaiphapnhaxanh.com/upload/elfinder/TH%C3%81NG%208/Dien%20c%C3%B4ng%20nghi%E1%BB%87p/bao-duong-he-thong-cap-thoat-ok4.png',
    },
    {
        name: 'Cung cấp thiết bị',
        desc: 'Van công nghiệp & Actuator cao cấp',
        image: 'https://vancongnghiepatp.com/upload/files/sanpham/van_bi_gang.jpg',
    },
    {
        name: 'Bảo trì & Vận hành',
        desc: 'Dịch vụ kỹ thuật chuyên sâu 24/7',
        image: 'https://vanhanoi.com/files/assets/van_cong/bao_tri_bao_duong_van_cong.jpg',
    },
];

export default function ProductCategories() {
    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="mb-20 text-center space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-bold text-brand-secondary tracking-tight uppercase">
                        Lĩnh vực hoạt động
                    </h2>
                    <div className="mx-auto h-1 w-20 bg-brand-primary"></div>
                    <p className="mx-auto max-w-2xl text-muted-foreground font-medium">
                        Sài Gòn Valve cung cấp các giải pháp toàn diện cho hạ tầng mạng lưới nước,
                        từ tư vấn thiết kế đến cung cấp thiết bị và vận hành.
                    </p>
                </div>

                {/* Sectors Grid - Delta Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {SECTORS.map((sector, i) => (
                        <motion.div
                            key={sector.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative h-[400px] overflow-hidden"
                        >
                            <Image
                                src={sector.image}
                                alt={sector.name}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {/* Image Overlay - darkening at bottom for text readability */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-8 text-center space-y-4">
                                <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight transition-transform group-hover:-translate-y-2">
                                    {sector.name}
                                </h3>
                                <div className="h-0.5 w-12 bg-brand-accent transition-all group-hover:w-32"></div>
                                <p className="text-sm font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                    {sector.desc}
                                </p>
                            </div>

                            <Link href="/san-pham" className="absolute inset-0 z-10">
                                <span className="sr-only">Xem chi tiết {sector.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action */}
                <div className="mt-20 flex justify-center">
                    <Link
                        href="/san-pham"
                        className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-brand-secondary group border-b-2 border-transparent hover:border-brand-primary pb-2 transition-all"
                    >
                        XEM TOÀN BỘ SẢN PHẨM & GIẢI PHÁP
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-2"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}
