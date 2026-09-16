'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { type SolutionData } from '../solutions-data';

export default function SolutionDetailClient({ data }: { data: SolutionData }) {
    const locale = useLocale();
    const isZh = locale === 'zh';
    const isEn = locale === 'en';

    const headerTitle = (isZh && data.headerTitle_zh) ? data.headerTitle_zh : (isEn && data.headerTitle_en) ? data.headerTitle_en : data.headerTitle;
    const brand = (isZh && data.brand_zh) ? data.brand_zh : (isEn && data.brand_en) ? data.brand_en : data.brand;
    const title = (isZh && data.title_zh) ? data.title_zh : (isEn && data.title_en) ? data.title_en : data.title;
    const description = (isZh && data.description_zh) ? data.description_zh : (isEn && data.description_en) ? data.description_en : data.description;
    const intro = (isZh && data.intro_zh) ? data.intro_zh : (isEn && data.intro_en) ? data.intro_en : data.intro;

    const coreTitle = (isZh && data.core?.title_zh) ? data.core.title_zh : (isEn && data.core?.title_en) ? data.core.title_en : data.core?.title;
    const coreIntro = (isZh && data.core?.intro_zh) ? data.core.intro_zh : (isEn && data.core?.intro_en) ? data.core.intro_en : data.core?.intro;

    const benefitsTitle = (isZh && data.benefits?.title_zh) ? data.benefits.title_zh : (isEn && data.benefits?.title_en) ? data.benefits.title_en : data.benefits.title;
    const benefitsIntro = (isZh && data.benefits?.intro_zh) ? data.benefits.intro_zh : (isEn && data.benefits?.intro_en) ? data.benefits.intro_en : data.benefits.intro;
    const benefitsOutro = (isZh && data.benefits?.outro_zh) ? data.benefits.outro_zh : (isEn && data.benefits?.outro_en) ? data.benefits.outro_en : data.benefits.outro;

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 antialiased">
            {/* Header / Hero Strip */}
            <header className="bg-[#0A2958] pt-32 pb-12 text-center text-white relative">
                <div className="container mx-auto px-4 space-y-4 max-w-[1340px]">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider leading-tight text-[#E5B869]">
                        {headerTitle}
                    </h1>
                    <nav className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white/80 uppercase tracking-wider">
                        <Link href="/" className="hover:text-[#E5B869] transition-colors">
                            {isZh ? '首页' : isEn ? 'Home' : 'Trang chủ'}
                        </Link>
                        <span>/</span>
                        <span className="text-[#E5B869] font-black">
                            {isZh ? '解决方案' : isEn ? 'Solutions' : 'Giải pháp'}
                        </span>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto px-4 sm:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24 max-w-[1240px]">
                {/* 1. Overview Section */}
                <article className="space-y-10">
                    {/* Brand Heading with Gold Bar */}
                    <div className="flex gap-4 sm:gap-6 border-l-[6px] border-[#E5B869] pl-6 py-1">
                        <div className="space-y-2">
                            <h2 className="text-base sm:text-lg font-black text-[#E5B869] uppercase tracking-widest">
                                {brand}
                            </h2>
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2958] uppercase tracking-tight">
                                {title}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <p className="text-base sm:text-xl text-slate-800 leading-relaxed text-justify font-medium">
                            {description}
                        </p>

                        <div className="relative aspect-video w-full overflow-hidden shadow-2xl ring-1 ring-slate-100 rounded-xl">
                            <Image
                                src={data.image1}
                                alt={title}
                                fill
                                unoptimized
                                className="object-cover"
                                priority
                            />
                        </div>

                        <p className="text-base sm:text-xl text-slate-800 leading-relaxed text-justify font-medium">
                            {intro}
                        </p>
                    </div>
                </article>

                {/* 2. Core Components Section */}
                <section className="space-y-10 sm:space-y-12">
                    <div className="text-center">
                        <h4 className="text-2xl sm:text-3xl font-black text-[#0A2958] uppercase tracking-[0.15em]">
                            {coreTitle}
                        </h4>
                        <div className="h-1.5 w-24 bg-[#E5B869] mx-auto mt-3 rounded-full" />
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-xl text-slate-800 leading-relaxed text-justify font-medium">
                            {coreIntro}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.core?.items?.map((item, idx) => {
                                const itemTitle = (isZh && item.title_zh) ? item.title_zh : (isEn && item.title_en) ? item.title_en : item.title;
                                const itemDesc = (isZh && item.desc_zh) ? item.desc_zh : (isEn && item.desc_en) ? item.desc_en : item.desc;
                                return (
                                    <div key={idx} className="p-6 sm:p-8 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 hover:border-[#E5B869] hover:shadow-md transition-all">
                                        <h5 className="font-extrabold text-[#0A2958] uppercase tracking-tight text-lg sm:text-xl">
                                            {itemTitle}
                                        </h5>
                                        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                                            {itemDesc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative aspect-video lg:aspect-[21/9] w-full mt-10 overflow-hidden shadow-2xl rounded-xl">
                        <Image
                            src={data.image2}
                            alt="Deployment Visual"
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    </div>
                </section>

                {/* 3. Value Proposition Section */}
                <section className="space-y-10 sm:space-y-12 pb-20">
                    <div className="text-center">
                        <h4 className="text-2xl sm:text-3xl font-black text-[#0A2958] uppercase tracking-[0.15em]">
                            {benefitsTitle}
                        </h4>
                        <div className="h-1.5 w-24 bg-[#E5B869] mx-auto mt-3 rounded-full" />
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-xl text-slate-800 leading-relaxed text-justify font-medium">
                            {benefitsIntro}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.benefits?.items?.map((item, idx) => {
                                const itemTitle = (isZh && item.title_zh) ? item.title_zh : (isEn && item.title_en) ? item.title_en : item.title;
                                const itemDesc = (isZh && item.desc_zh) ? item.desc_zh : (isEn && item.desc_en) ? item.desc_en : item.desc;
                                return (
                                    <div key={idx} className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-xl space-y-3 hover:border-[#E5B869] hover:shadow-md transition-all">
                                        <h5 className="font-extrabold text-[#0A2958] uppercase tracking-tight text-lg sm:text-xl">
                                            {itemTitle}
                                        </h5>
                                        <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
                                            {itemDesc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-base sm:text-xl text-slate-800 leading-relaxed text-justify font-medium pt-8 border-t border-slate-200">
                            {benefitsOutro}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
