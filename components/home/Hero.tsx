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
        <section className="relative h-screen min-h-[800px] w-full overflow-hidden ">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={SLIDES[current].image}
                        alt="Sài Gòn Valve Industry"
                        fill
                        className="object-cover opacity-70 contrast-[1.05] saturate-[1.1] brightness-110"
                        priority
                        onError={(e: any) => {
                            e.target.src = SLIDES[current].fallback;
                        }}
                    />

                    {/* Digital Grid Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                            backgroundSize: '32px 32px',
                        }}
                    />

                    {/* Animated Wave Lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                        <motion.path
                            d="M 0 400 Q 250 350, 500 400 T 1000 400"
                            stroke="rgba(6,182,212,0.4)"
                            strokeWidth="1"
                            fill="none"
                            animate={{
                                d: [
                                    'M 0 400 Q 250 380, 500 400 T 1000 400',
                                    'M 0 400 Q 250 420, 500 400 T 1000 400',
                                    'M 0 400 Q 250 380, 500 400 T 1000 400',
                                ],
                            }}
                            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                        />
                    </svg>

                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-800/30 to-slate-900/20"></div>
                </motion.div>
            </AnimatePresence>

            <div className="container relative z-10 mx-auto h-full px-4 lg:px-8">
                <div className="flex h-full flex-col justify-center pt-24">
                    <div className="max-w-5xl space-y-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-8"
                            >
                           

                                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] uppercase drop-shadow-lg">
                                    {SLIDES[current].title} <br />
                                    <span className="text-brand-primary drop-shadow-[0_2px_4px_rgba(0,29,74,0.3)]">
                                        {SLIDES[current].highlight}
                                    </span>{' '}
                                    <br />
                                    <span className="text-white/70">
                                        {SLIDES[current].titleSuffix}
                                    </span>
                                </h1>

                                <p className="max-w-xl text-base sm:text-lg text-slate-200 font-medium leading-relaxed drop-shadow-sm">
                                    {SLIDES[current].desc}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                                    <Link
                                        href="/san-pham"
                                        className="group relative overflow-hidden inline-flex items-center justify-center gap-4 px-10 py-5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-sm shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-105"
                                    >
                                        <span className="relative z-10">KHÁM PHÁ NGAY</span>
                                        <MoveRight
                                            size={16}
                                            className="relative z-10 transition-transform group-hover:translate-x-1.5"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-primary/80 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                                    </Link>
                                    <Link
                                        href="/gioi-thieu"
                                        className="inline-flex items-center justify-center gap-4 px-10 py-5 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-brand-primary hover:border-brand-primary transition-all backdrop-blur-sm rounded-sm hover:scale-105"
                                    >
                                        TƯ VẤN GIẢI PHÁP
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Slide Indicators */}
                        <div className="flex items-center gap-4 pt-12">
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
                                            ? 'w-16 bg-brand-primary shadow-[0_0_10px_rgba(0,29,74,0.4)]'
                                            : 'w-8 bg-white/20 hover:bg-white/40',
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
                className="absolute bottom-12 right-12 z-20 flex flex-col items-end gap-6"
            >
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                        0{current + 1} / 0{SLIDES.length}
                    </span>
                    <div className="w-20 h-px bg-white/20">
                        <motion.div
                            className="h-full bg-brand-primary"
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
