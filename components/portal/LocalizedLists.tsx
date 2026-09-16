'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Locale } from '@/types/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
    vi: '🇻🇳 Tiếng Việt',
    en: '🇬🇧 English',
    zh: '🇨🇳 中文',
};

// Localized Features List
export type LocalizedFeatures = {
    vi: string[];
    en: string[];
    zh?: string[];
};

interface LocalizedFeaturesListProps {
    label: string;
    value: LocalizedFeatures;
    onChange: (value: LocalizedFeatures) => void;
}

export function LocalizedFeaturesList({
    label,
    value,
    onChange,
}: LocalizedFeaturesListProps) {
    const featuresForLocale = (loc: Locale): string[] => {
        const arr = value[loc];
        return Array.isArray(arr) ? arr : [];
    };

    const updateFeature = (loc: Locale, index: number, text: string) => {
        const current = featuresForLocale(loc);
        const updated = [...(current.length ? current : [''])];
        updated[index] = text;
        onChange({ ...value, [loc]: updated });
    };

    const addFeature = (loc: Locale) => {
        onChange({
            ...value,
            [loc]: [...featuresForLocale(loc), ''],
        });
    };

    const removeFeature = (loc: Locale, index: number) => {
        const filtered = featuresForLocale(loc).filter((_, i) => i !== index);
        onChange({
            ...value,
            [loc]: filtered.length ? filtered : [''],
        });
    };

    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {label}
            </Label>
            <Tabs defaultValue="vi" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 bg-slate-100 rounded-none">
                    {(['vi', 'en', 'zh'] as Locale[]).map((loc) => (
                        <TabsTrigger
                            key={loc}
                            value={loc}
                            className="text-[10px] font-bold uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            {LOCALE_LABELS[loc]}
                            {featuresForLocale(loc).some((f: string) => f.trim()) && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en', 'zh'] as Locale[]).map((loc) => (
                    <TabsContent key={loc} value={loc} className="mt-3 space-y-4">
                        {(featuresForLocale(loc).length ? featuresForLocale(loc) : ['']).map((feature: string, index: number) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    className="h-12 bg-slate-50 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={feature}
                                    onChange={(e) =>
                                        updateFeature(loc, index, e.target.value)
                                    }
                                    placeholder={
                                        loc === 'vi'
                                            ? 'VD: Tiêu chuẩn Nhật Bản...'
                                            : loc === 'zh'
                                              ? '例: 意大利原创连纹设计 / 抗菌环保...'
                                              : 'E.g.: Japanese standard...'
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                    onClick={() => removeFeature(loc, index)}
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                            onClick={() => addFeature(loc)}
                        >
                            + {loc === 'vi' ? 'Thêm đặc điểm' : loc === 'zh' ? '添加特性' : 'Add feature'}
                        </Button>
                        {loc !== 'vi' &&
                            !featuresForLocale(loc).some((f: string) => f.trim()) &&
                            featuresForLocale('vi').some((f: string) => f.trim()) && (
                                <p className="text-[9px] text-amber-500 italic">
                                    Sẽ sử dụng bản tiếng Việt nếu để trống
                                </p>
                            )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

// Localized Tech Specs
export type LocalizedTechSpecs = {
    vi: { key: string; value: string }[];
    en: { key: string; value: string }[];
    zh?: { key: string; value: string }[];
};

interface LocalizedTechSpecsListProps {
    label: string;
    value: LocalizedTechSpecs;
    onChange: (value: LocalizedTechSpecs) => void;
}

export function LocalizedTechSpecsList({
    label,
    value,
    onChange,
}: LocalizedTechSpecsListProps) {
    const specsForLocale = (loc: Locale): { key: string; value: string }[] => {
        const arr = value[loc];
        return Array.isArray(arr) ? arr : [];
    };

    const updateSpec = (
        loc: Locale,
        index: number,
        field: 'key' | 'value',
        newValue: string
    ) => {
        const current = specsForLocale(loc);
        const updated = [...(current.length ? current : [{ key: '', value: '' }])];
        updated[index] = { ...updated[index], [field]: newValue };
        onChange({ ...value, [loc]: updated });
    };

    const addSpec = (loc: Locale) => {
        onChange({
            ...value,
            [loc]: [...specsForLocale(loc), { key: '', value: '' }],
        });
    };

    const removeSpec = (loc: Locale, index: number) => {
        const filtered = specsForLocale(loc).filter((_, i) => i !== index);
        onChange({
            ...value,
            [loc]: filtered.length ? filtered : [{ key: '', value: '' }],
        });
    };

    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {label}
            </Label>
            <Tabs defaultValue="vi" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 bg-slate-100 rounded-none">
                    {(['vi', 'en', 'zh'] as Locale[]).map((loc) => (
                        <TabsTrigger
                            key={loc}
                            value={loc}
                            className="text-[10px] font-bold uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            {LOCALE_LABELS[loc]}
                            {specsForLocale(loc).some((s) => s.key.trim() || s.value.trim()) && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en', 'zh'] as Locale[]).map((loc) => (
                    <TabsContent key={loc} value={loc} className="mt-3 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                {loc === 'vi' ? 'Tên thông số' : loc === 'zh' ? '参数名称' : 'Spec name'}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                {loc === 'vi' ? 'Giá trị' : loc === 'zh' ? '参数数值' : 'Value'}
                            </div>
                        </div>
                        {(specsForLocale(loc).length
                            ? specsForLocale(loc)
                            : [{ key: '', value: '' }]
                        ).map((spec, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder={
                                        loc === 'vi' ? 'VD: Kích thước' : loc === 'zh' ? '例: 规格尺寸' : 'E.g.: Size'
                                    }
                                    className="h-12 bg-slate-50 border-none text-sm font-bold rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={spec.key}
                                    onChange={(e) =>
                                        updateSpec(loc, index, 'key', e.target.value)
                                    }
                                />
                                <Input
                                    placeholder={
                                        loc === 'vi'
                                            ? 'VD: 800x800 mm'
                                            : loc === 'zh'
                                              ? '例: 800x800 mm'
                                              : 'E.g.: 800x800 mm'
                                    }
                                    className="h-12 bg-slate-100 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={spec.value}
                                    onChange={(e) =>
                                        updateSpec(loc, index, 'value', e.target.value)
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                    onClick={() => removeSpec(loc, index)}
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                            onClick={() => addSpec(loc)}
                        >
                            + {loc === 'vi' ? 'Thêm thông số' : loc === 'zh' ? '添加参数' : 'Add spec'}
                        </Button>
                        {loc !== 'vi' &&
                            !specsForLocale(loc).some((s) => s.key.trim()) &&
                            specsForLocale('vi').some((s) => s.key.trim()) && (
                                <p className="text-[9px] text-amber-500 italic">
                                    Sẽ sử dụng bản tiếng Việt nếu để trống
                                </p>
                            )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
