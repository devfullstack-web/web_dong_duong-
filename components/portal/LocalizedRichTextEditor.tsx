'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/portal/rich-text-editor';
import type { LocalizedText, Locale } from '@/types/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
    vi: '🇻🇳 Tiếng Việt',
    en: '🇬🇧 English',
};

interface LocalizedRichTextEditorProps {
    id: string;
    label: string;
    value: LocalizedText;
    onChange: (value: LocalizedText) => void;
    required?: boolean;
    placeholder?: string;
}

export function LocalizedRichTextEditor({
    id,
    label,
    value,
    onChange,
    required = false,
    placeholder,
}: LocalizedRichTextEditorProps) {
    return (
        <div id={id} className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                        <RichTextEditor
                            content={value[locale] || ''}
                            onChange={(content: string) =>
                                onChange({ ...value, [locale]: content })
                            }
                            placeholder={placeholder}
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
