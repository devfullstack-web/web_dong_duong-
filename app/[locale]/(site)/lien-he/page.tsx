'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
    Phone,
    Mail,
    MapPin,
    Send,
    ShieldCheck,
    Facebook,
    Linkedin,
    Youtube,
    Headset,
    Clock,
    Search,
    Info,
    Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { COMPANY_INFO } from '@/constants/site-info';

const FAQS = [
    {
        q: 'LÀM THẾ NÀO ĐỂ NHẬN BÁO GIÁ CHO DỰ ÁN?',
        a: `Quý khách có thể gửi yêu cầu trực tiếp qua form liên hệ bên dưới, hoặc gọi hotline ${COMPANY_INFO.phone}. Đội ngũ kỹ thuật sẽ phản hồi và gửi báo giá chi tiết trong vòng 2-4 giờ làm việc.`,
    },
    {
        q: 'SÀI GÒN VALVE CÓ CUNG CẤP DỊCH VỤ LẮP ĐẶT TẬN NƠI KHÔNG?',
        a: 'Có, chúng tôi sở hữu đội ngũ kỹ sư và kỹ thuật viên chuyên nghiệp, sẵn sàng hỗ trợ lắp đặt, cấu hình thiết bị và chuyển giao công nghệ tận công trình trên toàn quốc.',
    },
    {
        q: 'CHÍNH SÁCH BẢO HÀNH THIẾT BỊ NHƯ THẾ NÀO?',
        a: 'Tất cả thiết bị chính hãng OKM, Noah, Niigata do SGV phân phối đều được bảo hành tiêu chuẩn 12-24 tháng tùy dòng sản phẩm. Chúng tôi cam kết bảo trì và hỗ trợ kỹ thuật trọn đời.',
    },
];

export default function ContactPage() {
    const t = useTranslations('Contact');
    const tc = useTranslations('ContactForm');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        message: '',
    });

    const FAQS_CONTENT = [
        {
            q: t('faqs.0.q'),
            a: t('faqs.0.a', { phone: COMPANY_INFO.phone }),
        },
        {
            q: t('faqs.1.q'),
            a: t('faqs.1.a'),
        },
        {
            q: t('faqs.2.q'),
            a: t('faqs.2.a'),
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.phone ||
            !formData.email ||
            !formData.address ||
            !formData.message
        ) {
            toast.error(tc('errors.required'));
            return;
        }

        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.CONTACTS, formData);
            toast.success(tc('success'));
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                message: '',
            });
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || tc('errors.general');
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
        <div className="flex flex-col min-h-screen bg-white">
            {/* Page Header */}
            <section className="relative pt-40 pb-20 bg-linear-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30">
                    <Image
                        src="https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=2000"
                        alt="Contact Background"
                        fill
                        unoptimized
                        className="object-cover brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-brand-primary/70 via-brand-secondary/50 to-brand-primary/80"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center sm:text-left">
                    <div className="max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            {t('headerBadge')}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.3] drop-shadow-lg">
                            {t('headerTitle')} <br />
                            <span className="text-brand-accent">{t('headerTitleAccent')}</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-24">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-100 border border-slate-100">
                        {/* Info Column */}
                        <div className="bg-white p-12 sm:p-20 space-y-16">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-brand-secondary uppercase tracking-tight leading-tight">
                                    {t('infoTitle')}
                                </h2>
                                <p className="text-lg text-muted-foreground font-medium max-w-sm">
                                    {t('infoDesc')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-l border-slate-100 pl-8">
                                {[
                                    {
                                        icon: Phone,
                                        label: t('labels.sales'),
                                        value: COMPANY_INFO.phone,
                                        sub: t('subs.sales'),
                                    },
                                    {
                                        icon: Headset,
                                        label: t('labels.tech'),
                                        value: COMPANY_INFO.hotline,
                                        sub: t('subs.tech'),
                                    },
                                    {
                                        icon: Mail,
                                        label: t('labels.office'),
                                        value: COMPANY_INFO.email,
                                        sub: t('subs.office'),
                                    },
                                    {
                                        icon: MapPin,
                                        label: t('labels.headquarters'),
                                        value: COMPANY_INFO.address,
                                        sub: t('subs.headquarters'),
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="h-10 w-10 flex items-center justify-center text-brand-primary transition-all">
                                            <item.icon size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                {item.label}
                                            </div>
                                            <div className="text-lg font-bold text-slate-900">
                                                {item.value}
                                            </div>
                                            <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                                                {item.sub}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-8 pt-10 border-t border-slate-50">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary">
                                    <Clock size={16} className="text-brand-accent" /> {t('workingHours')}
                                </div>
                                <div className="flex gap-6">
                                    {[Facebook, Linkedin, Youtube].map((Icon, i) => (
                                        <a
                                            key={i}
                                            href="#"
                                            className="h-12 w-12 flex items-center justify-center border border-slate-100 text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all"
                                        >
                                            <Icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="bg-slate-50 p-12 sm:p-20 space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">
                                    {t('formTitle')}
                                </h3>
                                <div className="h-1 w-20 bg-brand-primary"></div>
                            </div>

                            <form className="space-y-10" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {tc('labels.name')}
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder={tc('placeholders.name')}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {tc('labels.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder={tc('placeholders.phone')}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {tc('labels.email')}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder={tc('placeholders.email')}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {tc('labels.address')}
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder={tc('placeholders.address')}
                                            className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        {tc('labels.message')}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={2}
                                        placeholder={tc('placeholders.message')}
                                        className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors resize-none placeholder:text-slate-200"
                                    ></textarea>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground italic uppercase">
                                        <ShieldCheck size={14} className="text-brand-primary" />
                                        {t('security')}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex w-full items-center justify-center gap-4 bg-brand-primary py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                {t('submitting')}{' '}
                                                <Loader2 size={18} className="animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                {t('submit')} <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white border-t border-slate-50">
                <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold uppercase tracking-tight text-brand-secondary">
                            {t('faqTitle')}
                        </h2>
                        <div className="mx-auto h-1 w-20 bg-brand-primary"></div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {FAQS_CONTENT.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-slate-100">
                                <AccordionTrigger className="text-sm font-bold uppercase tracking-tight text-slate-800 hover:text-brand-primary text-left">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground font-medium leading-relaxed italic">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-125 w-full contrast-125 opacity-80 hover:opacity-100 transition-all duration-1000 border-t border-slate-100">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.471550974394!2d106.82424097485813!3d10.85170328930113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752718ef0e9fd5%3A0x62831526487e49e2!2zMTI0LzE2IFbDtCBWxINuIEjDoXQsIExvbmcgVHLGsOG7nW5nLCBRdeG6rW4gOSwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1721724213961!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    className="border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </section>
        </div>
    );
}
