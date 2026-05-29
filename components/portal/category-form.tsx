"use client";

import * as React from "react";
import Link from "next/link";
import { Save, Layout, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocalizedInput } from "@/components/portal/LocalizedInput";
import { createEmptyLocalizedText, toLocalizedText, getLocalizedValue } from "@/types/i18n";
import type { LocalizedText, Locale } from "@/types/i18n";
import $api from "@/utils/axios";
import { API_ROUTES } from "@/constants/routes";
import { CATEGORY_TYPE, type CategoryType } from "@/constants/content";

export interface CategoryFormData {
  name_localized: LocalizedText;
  category_type_id: string;
  parent_id: string | null;
  display_order: number;
  is_visible: boolean;
}

interface ParentCategory {
  id: string;
  name: string;
  name_localized?: LocalizedText | null;
  parent_id: string | null;
  children?: ParentCategory[];
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData & { name?: string }>;
  onSubmit: (data: CategoryFormData) => void;
  type: CategoryType;
  isEditing?: boolean;
  backUrl: string;
  editingId?: string; // ID of the category being edited (to exclude from parent list)
}

// Flatten tree for select options with indent
function flattenForSelect(cats: ParentCategory[], level = 0, excludeId?: string): { id: string; name: string; level: number }[] {
  const result: { id: string; name: string; level: number }[] = [];
  for (const cat of cats) {
    if (cat.id === excludeId) continue;
    const name = getLocalizedValue(cat.name_localized, 'vi' as Locale) || cat.name;
    result.push({ id: cat.id, name, level });
    if (cat.children?.length) {
      result.push(...flattenForSelect(cat.children, level + 1, excludeId));
    }
  }
  return result;
}

export function CategoryForm({
  initialData,
  onSubmit,
  type,
  isEditing = false,
  backUrl,
  editingId,
}: CategoryFormProps) {
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name_localized: initialData?.name_localized || toLocalizedText(initialData?.name) || createEmptyLocalizedText(),
    category_type_id: initialData?.category_type_id || "",
    parent_id: initialData?.parent_id ?? null,
    display_order: initialData?.display_order ?? 0,
    is_visible: initialData?.is_visible ?? true,
  });

  const [parentCategories, setParentCategories] = React.useState<ParentCategory[]>([]);

  // Fetch UUID của category_type tương ứng từ API
  React.useEffect(() => {
    if (initialData?.category_type_id) return; // đang edit, đã có sẵn
    $api.get(`${API_ROUTES.CATEGORY_TYPES}?name=${type}`)
      .then((res) => {
        const found = res.data?.data?.[0];
        if (found?.id) {
          setFormData((prev) => ({ ...prev, category_type_id: found.id }));
        }
      })
      .catch(() => {});
  }, [type, initialData?.category_type_id]);

  // Fetch categories for parent selector
  React.useEffect(() => {
    $api.get(`${API_ROUTES.CATEGORIES}?type=${type}`)
      .then((res) => {
        setParentCategories(res.data?.data || []);
      })
      .catch(() => {});
  }, [type]);

  const flatParents = React.useMemo(
    () => flattenForSelect(parentCategories, 0, editingId),
    [parentCategories, editingId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const typeLabels = {
    [CATEGORY_TYPE.NEWS]: "tin tức",
    [CATEGORY_TYPE.PROJECT]: "dự án",
    [CATEGORY_TYPE.PRODUCT]: "sản phẩm",
  };

  const typeLabelsEn = {
    [CATEGORY_TYPE.NEWS]: "news",
    [CATEGORY_TYPE.PROJECT]: "project",
    [CATEGORY_TYPE.PRODUCT]: "product",
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <section className="bg-white rounded-none border border-slate-100 p-5 md:p-6 space-y-5">
          <div className="flex items-center gap-3 border-l-4 border-brand-primary pl-4 mb-2">
            <Layout size={18} className="text-brand-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Thông tin cơ bản</h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <LocalizedInput
              id="name"
              label="Tên danh mục"
              value={formData.name_localized}
              onChange={(value) => setFormData({ ...formData, name_localized: value })}
              required
              placeholder={{
                vi: `VD: Danh mục ${typeLabels[type]} mẫu`,
                en: `E.g.: Sample ${typeLabelsEn[type]} category`,
              }}
            />

            {/* Parent Category */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Danh mục cha</Label>
              <Select
                value={formData.parent_id || "__none__"}
                onValueChange={(value) => setFormData({ ...formData, parent_id: value === "__none__" ? null : value })}
              >
                <SelectTrigger className="h-11 border-slate-200 text-sm font-bold rounded-none">
                  <SelectValue placeholder="Chọn danh mục cha (bỏ trống = danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-slate-500 italic">— Danh mục gốc —</span>
                  </SelectItem>
                  {flatParents.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-1">
                        {cat.level > 0 && (
                          <span className="text-slate-300">
                            {"—".repeat(cat.level)}
                          </span>
                        )}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[9px] text-slate-400 italic">Nếu không chọn, danh mục này sẽ là danh mục gốc.</p>
            </div>

            {/* Display Order */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thứ tự hiển thị</Label>
              <Input
                type="number"
                min={0}
                className="h-11 border-slate-200 text-sm font-bold rounded-none"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-[9px] text-slate-400 italic">Số nhỏ hơn sẽ hiển thị trước. Mặc định: 0.</p>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50/50 border border-slate-100">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái hiển thị</Label>
                <p className="text-[9px] text-slate-400 italic mt-1">
                  {formData.is_visible ? "Danh mục đang hiển thị cho người dùng" : "Danh mục đang bị ẩn"}
                </p>
              </div>
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        {/* Audit / Action */}
        <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng để lưu</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            Nhập tên danh mục cho cả tiếng Việt và tiếng Anh để hỗ trợ đa ngôn ngữ.
          </p>
          <div className="pt-2">
            <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest h-10 transition-all rounded-none">
              <Save className="mr-2 size-4" /> {isEditing ? "Cập nhật danh mục" : "Lưu danh mục mới"}
            </Button>
            <Link href={backUrl} className="block mt-3">
              <Button type="button" variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-none opacity-50 hover:opacity-100">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
