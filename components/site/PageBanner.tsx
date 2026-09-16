interface PageBannerProps {
    title: string;
    accent?: string;
}

export function PageBanner({ title, accent }: PageBannerProps) {
    return (
        <section className="pt-36 pb-6 border-b border-slate-100">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-3.5">
                    <div className="w-1.5 h-8 sm:h-10 bg-brand-primary rounded-full shrink-0" />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">
                        {title}
                        {accent && <span className="text-brand-primary"> {accent}</span>}
                    </h1>
                </div>
            </div>
        </section>
    );
}
