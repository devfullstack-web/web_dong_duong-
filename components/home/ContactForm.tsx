'use client';

import { useState } from 'react';
import {
    Phone,
    Mail,
    MapPin,
    Send,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { COMPANY_INFO } from '@/constants/site-info';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
    const t = useTranslations('ContactForm');
    const tCompany = useTranslations('Company');
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
        if (!formData.name || !formData.phone || !formData.email || !formData.message) {
            toast.error(t('errors.required'));
            return;
        }

        setIsSubmitting(true);
        try {
            await $api.post(API_ROUTES.CONTACTS, formData);
            toast.success(t('success'));
            setFormData({ name: '', phone: '', email: '', address: '', message: '' });
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const message = axiosError.response?.data?.message || t('errors.general');
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
        <section className="bg-white py-12 lg:py-16">
            <div className="container mx-auto px-4 lg:px-8">
                {/* 
                    Full Aligned Card: 
                    Matches Header width, no border radius, sharp and professional.
                */}
                <div className="bg-slate-50 border border-slate-100">
                    <div className="grid grid-cols-1 lg:grid-cols-5 items-stretch">
                        
                        {/* Left: Quick Info (Sharp Style) */}
                        <div className="lg:col-span-2 bg-brand-primary p-8 lg:p-12 text-white flex flex-col justify-between space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tight leading-[1.2]">
                                    {t('title', { defaultValue: 'Liên Hệ' })} <br />
                                    <span className="text-brand-accent">{t('consultationTitle')}</span>
                                </h2>
                                <p className="text-[11px] text-white/60 font-medium leading-relaxed max-w-xs">
                                    {t('consultationDesc')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Phone, label: COMPANY_INFO.phone },
                                    { icon: Mail, label: COMPANY_INFO.email },
                                    { icon: MapPin, label: tCompany('address') },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                            <item.icon size={16} className="text-brand-accent" />
                                        </div>
                                        <div className="text-[11px] font-bold tracking-wide leading-relaxed pt-1">
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Sharp Form */}
                        <div className="lg:col-span-3 p-8 lg:p-12 bg-white">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.name')}
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50 border-none px-4 py-3.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                                            placeholder={t('placeholders.name')}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {t('labels.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50 border-none px-4 py-3.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                                            placeholder={t('placeholders.phone')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t('labels.email')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-50 border-none px-4 py-3.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                                        placeholder={t('placeholders.email')}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        {t('labels.message')}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full bg-slate-50 border-none px-4 py-3.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
                                        placeholder={t('placeholders.message')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-3 bg-brand-primary py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/5 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            {t('submitting')} <Loader2 size={16} className="animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            {t('submit')} <Send size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
