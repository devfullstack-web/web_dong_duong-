'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { ShieldCheck, Clock, Coins, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export default function KeyBenefits() {
    const locale = useLocale();
    const isVi = locale === 'vi';

    const content = {
        badge: isVi ? 'LỢI ÍCH CỐT LÕI' : 'BUSINESS VALUE',
        title: isVi ? 'TẠI SAO CHỌN GIẢI PHÁP CỦA CHÚNG TÔI?' : 'WHY CHOOSE OUR SOLUTIONS?',
        desc: isVi 
            ? 'Mang lại giá trị thiết thực và sự an tâm tuyệt đối cho quá trình quản lý hạ tầng nước thông qua công nghệ hiện đại.'
            : 'Deliver tangible values and absolute peace of mind for water infrastructure management through modern technology.',
        benefits: [
            {
                icon: Clock,
                title: isVi ? 'Giám sát Real-time 24/7' : 'Real-time 24/7 Monitoring',
                desc: isVi 
                    ? 'Dữ liệu lưu lượng, áp suất và các chỉ số chất lượng được thu thập và cập nhật liên tục từng giây, loại bỏ hoàn toàn độ trễ.'
                    : 'Pressure, flow, and chemical indexes are collected and updated continuously every second, eliminating all data latency.',
                color: 'text-blue-500',
                bg: 'bg-blue-50'
            },
            {
                icon: ShieldCheck,
                title: isVi ? 'Cảnh báo sớm sự cố' : 'Early Incident Alerts',
                desc: isVi 
                    ? 'Phát hiện ngay lập tức các sự cố vỡ ống, rò rỉ hoặc bất thường nguồn nước để xử lý kịp thời, giảm thiểu tối đa hao hụt.'
                    : 'Instantly spot pipe bursts, leakages, or quality anomalies to minimize non-revenue water and physical damages.',
                color: 'text-cyan-500',
                bg: 'bg-cyan-50'
            },
            {
                icon: Coins,
                title: isVi ? 'Tiết kiệm chi phí vận hành' : 'Operating Cost Savings',
                desc: isVi 
                    ? 'Giảm 90% công tuần tra thực địa của nhân sự, tối ưu hóa áp suất mạng lưới để giảm điện năng tiêu thụ bơm và kéo dài tuổi thọ ống.'
                    : 'Reduce field inspection efforts by 90%, optimize network pressure to save pumping energy and extend pipeline lifespan.',
                color: 'text-indigo-500',
                bg: 'bg-indigo-50'
            },
            {
                icon: LayoutDashboard,
                title: isVi ? 'Quản lý tập trung' : 'Centralized Management',
                desc: isVi 
                    ? 'Gom tất cả các trạm bơm, thiết bị đo và điều khiển van phân tán về một trung tâm giám sát thông tin duy nhất.'
                    : 'Consolidate all distributed pumping stations, flowmeters, and remote valves into a single central control dashboard.',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50'
            }
        ]
    };

    return (
        <section id="key-benefits" className="bg-white py-20 border-b border-slate-100 scroll-mt-20">
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

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {content.benefits.map((benefit, i) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                className="group p-6 md:p-8 bg-slate-50 border border-transparent hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300 rounded-none flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className={`h-12 w-12 flex items-center justify-center rounded-none bg-white transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white ${benefit.color} shadow-sm`}>
                                        <Icon size={20} className="stroke-[2px]" />
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight leading-snug group-hover:text-brand-primary transition-colors">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        {benefit.desc}
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
