'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';
import { PolarGrid, RadialBar, RadialBarChart } from 'recharts';

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

interface RadialChartProps {
    title?: string;
    description?: string;
    data: Record<string, unknown>[];
    config: ChartConfig;
    dataKey?: string;
    nameKey?: string;
    innerRadius?: number;
    outerRadius?: number;
    footerTitle?: string;
    footerDescription?: string;
    footerIcon?: LucideIcon;
    className?: string;
}

export function RadialChartGrid({
    title = 'Radial Chart',
    description,
    data,
    config,
    dataKey = 'visitors',
    nameKey = 'browser',
    innerRadius = 30,
    outerRadius = 100,
    footerTitle,
    footerDescription,
    footerIcon: FooterIcon = TrendingUp,
    className,
}: RadialChartProps) {
    return (
        <Card className={cn('flex flex-col rounded-none border-slate-200 shadow-sm', className)}>
            <CardHeader className="items-center pb-0 space-y-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                    {title}
                </CardTitle>
                {description && (
                    <CardDescription className="text-[10px] font-medium italic text-slate-500">
                        {description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <RadialBarChart data={data} innerRadius={innerRadius} outerRadius={outerRadius}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel nameKey={nameKey} />}
                        />
                        <PolarGrid gridType="circle" />
                        <RadialBar dataKey={dataKey} />
                    </RadialBarChart>
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
