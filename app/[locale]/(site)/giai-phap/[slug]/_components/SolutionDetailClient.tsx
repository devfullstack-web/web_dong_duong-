'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SolutionDetailClient({ data }: { data: Record<string, unknown> }) {
    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900 antialiased">
            {/* Header / Hero Strip */}
            <header className="bg-brand-primary pt-32  text-center text-white relative">
                <div className="container mx-auto px-4 py-10  space-y-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-widest leading-tight">
                        {data.headerTitle}
                    </h1>
                    <nav className="flex items-center justify-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider">
                        <Link href="/" className="hover:text-brand-accent transition-colors">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <span className="text-brand-accent font-black">Giải pháp</span>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto  px-4 sm:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
                {/* 1. Overview Section */}
                <article className="space-y-10">
                    {/* Brand Heading with Gold Bar */}
                    <div className="flex gap-4 sm:gap-6 border-l-[6px] border-brand-accent pl-6 py-1">
                        <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary uppercase tracking-tight leading-none">
                                {data.brand}
                            </h2>
                            <h3 className="text-xl sm:text-2xl font-black text-brand-secondary uppercase tracking-tight">
                                {data.title}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.description}
                        </p>

                        <div className="relative aspect-video w-full overflow-hidden shadow-2xl ring-1 ring-slate-100 rounded-sm">
                            <Image
                                src={data.image1}
                                alt={data.title}
                                fill
                                unoptimized
                                className="object-cover"
                                priority
                            />
                        </div>

                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.intro}
                        </p>
                    </div>
                </article>

                {/* 2. Core Components Section */}
                <section className="space-y-10 sm:space-y-12">
                    <div className="text-center">
                        <h4 className="text-xl sm:text-2xl font-black text-brand-accent uppercase tracking-[0.25em]">
                            {data.core.title}
                        </h4>
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.core.intro}
                        </p>

                        <div className="space-y-6">
                            {((data.core as Record<string, unknown>).items as unknown as Array<{title: string; desc: string}>).map((item: {title: string; desc: string}, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                                        <strong className="font-extrabold text-slate-900 uppercase tracking-tight">
                                            {item.title}:
                                        </strong>{' '}
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-video lg:aspect-21/9 w-full mt-10 overflow-hidden shadow-2xl rounded-sm">
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
                        <h4 className="text-xl sm:text-2xl font-black text-brand-accent uppercase tracking-[0.25em]">
                            {data.benefits.title}
                        </h4>
                    </div>

                    <div className="space-y-8">
                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                            {data.benefits.intro}
                        </p>

                        <div className="space-y-6">
                            {((data.benefits as Record<string, unknown>).items as unknown as Array<{title: string; desc: string}>).map((item: {title: string; desc: string}, idx: number) => (
                                <div key={idx} className="space-y-1">
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium">
                                        <strong className="font-extrabold text-slate-900 uppercase tracking-tight">
                                            {item.title}:
                                        </strong>{' '}
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-base sm:text-lg text-slate-700 leading-relaxed text-justify font-medium pt-12">
                            {data.benefits.outro}
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}
