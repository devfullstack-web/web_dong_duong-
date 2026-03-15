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
import { useTranslations } from 'next-intl';

export default function ContactForm() {
    const t = useTranslations('ContactForm');
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
            toast.error(t('errors.required'));
            return;
        }

        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.CONTACTS, formData);
            toast.success(t('success'));
            setFormData({
                name: '',
                phone: '',
                email: '',
                address: '',
                message: '',
            });
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || t('errors.general');
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
                                {t('consultationTitle')}
                            </h2>
                            <p className="text-base text-slate-300 font-medium leading-relaxed max-w-lg">
                                {t('consultationDesc')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: Phone,
                                    label: t('hotlineLabel'),
                                    value: COMPANY_INFO.phone,
                                    sub: t('hotlineSub'),
                                },
                                {
                                    icon: Mail,
                                    label: t('emailLabel'),
                                    value: COMPANY_INFO.email,
                                    sub: t('emailSub'),
                                },
                                {
                                    icon: MapPin,
                                    label: t('addressLabel'),
                                    value: COMPANY_INFO.address,
                                    sub: t('addressSub'),
                                },
                                {
                                    icon: MessageSquare,
                                    label: t('zaloLabel'),
                                    value: COMPANY_INFO.hotline,
                                    sub: t('zaloSub'),
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
                                    {t('title')}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {t('subtitle')}
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.name')}
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder={t('placeholders.name')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder={t('placeholders.phone')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.email')}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder={t('placeholders.email')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.address')}
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors bg-transparent"
                                            placeholder={t('placeholders.address')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t('labels.message')}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full border-b-2 border-slate-200 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-primary transition-colors resize-none bg-transparent"
                                        placeholder={t('placeholders.message')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-4 bg-brand-primary py-5 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            {t('submitting')}{' '}
                                            <Loader2 size={16} className="animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            {t('submit')} <Send size={16} />
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
