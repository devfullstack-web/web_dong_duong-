import type { LucideIcon } from 'lucide-react';

interface SiteEmptyStateProps {
    icon: LucideIcon;
    title: string;
}

export function SiteEmptyState({ icon: Icon, title }: SiteEmptyStateProps) {
    return (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-lg">
            <Icon size={48} className="mx-auto mb-4 text-slate-200" />
            <h3 className="text-sm font-black text-slate-400 uppercase">{title}</h3>
        </div>
    );
}
