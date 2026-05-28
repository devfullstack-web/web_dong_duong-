'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Droplet, Activity, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function TechnologyOverview() {
    const locale = useLocale();

    const isVi = locale === 'vi';

    const content = {
        badge: isVi ? 'TỔNG QUAN GIẢI PHÁP' : 'SOLUTION OVERVIEW',
        title: isVi ? 'CÔNG NGHỆ IOT WATER LÀ GÌ?' : 'WHAT IS IOT WATER TECHNOLOGY?',
        desc: isVi 
            ? 'IoT Water là giải pháp số hóa toàn diện hạ tầng ngành nước, ứng dụng công nghệ cảm biến thông minh, kết nối không dây và điện toán đám mây để quản lý, giám sát và vận hành hệ thống cấp thoát nước theo thời gian thực.'
            : 'IoT Water is a comprehensive digital solution for water infrastructure, combining smart sensors, wireless connectivity, and cloud computing to monitor, manage, and operate water supply and drainage systems in real time.',
        cards: [
            {
                icon: Droplet,
                title: isVi ? 'Chống thất thoát nước' : 'Non-Revenue Water (NRW)',
                desc: isVi 
                    ? 'Giảm thiểu hao hụt nguồn nước sạch bằng công nghệ giám sát áp suất chênh lệch, phân tích lưu lượng ban đêm và định vị điểm rò rỉ tức thời.'
                    : 'Minimize water loss through differential pressure monitoring, night flow analysis, and instant pipeline leak detection algorithms.',
                color: 'text-blue-500',
                bg: 'bg-blue-500/5',
                border: 'hover:border-blue-500/30'
            },
            {
                icon: Activity,
                title: isVi ? 'Kiểm soát chất lượng nước' : 'Water Quality Control',
                desc: isVi 
                    ? 'Tự động đo đạc trực tuyến liên tục các chỉ số quan trọng (pH, Clo dư, Độ đục, COD) đảm bảo an toàn tuyệt đối trước khi cấp nước tiêu dùng.'
                    : 'Automatically measure critical online parameters (pH, Residual Chlorine, Turbidity, COD) to guarantee safety before municipal distribution.',
                color: 'text-cyan-500',
                bg: 'bg-cyan-500/5',
                border: 'hover:border-cyan-500/30'
            },
            {
                icon: Cpu,
                title: isVi ? 'Vận hành SCADA tự động' : 'Automated SCADA Operation',
                desc: isVi 
                    ? 'Số hóa toàn diện hạ tầng mạng lưới cấp thoát nước, hỗ trợ điều tiết lưu lượng thông minh và đóng ngắt van tự động từ xa qua ứng dụng Web/App.'
                    : 'Completely digitalize water supply networks, supporting smart flow regulation and automated remote valve controls via Web/App.',
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/5',
                border: 'hover:border-indigo-500/30'
            }
        ]
    };

    return (
        <section id="technology-overview" className="bg-white py-20 border-b border-slate-100 scroll-mt-20">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-full inline-block">
                        {content.badge}
                    </span>
                    <h2 className="text-2xl md:text-4.5xl font-black text-slate-900 uppercase tracking-tight leading-none">
                        {content.title}
                    </h2>
                    <div className="w-16 h-1 bg-brand-primary mx-auto my-2"></div>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {content.desc}
                    </p>
                </div>

                {/* Core Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {content.cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className={`group p-6 md:p-8 bg-white border border-slate-100 rounded-none transition-all duration-300 ${card.border} hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between`}
                            >
                                <div className="space-y-5">
                                    <div className={`h-12 w-12 flex items-center justify-center ${card.bg} ${card.color} transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
