'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
    Phone,
    Mail,
    MapPin,
    Send,
    MessageSquare,
    Facebook,
    Linkedin,
    Youtube,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { COMPANY_INFO } from '@/constants/site-info';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (
            !formData.name ||
            !formData.phone ||
            !formData.email ||
            !formData.address ||
            !formData.message
        ) {
            toast.error('Vui lòng điền đầy đủ tất cả các trường thông tin');
            return;
        }

        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.CONTACTS, formData);
            toast.success('Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm nhất.');
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                message: '',
            });
        } catch (error: any) {
            console.error(error);
            const message =
                error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section className="bg-brand-primary py-24 sm:py-32 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-px bg-white/10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-secondary/20 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
            <div className="absolute top-20 left-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-stretch">
                    <div className="flex flex-col justify-center space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tighter uppercase leading-none">
                                LIÊN HỆ VỚI CHUYÊN GIA{' '}
                                <span className="text-brand-accent">SÀI GÒN VALVE</span>
                            </h2>
                            <p className="text-base text-slate-300 font-medium leading-relaxed max-w-lg">
                                Đội ngũ kỹ thuật của Sài Gòn Valve luôn sẵn sàng hỗ trợ tư vấn và
                                cung cấp giải pháp tối ưu cho mọi thách thức hạ tầng của bạn.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: Phone,
                                    label: 'HOTLINE',
                                    value: COMPANY_INFO.phone,
                                    sub: 'Hỗ trợ 24/7',
                                },
                                {
                                    icon: Mail,
                                    label: 'EMAIL',
                                    value: COMPANY_INFO.email,
                                    sub: 'Phản hồi trong 2h',
                                },
                                {
                                    icon: MapPin,
                                    label: 'ĐỊA CHỈ',
                                    value: COMPANY_INFO.address,
                                    sub: 'Văn phòng chính',
                                },
                                {
                                    icon: MessageSquare,
                                    label: 'ZALO / VIBER',
                                    value: COMPANY_INFO.hotline,
                                    sub: 'Hỗ trợ kỹ thuật',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3 text-brand-accent">
                                        <item.icon size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-white leading-snug">
                                            {item.value}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {item.sub}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            {[Facebook, Linkedin, Youtube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="h-11 w-11 flex items-center justify-center bg-white/5 border border-white/10 text-white hover:bg-brand-accent hover:border-brand-accent transition-all"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 sm:p-12 lg:p-14 shadow-2xl relative"
                    >
                        {/* Simple Border Accent */}
                        <div className="absolute top-0 right-0 h-1.5 w-full bg-brand-accent"></div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl sm:text-3xl font-bold text-brand-primary uppercase tracking-tight">
                                    Gửi yêu cầu tư vấn
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    Vui lòng điền đầy đủ các thông tin bên dưới để được hỗ trợ tốt
                                    nhất.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Họ tên *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Số điện thoại *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder="09xx xxx xxx"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder="example@gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Địa chỉ *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Yêu cầu *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors resize-none bg-transparent"
                                        placeholder="Vui lòng mô tả yêu cầu của bạn..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-4 bg-brand-primary py-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            ĐANG GỬI...{' '}
                                            <Loader2 size={16} className="animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            GỬI YÊU CẦU NGAY <Send size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
