'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

const BANNERS = [
    {
        tag: 'HỆ THỐNG NỔI BẬT',
        title: 'HỆ THỐNG QUICKVIC™',
        desc: 'Hệ thống khớp nối đầu tiên và duy nhất được thiết kế cho súng bắn bulong hiệu suất cao.',
        btnText: 'Khám phá ngay',
        image: '/uploads/images/2026/01/19/1768814857344-hfho0c.png',
        url: '/he-thong-quickvic',
    },
    {
        tag: 'VIDEO HƯỚNG DẪN',
        title: 'HƯỚNG DẪN LẮP ĐẶT',
        desc: 'Tìm hiểu cách lắp đặt sản phẩm và vận hành thiết bị Victaulic thông qua các video hướng dẫn chi tiết.',
        btnText: 'Xem danh sách',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000',
        url: '/huong-dan-lap-dat',
    },
];

export default function SystemHighlight() {
    return (
        <section className="bg-white py-12 space-y-8">
            <div className="container mx-auto px-4 lg:px-8 space-y-8">
                {BANNERS.map((banner, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative h-[400px] overflow-hidden bg-slate-900"
                    >
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            unoptimized
                            className="object-cover opacity-50 transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/40 to-transparent"></div>

                        <div className="absolute inset-0 container mx-auto px-12 py-16 flex flex-col justify-center space-y-6">
                            <div className="space-y-4 max-w-xl">
                                <p className="text-[10px] font-black tracking-[0.2em] text-brand-accent uppercase">
                                    {banner.tag}
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                    {banner.title}
                                </h2>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                    {banner.desc}
                                </p>
                            </div>

                            <div className="pt-4">
                                {/* <Link
                  href={banner.url}
                  className="inline-flex items-center px-8 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-colors"
                >
                  {banner.btnText}
                </Link> */}
                                <Button className="inline-flex items-center px-8 py-3 bg-brand-primary hover:cursor-pointer  text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-colors">
                                    {banner.btnText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
