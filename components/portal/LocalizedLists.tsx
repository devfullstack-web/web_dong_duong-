'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Locale } from '@/types/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
    vi: '🇻🇳 Tiếng Việt',
    en: '🇬🇧 English',
};

// Localized Features List
export type LocalizedFeatures = {
    vi: string[];
    en: string[];
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
    const updateFeature = (locale: Locale, index: number, newValue: string) => {
        const updated = [...(value[locale] || [''])];
        updated[index] = newValue;
        onChange({ ...value, [locale]: updated });
    };

    const addFeature = (locale: Locale) => {
        onChange({ ...value, [locale]: [...(value[locale] || []), ''] });
    };

    const removeFeature = (locale: Locale, index: number) => {
        const filtered = (value[locale] || []).filter((_, i) => i !== index);
        onChange({ ...value, [locale]: filtered.length ? filtered : [''] });
    };

    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {label}
            </Label>
            <Tabs defaultValue="vi" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100 rounded-none">
                    {(['vi', 'en'] as Locale[]).map((locale) => (
                        <TabsTrigger
                            key={locale}
                            value={locale}
                            className="text-[10px] font-bold uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            {LOCALE_LABELS[locale]}
                            {value[locale]?.some((f) => f.trim()) && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en'] as Locale[]).map((locale) => (
                    <TabsContent key={locale} value={locale} className="mt-3 space-y-4">
                        {(value[locale] || ['']).map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    className="h-12 bg-slate-50 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={feature}
                                    onChange={(e) =>
                                        updateFeature(locale, index, e.target.value)
                                    }
                                    placeholder={
                                        locale === 'vi'
                                            ? 'VD: Tiêu chuẩn Nhật Bản...'
                                            : 'E.g.: Japanese standard...'
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                    onClick={() => removeFeature(locale, index)}
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                            onClick={() => addFeature(locale)}
                        >
                            + {locale === 'vi' ? 'Thêm đặc điểm' : 'Add feature'}
                        </Button>
                        {locale === 'en' &&
                            !value.en?.some((f) => f.trim()) &&
                            value.vi?.some((f) => f.trim()) && (
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
    const updateSpec = (
        locale: Locale,
        index: number,
        field: 'key' | 'value',
        newValue: string
    ) => {
        const updated = [...(value[locale] || [{ key: '', value: '' }])];
        updated[index] = { ...updated[index], [field]: newValue };
        onChange({ ...value, [locale]: updated });
    };

    const addSpec = (locale: Locale) => {
        onChange({
            ...value,
            [locale]: [...(value[locale] || []), { key: '', value: '' }],
        });
    };

    const removeSpec = (locale: Locale, index: number) => {
        const filtered = (value[locale] || []).filter((_, i) => i !== index);
        onChange({
            ...value,
            [locale]: filtered.length ? filtered : [{ key: '', value: '' }],
        });
    };

    return (
        <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {label}
            </Label>
            <Tabs defaultValue="vi" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100 rounded-none">
                    {(['vi', 'en'] as Locale[]).map((locale) => (
                        <TabsTrigger
                            key={locale}
                            value={locale}
                            className="text-[10px] font-bold uppercase tracking-widest rounded-none data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                            {LOCALE_LABELS[locale]}
                            {value[locale]?.some((s) => s.key.trim() || s.value.trim()) && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en'] as Locale[]).map((locale) => (
                    <TabsContent key={locale} value={locale} className="mt-3 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                {locale === 'vi' ? 'Tên thông số' : 'Spec name'}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                {locale === 'vi' ? 'Giá trị' : 'Value'}
                            </div>
                        </div>
                        {(value[locale] || [{ key: '', value: '' }]).map((spec, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder={
                                        locale === 'vi' ? 'VD: Kích thước' : 'E.g.: Size'
                                    }
                                    className="h-12 bg-slate-50 border-none text-sm font-bold rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={spec.key}
                                    onChange={(e) =>
                                        updateSpec(locale, index, 'key', e.target.value)
                                    }
                                />
                                <Input
                                    placeholder={
                                        locale === 'vi'
                                            ? 'VD: DN50 - DN1200'
                                            : 'E.g.: DN50 - DN1200'
                                    }
                                    className="h-12 bg-slate-100 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={spec.value}
                                    onChange={(e) =>
                                        updateSpec(locale, index, 'value', e.target.value)
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                    onClick={() => removeSpec(locale, index)}
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                            onClick={() => addSpec(locale)}
                        >
                            + {locale === 'vi' ? 'Thêm thông số' : 'Add spec'}
                        </Button>
                        {locale === 'en' &&
                            !value.en?.some((s) => s.key.trim()) &&
                            value.vi?.some((s) => s.key.trim()) && (
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
