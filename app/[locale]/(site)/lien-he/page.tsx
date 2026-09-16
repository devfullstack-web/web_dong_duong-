'use client';

import { Phone, Mail, MapPin, Send, Facebook, Linkedin, Youtube, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageBanner } from '@/components/site/PageBanner';
import TechSvgBackground from '@/components/ui/TechSvgBackground';
import { useSiteInfo } from '@/components/providers/site-info-provider';
import { useContactForm } from '@/hooks/use-contact-form';

export default function ContactPage() {
    const COMPANY_INFO = useSiteInfo();
    const t = useTranslations('Contact');
    const tc = useTranslations('ContactForm');
    const { formData, isSubmitting, handleChange, handleSubmit } = useContactForm({
        requiredFields: ['name', 'phone', 'email', 'address', 'message'],
        messages: {
            required: tc('errors.required'),
            success: tc('success'),
            generalError: tc('errors.general'),
        },
    });

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('headerTitle')} accent={t('headerTitleAccent')} />

            {/* Contact Grid */}
            <section className="relative py-16 overflow-hidden">
                {/* Architectural Ceramic & Engineering Facility Portal Background */}
                <TechSvgBackground variant="tiles-porcelain" glowColor="amber" className="absolute inset-0 z-0" />

                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Info Column */}
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                                    {t('infoTitle')}
                                </h2>
                                <p className="text-slate-700 font-medium max-w-md text-base sm:text-lg leading-relaxed">
                                    {t('infoDesc')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    {
                                        icon: Phone,
                                        label: t('labels.sales'),
                                        value: COMPANY_INFO.hotline,
                                        isPhone: true,
                                    },
                                    {
                                        icon: Mail,
                                        label: t('labels.office'),
                                        value: COMPANY_INFO.email,
                                        isEmail: true,
                                    },
                                    {
                                        icon: MapPin,
                                        label: t('labels.headquarters'),
                                        value: COMPANY_INFO.address,
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} className="text-[#C29236]" />
                                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500">
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                                            {item.isPhone ? (
                                                <a href={`tel:${COMPANY_INFO.hotlineRaw}`} className="text-xl sm:text-2xl font-black text-[#0A2958] hover:text-amber-600 transition-colors">
                                                    {item.value}
                                                </a>
                                            ) : item.isEmail ? (
                                                <a href={`mailto:${item.value}`} className="hover:text-amber-600 transition-colors">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <span>{item.value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                {[
                                    { Icon: Facebook, href: COMPANY_INFO.social.facebook },
                                    { Icon: Linkedin, href: COMPANY_INFO.social.linkedin },
                                    { Icon: Youtube, href: COMPANY_INFO.social.youtube },
                                ].map(({ Icon, href }, i) => (
                                    <a
                                        key={i}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-12 w-12 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-[#0A2958] hover:text-[#E5B869] transition-all"
                                    >
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="bg-slate-50 p-8 sm:p-12 rounded-2xl border border-slate-200/80">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-700">
                                            {tc('labels.name')}
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white rounded-xl px-4 py-3.5 text-base sm:text-lg font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-700">
                                            {tc('labels.phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white rounded-xl px-4 py-3.5 text-base sm:text-lg font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-700">
                                            {tc('labels.email')}
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white rounded-xl px-4 py-3.5 text-base sm:text-lg font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-700">
                                            {tc('labels.address')}
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white rounded-xl px-4 py-3.5 text-base sm:text-lg font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-700">
                                        {tc('labels.message')}
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="w-full bg-white rounded-xl px-4 py-3.5 text-base sm:text-lg font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-3 bg-[#0A2958] hover:bg-[#123B7A] py-4 rounded-xl text-base sm:text-lg font-black uppercase tracking-wider text-white transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            {t('submit')} <Send size={20} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="h-96 w-full opacity-70 hover:opacity-100 transition-opacity duration-700">
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
