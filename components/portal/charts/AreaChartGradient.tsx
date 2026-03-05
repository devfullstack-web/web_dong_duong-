'use client';

import { TrendingUp, LucideIcon } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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

interface AreaChartGradientProps {
    title?: string;
    description?: string;
    data: any[];
    config: ChartConfig;
    dataKeys: string[]; // Array of keys to display as areas
    xAxisKey?: string;
    footerTitle?: string;
    footerDescription?: string;
    footerIcon?: LucideIcon;
    className?: string;
}

export function AreaChartGradient({
    title = 'Area Chart - Gradient',
    description,
    data,
    config,
    dataKeys = ['desktop', 'mobile'],
    xAxisKey = 'month',
    footerTitle,
    footerDescription,
    footerIcon: FooterIcon = TrendingUp,
    className,
}: AreaChartGradientProps) {
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
                <ChartContainer config={config} className="h-62.5 w-full">
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 10,
                        }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-slate-100"
                        />
                        <XAxis
                            dataKey={xAxisKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tick={{ fill: 'var(--slate-400)', fontSize: 9, fontWeight: 700 }}
                            tickFormatter={(value) =>
                                typeof value === 'string' ? value.slice(0, 3).toUpperCase() : value
                            }
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            {dataKeys.map((key) => (
                                <linearGradient
                                    key={`fill-${key}`}
                                    id={`fill-${key}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={`var(--color-${key})`}
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={`var(--color-${key})`}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        {dataKeys.map((key, index) => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`url(#fill-${key})`}
                                fillOpacity={0.4}
                                stroke={`var(--color-${key})`}
                                strokeWidth={2}
                                stackId="a"
                            />
                        ))}
                    </AreaChart>
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
