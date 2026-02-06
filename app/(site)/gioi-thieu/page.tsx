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
import { COMPANY_INFO } from '@/constants/site-info';
import { PARTNERS } from '@/components/home/Partners';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white pt-24">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[550px] w-full bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary overflow-hidden">
                <Image
                    src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                    alt="Introduce Background"
                    fill
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
                            GIẢI PHÁP CÔNG NGHIỆP THÔNG MINH
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter uppercase drop-shadow-lg"
                        >
                            SÀI GÒN VALVE <br />
                            <span className="text-brand-accent">LẬP TINH CÔNG NGHỆ</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl leading-relaxed italic border-l-4 border-brand-accent pl-8"
                        >
                            "Giải pháp đáng tin cậy cho cấp thoát nước và xử lý nước thải từ SG-VAL.
                            Kiến tạo hạ tầng ngành nước hiện đại và bền vững."
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
                                    CHÚNG TÔI LÀ AI?
                                </div>
                                <h2 className="text-4xl font-bold text-brand-secondary uppercase tracking-tight">
                                    VỀ CHÚNG TÔI
                                </h2>
                                <div className="h-1.5 w-24 bg-brand-primary"></div>
                            </div>

                            <div className="space-y-8 text-muted-foreground leading-relaxed font-medium">
                                <p className="text-lg text-slate-700 font-bold">
                                    Sài Gòn Valve tự hào là một trong những doanh nghiệp tiên phong
                                    trong lĩnh vực cung cấp các giải pháp công nghiệp chất lượng cao
                                    tại Việt Nam.
                                </p>
                                <p>
                                    Mong muốn mang đến các giải pháp thông minh giúp kiểm soát dòng
                                    chảy bằng công nghệ hiện đại cho thị trường ngành nước. Bằng
                                    kinh nghiệm và nhiệt huyết, SÀI GÒN VALVE luôn mang đến cho
                                    khách hàng những giải pháp tối ưu nhất cho các công trình cấp
                                    thoát nước và xử lý nước thải.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-slate-50 p-10 border-t-4 border-brand-primary shadow-sm space-y-4"
                                >
                                    <Rocket className="text-brand-primary" size={32} />
                                    <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                        SỨ MỆNH
                                    </h4>
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                        Kiểm soát dòng chảy bằng công nghệ hiện đại. Cung cấp giải
                                        pháp tối ưu cho hạ tầng nước đô thị.
                                    </p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-brand-secondary p-10 border-t-4 border-brand-accent shadow-sm space-y-4 text-white"
                                >
                                    <Eye className="text-brand-accent" size={32} />
                                    <h4 className="text-lg font-black uppercase tracking-tight text-white">
                                        TẦM NHÌN
                                    </h4>
                                    <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                        Trở thành công ty đi đầu trong việc cung cấp các giải pháp
                                        kiểm soát dòng chảy trong nước và quốc tế.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative aspect-square shadow-2xl overflow-hidden group">
                                <Image
                                    src="https://saigonvalve.vn/uploads/files/2024/09/13/Standee-h-i-ngh-2407-40-x-140-cm-.png"
                                    alt="Sài Gòn Valve Profile"
                                    fill
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
                            TRIẾT LÝ VẬN HÀNH
                        </div>
                        <h2 className="text-4xl font-bold text-brand-secondary uppercase tracking-tight">
                            GIÁ TRỊ CỐT LÕI
                        </h2>
                        <div className="mx-auto h-1 w-20 bg-brand-primary"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: 'KHÁCH HÀNG LÀ TRỌNG TÂM',
                                desc: 'Luôn cam kết tạo ra những sản phẩm phù hợp với từng đối tượng khách hàng. Đặt bản thân vào vị trí khách hàng để phục vụ.',
                            },
                            {
                                icon: Target,
                                title: 'ĐỒNG HÀNH BỀN VỮNG',
                                desc: 'Đồng hành hỗ trợ khách hàng trước, trong và sau quá trình lắp đặt, vận hành hệ thống một cách tận tâm nhất.',
                            },
                            {
                                icon: Users,
                                title: 'BẢO MẬT & TIN CẬY',
                                desc: 'Tuân thủ nghiêm ngặt nguyên tắc hợp tác và bảo mật thông tin để khách hàng an tâm tuyệt đối khi hợp tác.',
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
                                THẾ MẠNH CẠNH TRANH
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-brand-secondary uppercase tracking-tight leading-none">
                                Sản phẩm <br />
                                <span className="text-brand-primary">Chủ lực</span>
                            </h2>
                        </div>
                        <p className="max-w-md text-muted-foreground font-medium text-sm">
                            Chúng tôi cung cấp hệ thống sản phẩm đồng bộ từ van cơ học đến bộ điều
                            khiển thông minh và giám sát số hóa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    01
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    VAN CÔNG NGHIỆP
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                <strong>Nhà phân phối độc quyền</strong> thương hiệu{' '}
                                <strong>Van OKM - Nhật Bản</strong>. Cung cấp đa dạng van cổng, van
                                bướm, van xả khí, van một chiều... thiết kế cho môi trường khắc
                                nghiệt.
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    THƯƠNG HIỆU: OKM JAPAN
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    02
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    ACTUATOR
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Cung cấp độc quyền <strong>Actuator NOAH - Hàn Quốc</strong>. Tích
                                hợp tủ điều khiển thông minh, cho phép giám sát và vận hành van từ
                                xa thông qua ứng dụng di động Internet.
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    THƯƠNG HIỆU: NOAH KOREA
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-16 space-y-8 hover:z-10 hover:shadow-2xl transition-all group">
                            <div className="space-y-4">
                                <div className="text-4xl font-black text-slate-100 group-hover:text-brand-primary/10 transition-colors">
                                    03
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase">
                                    GIẢI PHÁP IOT
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                Thiết bị Datalogger, quan trắc chất lượng nước và{' '}
                                <strong>Van giảm áp đa hằng số</strong>. Giải pháp tự động điều
                                chỉnh áp suất nước giúp tối ưu hóa tài nguyên nước.
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                    THIẾT BỊ SỐ HÓA
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
                            CÔNG NGHỆ ĐIỀU KHIỂN
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter leading-none">
                            HỆ THỐNG <span className="text-brand-accent">SCADA</span>
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
                            Giải pháp quản lý, giám sát và điều khiển tập trung giúp tối ưu hóa hiệu
                            suất vận hành mạng lưới cấp nước đô thị.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Mở ở áp suất cao',
                                desc: 'Điều khiển van/bơm tăng áp tự động khi áp suất hệ thống đạt ngưỡng cài đặt để duy trì lưu lượng.',
                            },
                            {
                                title: 'Giám sát 3G/4G',
                                desc: 'Thu thập dữ liệu và truyền thông tin thời gian thực đến trung tâm điều khiển qua hạ tầng mạng di động.',
                            },
                            {
                                title: 'Mở ở áp suất thấp',
                                desc: 'Cấu hình tự động mở van/bơm khi áp suất nước giảm, đảm bảo cung cấp nước liên tục 24/7.',
                            },
                            {
                                title: 'Cài đặt theo yêu cầu',
                                desc: 'Linh hoạt xác định các điểm đo và lập trình SCADA theo nhu cầu thực tế của từng khách hàng.',
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
                            ỨNG DỤNG NGÀNH
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Waves,
                                title: 'CÔNG TY CẤP THOÁT NƯỚC',
                                desc: 'Tối ưu quản lý, giảm thất thoát và tăng hiệu quả xử lý nước thải.',
                            },
                            {
                                icon: Factory,
                                title: 'NHÀ MÁY CÔNG NGHIỆP',
                                desc: 'Nâng cao năng suất vận hành thông qua tự động hóa và quản lý từ xa.',
                            },
                            {
                                icon: Building2,
                                title: 'DỰ ÁN XÂY DỰNG',
                                desc: 'Giải pháp van và điều khiển cho các công trình quy mô lớn, hạ tầng đô thị.',
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
                                    Đối tác & Chứng nhận
                                </h2>
                                <p className="text-muted-foreground font-medium italic border-l-4 border-brand-primary pl-6">
                                    "Sài Gòn Valve cam kết minh bạch về nguồn gốc và chất lượng
                                    thiết bị với đầy đủ giấy tờ pháp lý."
                                </p>
                            </div>
                            <div className="space-y-6">
                                {[
                                    'Chứng nhận đại lý độc quyền OKM Valve (Nhật Bản)',
                                    'Chứng nhận đại lý độc quyền Noah Actuator (Hàn Quốc)',
                                    'Đối tác cung cấp hạ tầng nước thông minh hàng đầu',
                                    'Hệ thống quản lý chất lượng đạt chuẩn quốc tế',
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
                                HỢP TÁC CHIẾN LƯỢC
                            </h2>
                            <p className="text-base text-slate-300 font-medium leading-relaxed">
                                Hãy liên hệ với chúng tôi ngay hôm nay để khám phá thêm về các sản
                                phẩm và giải pháp tiên tiến mà chúng tôi cung cấp cho doanh nghiệp
                                của bạn.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group">
                                    <div className="h-10 w-10 bg-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-brand-primary transition-all">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            Hotline Tư vấn
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
                                            Email Liên hệ
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
                                LIÊN HỆ NGAY <MoveRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
