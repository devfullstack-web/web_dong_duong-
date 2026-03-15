'use client';

import { motion } from 'motion/react';
import {
    ShieldCheck,
    Target,
    Users,
    Award,
    MoveRight,
    CheckCircle2,
    History,
    Globe2,
    Briefcase,
    Rocket,
    Eye,
    Cpu,
    Waves,
    Factory,
    Building2,
    Mail,
    Phone,
    Link2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { COMPANY_INFO } from '@/constants/site-info';
import { PARTNERS } from '@/components/home/Partners';

export default function AboutPage() {
    const t = useTranslations('About');
    return (
        <div className="flex flex-col min-h-screen bg-white pt-24">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[550px] w-full bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <Image
                    src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                    alt="Introduce Background"
                    fill
                    unoptimized
                    className="object-cover opacity-40 brightness-110"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/60 via-brand-secondary/40 to-brand-primary/90"></div>
                <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex flex-col justify-center">
                    <div className="max-w-4xl space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-3 border-brand-accent text-brand-accent border bg-brand-accent/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                            {t('hero.badge')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter uppercase drop-shadow-lg"
                        >
                            {t('hero.title')} <br />
                            <span className="text-brand-accent">{t('hero.titleAccent')}</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl leading-relaxed italic border-l-4 border-brand-accent pl-8"
                        >
                            {t('hero.desc')}
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Intro Section - Mission & Vision */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
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
                                <p>
                                    {t('intro.content2')}
                                </p>
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
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
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
                                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
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
                            {/* Decorative Elements */}
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
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
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

            {/* Business Pillars - Products */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
                        <div className="space-y-4 text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                {t('pillars.badge')}
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-brand-secondary uppercase tracking-tight leading-none">
                                {t('pillars.title')} <br />
                                <span className="text-brand-primary">{t('pillars.titleAccent')}</span>
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
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    {t('pillars.items.0.footer')}
                                </div>
                            </div>
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
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    {t('pillars.items.1.footer')}
                                </div>
                            </div>
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
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    {t('pillars.items.2.footer')}
                                </div>
                            </div>
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
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">
                            {t('scada.badge')}
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter leading-none">
                            {t('scada.title')} <span className="text-brand-accent">{t('scada.titleAccent')}</span>
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

            {/* Applications Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black uppercase tracking-tight text-brand-secondary">
                            {t('applications.title')}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Waves,
                                title: t('applications.items.0.title'),
                                desc: t('applications.items.0.desc'),
                            },
                            {
                                icon: Factory,
                                title: t('applications.items.1.title'),
                                desc: t('applications.items.1.desc'),
                            },
                            {
                                icon: Building2,
                                title: t('applications.items.2.title'),
                                desc: t('applications.items.2.desc'),
                            },
                        ].map((app, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center space-y-4"
                            >
                                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary">
                                    <app.icon size={32} />
                                </div>
                                <h4 className="text-sm font-black uppercase text-slate-900">
                                    {app.title}
                                </h4>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-xs">
                                    {app.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications & Partners - Redesigned */}
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
                                            quality={100}
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                            className="object-contain"
                                            style={{ imageRendering: 'auto' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Updated with Contact Details */}
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
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {t('cta.hotline')}
                                        </div>
                                        <a
                                            href={`tel:${COMPANY_INFO.phoneRaw}`}
                                            className="text-sm font-bold hover:text-brand-accent transition-colors"
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
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {t('cta.email')}
                                        </div>
                                        <a
                                            href={`mailto:${COMPANY_INFO.email}`}
                                            className="text-sm font-bold hover:text-brand-accent transition-colors"
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
