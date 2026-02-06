'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SLIDES = [
    {
        image: '/uploads/images/2026/01/19/1768814857344-hfho0c.png',
        fallback:
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000',
        title: 'GIÁM SÁT',
        highlight: 'QUY TRÌNH THÔNG MINH',
        titleSuffix: 'CÔNG NGHỆ IOT',
        desc: 'Sài Gòn Valve mang đến giải pháp giám sát lưu lượng và áp suất nước theo thời gian thực, giúp tối ưu hóa vận hành và ngăn ngừa thất thoát tài nguyên.',
        accent: 'Công nghệ Quản lý Nước 4.0',
    },
    // {
    //   image: "/images/hero/hero-iot-2.png",
    //   fallback: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=2000",
    //   title: "KẾT NỐI",
    //   highlight: "HẠ TẦNG KỸ THUẬT SỐ",
    //   titleSuffix: "TOÀN DIỆN",
    //   desc: "Xây dựng mạng lưới hạ tầng nước thông minh với hệ thống Datalogger và cảm biến tiên tiến, kết nối dữ liệu trực tiếp lên nền tảng Cloud.",
    //   accent: "Giải pháp Số hóa Hạ tầng"
    // },
    // {
    //   image: "/images/hero/hero-iot-3.png",
    //   fallback: "https://images.unsplash.com/photo-1516937941184-75140537280d?auto=format&fit=crop&q=80&w=2000",
    //   title: "VAN THÔNG MINH",
    //   highlight: "ĐIỀU KHIỂN CHÍNH XÁC",
    //   titleSuffix: "HIỆU SUẤT CAO",
    //   desc: "Phân phối độc quyền các loại van điều khiển điện và khí nén tích hợp IoT, đảm bảo độ chính xác tuyệt đối trong mọi quy trình công nghiệp.",
    //   accent: "Thiết bị Điều khiển Hiện đại"
    // }
];

export default function Hero() {
    const [current, setCurrent] = React.useState(0);
    const [direction, setDirection] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1);
            setCurrent((prev) => (prev + 1) % SLIDES.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden ">
            {/* Video Background */}
            <div className="absolute inset-0 z-0">
                {/* Poster Image - hiển thị khi video chưa load */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/images/hero-poster.jpg"
                    alt="Video poster"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0"
                />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    src="/videos/hero-background.mp4"
                />
            </div>

            <div className="container relative z-10 mx-auto h-full px-4 lg:px-8">
                <div className="flex h-full flex-col justify-center pt-16">
                    <div className="max-w-4xl space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-6"
                            >
                                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase">
                                    {SLIDES[current].title} <br />
                                    <span className="text-brand-accent">
                                        {SLIDES[current].highlight}
                                    </span>{' '}
                                    <br />
                                    <span className="text-white/60">
                                        {SLIDES[current].titleSuffix}
                                    </span>
                                </h1>

                                <p className="max-w-lg text-sm sm:text-base text-white/70 font-medium leading-relaxed">
                                    {SLIDES[current].desc}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <Link
                                        href="/san-pham"
                                        className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:bg-brand-secondary"
                                    >
                                        <span className="relative z-10">KHÁM PHÁ NGAY</span>
                                        <MoveRight
                                            size={14}
                                            className="relative z-10 transition-transform group-hover:translate-x-1"
                                        />
                                    </Link>
                                    <Link
                                        href="/gioi-thieu"
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 hover:bg-white/20 hover:border-white/50 transition-all backdrop-blur-sm rounded-sm"
                                    >
                                        TƯ VẤN GIẢI PHÁP
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide Indicators */}
                        <div className="flex items-center gap-3 pt-8">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDirection(i > current ? 1 : -1);
                                        setCurrent(i);
                                    }}
                                    className={cn(
                                        'h-1 rounded-full transition-all duration-500',
                                        current === i
                                            ? 'w-12 bg-brand-accent shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                                            : 'w-6 bg-white/30 hover:bg-white/50',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Technical Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-4"
            >
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em]">
                        0{current + 1} / 0{SLIDES.length}
                    </span>
                    <div className="w-16 h-px bg-white/20">
                        <motion.div
                            className="h-full bg-brand-accent"
                            initial={{ width: 0 }}
                            animate={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
