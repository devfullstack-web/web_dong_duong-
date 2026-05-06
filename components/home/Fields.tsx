'use client';

import { motion } from 'motion/react';
import { MoveRight, ShieldCheck, Zap, Cog, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const HIGHLIGHTS = [
    {
        icon: ShieldCheck,
        title: 'Chính hãng 100%',
        desc: 'Đại diện độc quyền các thương hiệu OKM Japan, Noah Korea, Niigata Nhật Bản tại Việt Nam.',
        color: 'bg-brand-primary',
    },
    {
        icon: Zap,
        title: 'Phản hồi nhanh',
        desc: 'Đội ngũ kỹ thuật phản hồi báo giá và xử lý sự cố trong vòng 2-4 giờ làm việc.',
        color: 'bg-brand-secondary',
    },
    {
        icon: Activity,
        title: 'Giải pháp số hóa',
        desc: 'Tiên phong trong việc tích hợp công nghệ IoT vào mạng lưới cấp thoát nước đô thị.',
        color: 'bg-slate-700',
    },
];

export default function Fields() {
    return (
        <section className="bg-white py-24 sm:py-32 relative overflow-hidden">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 h-1/2 w-1/3 bg-slate-50 -skew-x-12 transform translate-x-32"></div>

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
                                CÔNG NGHỆ & CHẤT LƯỢNG
                            </div>
                            <h2 className="text-5xl sm:text-6xl font-bold text-brand-secondary tracking-tighter uppercase leading-[0.95]">
                                Tại sao chọn <br />
                                <span className="text-brand-primary">Sài Gòn Valve?</span>
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                Chúng tôi không chỉ cung cấp thiết bị, chúng tôi cung cấp giải pháp
                                vận hành tối ưu, bền bỉ và hiện đại cho các công trình hạ tầng trọng
                                điểm.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {HIGHLIGHTS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div
                                        className={cn(
                                            'h-14 w-14 shrink-0 rounded-sm flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110',
                                            item.color,
                                        )}
                                    >
                                        <item.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-foreground uppercase tracking-tight">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground font-medium max-w-sm">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <Link
                                href="/gioi-thieu"
                                className="flex items-center gap-4 group text-xs font-black uppercase tracking-widest text-brand-primary"
                            >
                                TÌM HIỂU THÊM{' '}
                                <MoveRight
                                    size={20}
                                    className="transition-transform group-hover:translate-x-2"
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-square w-full shadow-2xl overflow-hidden hover:scale-[1.02] transition-all duration-700">
                            <Image
                                src="https://saigonvalve.vn/uploads/files/2024/11/14/DATALOGGER.png"
                                alt="Sài Gòn Valve Tech"
                                fill
                                unoptimized
                                className="object-contain p-20 bg-slate-50"
                            />
                        </div>
                        {/* Industrial Accent Decoration */}
                        <div className="absolute -bottom-10 -left-10 h-40 w-40 border-8 border-brand-primary/10 -z-10"></div>
                        <div className="absolute -top-10 -right-10 h-60 w-60 bg-brand-accent/5 -z-10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Simple Utility for CN
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
