'use client';

import { motion } from 'motion/react';
import {
    ShieldCheck,
    Target,
    Users,
    MoveRight,
    CheckCircle2,
    Rocket,
    Eye,
    Globe2,
    Mail,
    Phone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { COMPANY_INFO } from '@/constants/site-info';
import { PARTNERS } from '@/components/home/Partners';
import { PageBanner } from '@/components/site/PageBanner';

export default function AboutPage() {
    const t = useTranslations('About');
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageBanner title={t('hero.title')} accent={t('hero.titleAccent')} />

            {/* Intro Section - Mission & Vision */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <div className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                    {t('intro.who')}
                                </div>
                                <h2 className="text-4xl font-bold text-brand-secondary uppercase tracking-tight">
                                    {t('intro.title')}
                                </h2>
                                <div className="h-1.5 w-24 bg-brand-primary"></div>
                            </div>

                            <div className="space-y-8 text-muted-foreground leading-relaxed font-medium">
                                <p className="text-lg text-slate-700 font-bold">
                                    {t('intro.content1')}
                                </p>
                                <p>{t('intro.content2')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 p-10 border-t-4 border-brand-primary shadow-sm space-y-4"
                                >
                                    <Rocket className="text-brand-primary" size={32} />
                                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                        {t('intro.mission.title')}
                                    </h4>
                                    <p className="text-base font-medium text-slate-600 leading-relaxed">
                                        {t('intro.mission.desc')}
                                    </p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-brand-secondary p-10 border-t-4 border-brand-accent shadow-sm space-y-4 text-white"
                                >
                                    <Eye className="text-brand-accent" size={32} />
                                    <h4 className="text-lg font-black uppercase tracking-tight text-white">
                                        {t('intro.vision.title')}
                                    </h4>
                                    <p className="text-base font-medium text-slate-300 leading-relaxed">
                                        {t('intro.vision.desc')}
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative aspect-square shadow-2xl overflow-hidden group">
                                <Image
                                    src="/uploads/images/2026/03/14/1773475510639-tmuwuw.png"
                                    alt="Sài Gòn Valve Profile"
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 border-8 border-brand-primary/10 -z-10"></div>
                            <div className="absolute -top-10 -left-10 h-64 w-64 bg-brand-primary/5 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-20 space-y-6">
                        <div className="text-xs font-black uppercase tracking-wider text-brand-primary">
                            {t('values.badge')}
                        </div>
                        <h2 className="text-4xl font-bold text-brand-secondary uppercase tracking-tight">
                            {t('values.title')}
                        </h2>
                        <div className="mx-auto h-1 w-20 bg-brand-primary"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: t('values.items.0.title'),
                                desc: t('values.items.0.desc'),
                            },
                            {
                                icon: Target,
                                title: t('values.items.1.title'),
                                desc: t('values.items.1.desc'),
                            },
                            {
                                icon: Users,
                                title: t('values.items.2.title'),
                                desc: t('values.items.2.desc'),
                            },
                        ].map((val, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-12 space-y-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
                            >
                                <div className="h-14 w-14 bg-slate-50 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                    <val.icon size={28} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                                    {val.title}
                                </h3>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                                    {val.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Business Pillars */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
                        <div className="space-y-4 text-left">
                            <div className="text-xs font-black uppercase tracking-wider text-brand-primary">
                                {t('pillars.badge')}
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-brand-secondary uppercase tracking-tight leading-none">
                                {t('pillars.title')} <br />
                                <span className="text-brand-primary">
                                    {t('pillars.titleAccent')}
                                </span>
                            </h2>
                        </div>
                        <p className="max-w-md text-muted-foreground font-medium text-sm">
                            {t('pillars.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    {t('pillars.items.0.tag')}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    {t('pillars.items.0.title')}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {t('pillars.items.0.desc')}
                            </p>
                        </div>

                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    {t('pillars.items.1.tag')}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    {t('pillars.items.1.title')}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {t('pillars.items.1.desc')}
                            </p>
                        </div>

                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    {t('pillars.items.2.tag')}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    {t('pillars.items.2.title')}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {t('pillars.items.2.desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SCADA Features */}
            <section className="py-24 bg-brand-primary text-white overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-3xl"></div>
                <div className="absolute top-20 left-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>
                <Globe2
                    size={400}
                    className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none"
                />
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="max-w-4xl mb-20 space-y-6">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent">
                            {t('scada.badge')}
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter leading-none">
                            {t('scada.title')}{' '}
                            <span className="text-brand-accent">{t('scada.titleAccent')}</span>
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
                            {t('scada.desc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: t('scada.items.0.title'),
                                desc: t('scada.items.0.desc'),
                            },
                            {
                                title: t('scada.items.1.title'),
                                desc: t('scada.items.1.desc'),
                            },
                            {
                                title: t('scada.items.2.title'),
                                desc: t('scada.items.2.desc'),
                            },
                            {
                                title: t('scada.items.3.title'),
                                desc: t('scada.items.3.desc'),
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="space-y-4 p-8 bg-white/5 border border-white/10 hover:bg-brand-primary transition-all duration-500 group"
                            >
                                <div className="h-1 text-brand-accent group-hover:bg-white transition-colors mb-4">
                                    <div className="h-full w-12 bg-current" />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight group-hover:text-white">
                                    {feature.title}
                                </h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium group-hover:text-slate-100">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications & Partners */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-brand-secondary uppercase tracking-tight">
                                    {t('certs.title')}
                                </h2>
                                <p className="text-muted-foreground font-medium italic border-l-4 border-brand-primary pl-6">
                                    {t('certs.quote')}
                                </p>
                            </div>
                            <div className="space-y-6">
                                {[
                                    t('certs.items.0'),
                                    t('certs.items.1'),
                                    t('certs.items.2'),
                                    t('certs.items.3'),
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 text-sm font-bold text-slate-700"
                                    >
                                        <CheckCircle2
                                            size={18}
                                            className="text-brand-primary shrink-0"
                                        />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {PARTNERS.map((partner, i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-white border border-slate-100 flex items-center justify-center p-6 hover:shadow-lg hover:border-brand-primary/30 transition-all group"
                                >
                                    <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300">
                                        <Image
                                            src={partner.logo}
                                            alt={partner.name}
                                            fill
                                            unoptimized
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-brand-primary relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-secondary/20 rounded-full blur-3xl"></div>
                <div className="absolute top-10 left-20 w-48 h-48 bg-brand-accent/10 rounded-full blur-2xl"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <div className="text-white space-y-8">
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-none text-brand-accent">
                                {t('cta.title')}
                            </h2>
                            <p className="text-base text-slate-300 font-medium leading-relaxed">
                                {t('cta.desc')}
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 bg-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-brand-primary transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {t('cta.hotline')}
                                        </div>
                                        <a
                                            href={`tel:${COMPANY_INFO.phoneRaw}`}
                                            className="text-sm sm:text-base font-bold hover:text-brand-accent transition-colors"
                                        >
                                            {COMPANY_INFO.phone}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 bg-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-brand-primary transition-all">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {t('cta.email')}
                                        </div>
                                        <a
                                            href={`mailto:${COMPANY_INFO.email}`}
                                            className="text-sm sm:text-base font-bold hover:text-brand-accent transition-colors"
                                        >
                                            {COMPANY_INFO.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <Link
                                href="/lien-he"
                                className="inline-flex items-center gap-4 px-12 py-5 bg-brand-accent text-brand-primary font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 hover:bg-white transition-all transform hover:-translate-y-1 hover:scale-105"
                            >
                                {t('cta.btnText')} <MoveRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
