'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { LocalizedText, Locale } from '@/types/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
    vi: '🇻🇳 Tiếng Việt',
    en: '🇬🇧 English',
};

interface LocalizedInputProps {
    id: string;
    label: string;
    value: LocalizedText;
    onChange: (value: LocalizedText) => void;
    required?: boolean;
    placeholder?: { vi?: string; en?: string };
    disabled?: boolean;
}

export function LocalizedInput({
    id,
    label,
    value,
    onChange,
    required = false,
    placeholder,
    disabled = false,
}: LocalizedInputProps) {
    return (
        <div className="space-y-3">
            <Label
                htmlFor={id}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
                {label} {required && '*'}
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
                            {value[locale] && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en'] as Locale[]).map((locale) => (
                    <TabsContent key={locale} value={locale} className="mt-3">
                        <Input
                            id={`${id}-${locale}`}
                            className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none focus-visible:ring-brand-primary/20"
                            value={value[locale] || ''}
                            onChange={(e) =>
                                onChange({ ...value, [locale]: e.target.value })
                            }
                            required={required && locale === 'vi'}
                            placeholder={placeholder?.[locale]}
                            disabled={disabled}
                        />
                        {locale === 'en' && !value.en && value.vi && (
                            <p className="text-[9px] text-amber-500 mt-1 italic">
                                Sẽ sử dụng bản tiếng Việt nếu để trống
                            </p>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

interface LocalizedTextareaProps {
    id: string;
    label: string;
    value: LocalizedText;
    onChange: (value: LocalizedText) => void;
    required?: boolean;
    placeholder?: { vi?: string; en?: string };
    rows?: number;
    disabled?: boolean;
}

export function LocalizedTextarea({
    id,
    label,
    value,
    onChange,
    required = false,
    placeholder,
    rows = 4,
    disabled = false,
}: LocalizedTextareaProps) {
    return (
        <div className="space-y-3">
            <Label
                htmlFor={id}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
            >
                {label} {required && '*'}
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
                            {value[locale] && (
                                <span className="ml-1 text-green-500">●</span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {(['vi', 'en'] as Locale[]).map((locale) => (
                    <TabsContent key={locale} value={locale} className="mt-3">
                        <Textarea
                            id={`${id}-${locale}`}
                            className="bg-slate-50 border-none text-sm font-medium rounded-none focus-visible:ring-brand-primary/20 resize-none"
                            value={value[locale] || ''}
                            onChange={(e) =>
                                onChange({ ...value, [locale]: e.target.value })
                            }
                            required={required && locale === 'vi'}
                            placeholder={placeholder?.[locale]}
                            rows={rows}
                            disabled={disabled}
                        />
                        {locale === 'en' && !value.en && value.vi && (
                            <p className="text-[9px] text-amber-500 mt-1 italic">
                                Sẽ sử dụng bản tiếng Việt nếu để trống
                            </p>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
