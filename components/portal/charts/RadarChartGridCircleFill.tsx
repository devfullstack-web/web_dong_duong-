'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface RadarChartGridCircleFillProps {
    title?: string;
    description?: string;
    data: Record<string, unknown>[];
    config: ChartConfig;
    dataKey?: string;
    angleKey?: string;
    footerTitle?: string;
    footerDescription?: string;
    footerIcon?: LucideIcon;
    className?: string;
}

export function RadarChartGridCircleFill({
    title = 'Radar Chart - Grid Circle Filled',
    description,
    data,
    config,
    dataKey = 'desktop',
    angleKey = 'month',
    footerTitle,
    footerDescription,
    footerIcon: FooterIcon = TrendingUp,
    className,
}: RadarChartGridCircleFillProps) {
    return (
        <Card className={cn('flex flex-col rounded-none border-slate-200 shadow-sm', className)}>
            <CardHeader className="items-center pb-4 space-y-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription className="text-[10px] font-medium italic text-slate-500 text-center">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <RadarChart data={data}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarGrid
                            className={cn(`fill-current opacity-20`)}
                            style={{ color: `var(--color-${dataKey})` }}
                            gridType="circle"
                        />
                        <PolarAngleAxis
                            dataKey={angleKey}
                            tick={{ fill: 'var(--slate-400)', fontSize: 10, fontWeight: 700 }}
                        />
                        <Radar
                            dataKey={dataKey}
                            fill={`var(--color-${dataKey})`}
                            fillOpacity={0.5}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            {(footerTitle || footerDescription) && (
                <CardFooter className="flex-col gap-2 p-6 pt-0 border-t border-slate-50 mt-4">
                    {footerTitle && (
                        <div className="flex items-center gap-2 leading-none text-[10px] font-black uppercase tracking-widest text-brand-primary">
                            {footerTitle}{' '}
                            {FooterIcon && <FooterIcon className="h-3 w-3 text-brand-accent" />}
                        </div>
                    )}
                    {footerDescription && (
                        <div className="text-[9px] font-medium text-slate-400 uppercase tracking-tight italic">
                            {footerDescription}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
