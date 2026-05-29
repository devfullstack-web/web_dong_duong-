'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';
import { Pie, PieChart } from 'recharts';

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

interface PieChartProps {
    title?: string;
    description?: string;
    data: Record<string, unknown>[];
    config: ChartConfig;
    dataKey?: string;
    nameKey?: string;
    footerTitle?: string;
    footerDescription?: string;
    footerIcon?: LucideIcon;
    className?: string;
}

export function PieChartLabel({
    title = 'Pie Chart - Label',
    description,
    data,
    config,
    dataKey = 'visitors',
    nameKey = 'browser',
    footerTitle,
    footerDescription,
    footerIcon: FooterIcon = TrendingUp,
    className,
}: PieChartProps) {
    return (
        <Card className={cn('flex flex-col rounded-none border-slate-200 shadow-sm', className)}>
            <CardHeader className="items-center pb-0 space-y-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription className="text-[10px] font-medium italic text-slate-500 text-center">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="[&_.recharts-pie-label-text]:fill-slate-500 [&_.recharts-pie-label-text]:text-[10px] [&_.recharts-pie-label-text]:font-bold [&_.recharts-pie-label-text]:uppercase mx-auto aspect-square max-h-[250px] pb-0"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={data} dataKey={dataKey} label nameKey={nameKey} />
                    </PieChart>
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
