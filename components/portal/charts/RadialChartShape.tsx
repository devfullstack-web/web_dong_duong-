'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

interface RadialChartShapeProps {
    title?: string;
    description?: string;
    data: Record<string, unknown>[];
    config: ChartConfig;
    dataKey?: string;
    label?: string;
    endAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    footerTitle?: string;
    footerDescription?: string;
    footerIcon?: LucideIcon;
    className?: string;
}

export function RadialChartShape({
    title = 'Radial Chart - Shape',
    description,
    data,
    config,
    dataKey = 'visitors',
    label = 'Total',
    endAngle = 100,
    innerRadius = 70,
    outerRadius = 100,
    footerTitle,
    footerDescription,
    footerIcon: FooterIcon = TrendingUp,
    className,
}: RadialChartShapeProps) {
    const totalValue = data[0]?.[dataKey] || 0;

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
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <RadialBarChart
                        data={data}
                        endAngle={endAngle}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-slate-100 last:fill-white"
                            polarRadius={[76, 64]}
                        />
                        <RadialBar dataKey={dataKey} background />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-slate-900 text-3xl font-black uppercase"
                                                >
                                                    {totalValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 20}
                                                    className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest"
                                                >
                                                    {label}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
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
