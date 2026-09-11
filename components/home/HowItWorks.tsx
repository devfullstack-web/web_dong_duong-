'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Activity, Wifi, Cloud, LayoutGrid, ToggleRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function HowItWorks() {
    const locale = useLocale();
    const isVi = locale === 'vi';

    const content = {
        badge: isVi ? 'LUỒNG HOẠT ĐỘNG' : 'SYSTEM ARCHITECTURE',
        title: isVi ? 'VẬN HÀNH THÔNG MINH NHƯ THẾ NÀO?' : 'HOW DOES THE SYSTEM WORK?',
        desc: isVi 
            ? 'Hành trình số hóa nguồn nước khép kín từ cảm biến thực địa, truyền không dây, xử lý trên đám mây tới bảng điều khiển của người vận hành.'
            : 'A closed-loop digitalization journey from field sensors, wireless transmission, cloud processing to the operator\'s dashboard.',
        steps: [
            {
                icon: Activity,
                step: '01',
                title: isVi ? 'Sensor Node' : 'Sensor Node',
                subtitle: isVi ? 'Thu thập dữ liệu' : 'Data Collection',
                desc: isVi 
                    ? 'Cảm biến lưu lượng, áp suất, mực nước hoặc chất lượng nước đo đạc thông số liên tục tại thực địa.'
                    : 'Pressure, flow, level, or quality sensors continuously measure pipeline physical parameters.',
                color: 'text-blue-500',
                border: 'border-blue-200'
            },
            {
                icon: Wifi,
                step: '02',
                title: isVi ? 'IoT Gateway' : 'Smart Gateway',
                subtitle: isVi ? 'Truyền tải không dây' : 'Wireless Transmission',
                desc: isVi 
                    ? 'Thu nhận tín hiệu từ cảm biến, mã hóa và truyền lên đám mây qua 4G, LoRaWAN hoặc NB-IoT.'
                    : 'Collects sensor data, encrypts and transmits wirelessly to the cloud via 4G, LoRaWAN or NB-IoT.',
                color: 'text-cyan-500',
                border: 'border-cyan-200'
            },
            {
                icon: Cloud,
                step: '03',
                title: isVi ? 'Cloud Server' : 'Cloud Server',
                subtitle: isVi ? 'Xử lý & Lưu trữ' : 'Cloud IoT Platform',
                desc: isVi 
                    ? 'Hệ thống máy chủ xử lý hàng triệu gói tin mỗi giây, phân tích dữ liệu và dự báo xu hướng.'
                    : 'Processes millions of data packets per second, analyzing patterns and predicting water flows.',
                color: 'text-indigo-500',
                border: 'border-indigo-200'
            },
            {
                icon: LayoutGrid,
                step: '04',
                title: isVi ? 'Dashboard' : 'Interactive Dashboard',
                subtitle: isVi ? 'Trực quan hóa' : 'Data Visualization',
                desc: isVi 
                    ? 'Hiển thị dữ liệu, biểu đồ xu hướng, sơ đồ synoptic mạng lưới trên giao diện PC & Mobile.'
                    : 'Displays live data, flow charts, and synoptic maps on rich responsive Web & Mobile UI.',
                color: 'text-purple-500',
                border: 'border-purple-200'
            },
            {
                icon: ToggleRight,
                step: '05',
                title: isVi ? 'Control & Alert' : 'Control & Alert',
                subtitle: isVi ? 'Cảnh báo & Điều khiển' : 'Incident Management',
                desc: isVi 
                    ? 'Tự động gửi cảnh báo sự cố qua SMS/Zalo và cho phép đóng ngắt van thông minh từ xa lập tức.'
                    : 'Sends instant alerts via SMS/Zalo and enables immediate remote valve shut-off commands.',
                color: 'text-emerald-500',
                border: 'border-emerald-200'
            }
        ]
    };

    return (
        <section id="how-it-works" className="bg-slate-50 py-20 border-b border-slate-100 scroll-mt-20 relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#2069c5_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] z-0"></div>

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/5 px-3.5 py-1.5 rounded-full inline-block">
                        {content.badge}
                    </span>
                    <h2 className="text-2xl md:text-4.5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                        {content.title}
                    </h2>
                    <div className="w-16 h-1 bg-brand-primary mx-auto my-2"></div>
                    <p className="text-base sm:text-lg text-slate-600 font-normal sm:font-medium leading-relaxed max-w-2xl mx-auto">
                        {content.desc}
                    </p>
                </div>

                {/* Timeline Flow */}
                <div className="relative">
                    {/* Horizontal Connector Line for Desktop */}
                    <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-slate-200 -translate-y-12 hidden xl:block z-0">
                        {/* Interactive Data Pulse Animation */}
                        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-brand-primary to-transparent animate-[dataFlow_4s_linear_infinite]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 xl:gap-6 relative z-10">
                        {content.steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className="flex flex-col items-center text-center space-y-4 bg-white p-6 border border-slate-100/80 shadow-sm relative group rounded-none"
                                >
                                    {/* Connection Indicator for mobile */}
                                    {i < content.steps.length - 1 && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-slate-300 xl:hidden z-20">
                                            <ArrowRight size={16} className="rotate-90 md:rotate-0" />
                                        </div>
                                    )}

                                    {/* Step badge */}
                                    <span className="absolute top-3 right-3 text-xs font-black text-slate-300 group-hover:text-brand-primary transition-colors">
                                        {step.step}
                                    </span>

                                    {/* Icon Container with border accent */}
                                    <div className={cn(
                                        "h-14 w-14 rounded-full border-2 flex items-center justify-center bg-slate-50/50 transition-all duration-500 group-hover:scale-110",
                                        step.border,
                                        step.color
                                    )}>
                                        <Icon size={22} className="stroke-[2px]" />
                                    </div>

                                    {/* Content Info */}
                                    <div className="space-y-1.5 flex-1 flex flex-col justify-between pt-2">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                                                {step.subtitle}
                                            </span>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight pt-1">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm sm:text-base text-slate-600 font-normal sm:font-medium leading-relaxed pt-2">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Custom Tailwind Data Flow Animation Style */}
            <style jsx global>{`
                @keyframes dataFlow {
                    0% { left: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { left: calc(100% - 6rem); opacity: 0; }
                }
            `}</style>
        </section>
    );
}
