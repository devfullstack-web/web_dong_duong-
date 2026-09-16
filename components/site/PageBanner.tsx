import TechSvgBackground from '@/components/ui/TechSvgBackground';

interface PageBannerProps {
    title: string;
    accent?: string;
}

export function PageBanner({ title, accent }: PageBannerProps) {
    return (
        <section className="relative pt-36 pb-8 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-sky-50/30 overflow-hidden">
            {/* Modern E-Commerce Portal Dot Matrix & Corner HUD Ambient Glow */}
            <TechSvgBackground variant="ecommerce-portal" glowColor="blue" className="absolute inset-0 z-0" />

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-3.5">
                    <div className="w-2 h-9 sm:h-11 bg-gradient-to-b from-[#E5B869] to-[#D49B45] rounded-full shrink-0 shadow-sm" />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">
                        {title}
                        {accent && <span className="text-brand-primary"> {accent}</span>}
                    </h1>
                </div>
            </div>
        </section>
    );
}
