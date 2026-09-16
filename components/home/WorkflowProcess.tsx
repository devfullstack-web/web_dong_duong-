'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import {
    Search,
    Handshake,
    FileCheck2,
    Globe2,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
    Search,
    search: Search,
    Handshake,
    handshake: Handshake,
    FileCheck2,
    filecheck2: FileCheck2,
    filecheck: FileCheck2,
    Globe2,
    globe2: Globe2,
    globe: Globe2,
    ShieldCheck,
    shieldcheck: ShieldCheck,
    shield: ShieldCheck,
};

export interface WorkflowStepItem {
    num: number;
    title: string;
    icon: string;
}

interface Props {
    steps?: WorkflowStepItem[];
}

import { useTranslations } from 'next-intl';

export default function WorkflowProcess({ steps = [] }: Props) {
    const t = useTranslations('Home');

    if (!steps || steps.length === 0) {
        return null;
    }

    return (
        <section className="py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#C29236] uppercase tracking-wide">
                        {t('workflowProcessTitle')}
                    </h2>
                    <div className="w-28 h-1.5 bg-[#D49B45] mx-auto mt-4 rounded-full" />
                </div>

                {/* Steps Responsive Workflow from Backend */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-2">
                    {steps.map((step, idx) => {
                        const IconComp = ICON_MAP[step.icon] || CheckCircle2;
                        const isLast = idx === steps.length - 1;

                        return (
                            <React.Fragment key={step.num}>
                                {/* Step Item */}
                                <div
                                    className="flex flex-col items-center text-center group flex-1 max-w-[230px]"
                                >
                                    {/* Number Circle Badge */}
                                    <div className="w-14 h-14 rounded-full bg-[#E5B869] border-2 border-slate-900 flex items-center justify-center text-slate-950 font-black text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        {step.num}
                                    </div>

                                    {/* Step Title */}
                                    <h3 className="text-base sm:text-lg lg:text-[19px] font-black text-slate-900 leading-snug mb-3 whitespace-pre-line min-h-[48px] flex items-center justify-center">
                                        {step.title}
                                    </h3>

                                    {/* Icon Container */}
                                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-xs flex items-center justify-center text-[#C29236] group-hover:border-[#C29236] group-hover:shadow-md transition-all">
                                        <IconComp className="w-10 h-10 stroke-[1.8]" />
                                    </div>
                                </div>

                                {/* Arrow divider between steps (visible on desktop) */}
                                {!isLast && (
                                    <div className="hidden lg:flex items-center justify-center text-slate-400 px-2 shrink-0">
                                        <ArrowRight className="w-6 h-6 stroke-[2]" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
