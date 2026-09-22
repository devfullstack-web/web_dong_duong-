"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Save,
  Layout,
  CheckCircle2,
  Star,
  Sparkles,
  Layers,
  Wind,
  Activity,
  Cpu,
  Building2,
  Disc,
  Wrench,
  Package,
  Boxes,
  Flame,
  ShieldCheck,
  Grid,
  LayoutGrid,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocalizedInput } from "@/components/portal/LocalizedInput";
import { ImageUploader } from "@/components/portal/ImageUploader";
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

export const AVAILABLE_CORE_ICONS = [
  { value: "LayoutGrid", label: "Lưới ô vuông (Gạch men / Mặc định)", icon: LayoutGrid },
  { value: "Layers", label: "Xếp lớp (Gạch thạch anh / Đồng chất)", icon: Layers },
  { value: "Sparkles", label: "Lấp lánh (Gạch trang trí & Mosaic)", icon: Sparkles },
  { value: "Grid", label: "Lưới ô (Men Nano / Viglacera)", icon: Grid },
  { value: "Wind", label: "Luồng gió (Máy lạnh treo tường)", icon: Wind },
  { value: "Activity", label: "Sóng đối lưu (Máy lạnh âm trần Cassette)", icon: Activity },
  { value: "Cpu", label: "Bộ xử lý (Chiller / Nối ống gió)", icon: Cpu },
  { value: "Building2", label: "Tòa nhà / Cao ốc (Điều hòa VRV/VRF)", icon: Building2 },
  { value: "Wrench", label: "Cơ điện & Kỹ thuật", icon: Wrench },
  { value: "Disc", label: "Van công nghiệp & Cơ khí", icon: Disc },
  { value: "Package", label: "Kiện hàng / Vật tư", icon: Package },
  { value: "Boxes", label: "Khối thiết bị tổng hợp", icon: Boxes },
  { value: "Flame", label: "Nhiệt lạnh công nghiệp", icon: Flame },
  { value: "ShieldCheck", label: "Bảo hành & Kiểm chuẩn", icon: ShieldCheck },
];

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid,
  Layers,
  Sparkles,
  Grid,
  Wind,
  Activity,
  Cpu,
  Building2,
  Wrench,
  Disc,
  Package,
  Boxes,
  Flame,
  ShieldCheck,
};

// Flatten tree for select options with indent
function flattenForSelect(cats: ParentCategory[], locale: Locale, level = 0, excludeId?: string): { id: string; name: string; level: number }[] {
  const result: { id: string; name: string; level: number }[] = [];
  for (const cat of cats) {
    if (cat.id === excludeId) continue;
    const name = getLocalizedValue(cat.name_localized, locale) || cat.name;
    result.push({ id: cat.id, name, level });
    if (cat.children?.length) {
      result.push(...flattenForSelect(cat.children, locale, level + 1, excludeId));
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
  const locale = useLocale() as Locale;

  const rawLoc = (initialData?.name_localized as Record<string, unknown>) || {};
  const isCoreInit = (initialData?.display_order ?? 0) > 0;

  const [formData, setFormData] = React.useState<CategoryFormData>({
    name_localized: initialData?.name_localized || toLocalizedText(initialData?.name) || createEmptyLocalizedText(),
    category_type_id: initialData?.category_type_id || "",
    parent_id: initialData?.parent_id ?? null,
    display_order: initialData?.display_order ?? 0,
    is_visible: initialData?.is_visible ?? true,
  });

  const [isCore, setIsCore] = React.useState<boolean>(isCoreInit);
  const [subtitleLocalized, setSubtitleLocalized] = React.useState<LocalizedText>({
    vi: typeof rawLoc.subtitle === "string" ? rawLoc.subtitle : "",
    en: typeof rawLoc.subtitle_en === "string" ? rawLoc.subtitle_en : "",
    zh: typeof rawLoc.subtitle_zh === "string" ? rawLoc.subtitle_zh : "",
  });
  const [imageUrl, setImageUrl] = React.useState<string>(typeof rawLoc.image_url === "string" ? rawLoc.image_url : "");
  const [selectedIcon, setSelectedIcon] = React.useState<string>(typeof rawLoc.icon === "string" ? rawLoc.icon : "LayoutGrid");

  const [parentCategories, setParentCategories] = React.useState<ParentCategory[]>([]);

  // Đồng bộ khi initialData thay đổi (ví dụ API trả về dữ liệu sửa)
  React.useEffect(() => {
    if (initialData) {
      const raw = (initialData.name_localized as Record<string, unknown>) || {};
      setFormData({
        name_localized: initialData.name_localized || toLocalizedText(initialData.name) || createEmptyLocalizedText(),
        category_type_id: initialData.category_type_id || "",
        parent_id: initialData.parent_id ?? null,
        display_order: initialData.display_order ?? 0,
        is_visible: initialData.is_visible ?? true,
      });
      setIsCore((initialData.display_order ?? 0) > 0);
      setSubtitleLocalized({
        vi: typeof raw.subtitle === "string" ? raw.subtitle : "",
        en: typeof raw.subtitle_en === "string" ? raw.subtitle_en : "",
        zh: typeof raw.subtitle_zh === "string" ? raw.subtitle_zh : "",
      });
      setImageUrl(typeof raw.image_url === "string" ? raw.image_url : "");
      setSelectedIcon(typeof raw.icon === "string" ? raw.icon : "LayoutGrid");
    }
  }, [initialData]);

  // Fetch UUID của category_type tương ứng từ API
  React.useEffect(() => {
    if (initialData?.category_type_id) return;
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
    $api.get(`${API_ROUTES.CATEGORIES}?type=${type}&all=true`)
      .then((res) => {
        setParentCategories(res.data?.data || []);
      })
      .catch(() => {});
  }, [type]);

  const flatParents = React.useMemo(
    () => flattenForSelect(parentCategories, locale, 0, editingId),
    [parentCategories, locale, editingId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu đánh dấu là chủ lực nhưng display_order <= 0 thì gán mặc định = 1
    let finalOrder = formData.display_order;
    if (isCore && finalOrder <= 0) {
      finalOrder = 1;
    } else if (!isCore && finalOrder > 0 && type === CATEGORY_TYPE.PRODUCT) {
      finalOrder = 0;
    }

    const currentLoc = (formData.name_localized as Record<string, unknown>) || {};
    const mergedLocalized: LocalizedText & Record<string, unknown> = {
      ...currentLoc,
      vi: formData.name_localized.vi || "",
      en: formData.name_localized.en || "",
      zh: formData.name_localized.zh || "",
      subtitle: subtitleLocalized.vi || "",
      subtitle_en: subtitleLocalized.en || "",
      subtitle_zh: subtitleLocalized.zh || "",
      image_url: imageUrl || "",
      icon: selectedIcon || "LayoutGrid",
    };

    onSubmit({
      ...formData,
      name_localized: mergedLocalized,
      display_order: finalOrder,
    });
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

  const typeLabelsZh = {
    [CATEGORY_TYPE.NEWS]: "新闻资讯",
    [CATEGORY_TYPE.PROJECT]: "工程项目",
    [CATEGORY_TYPE.PRODUCT]: "产品分类",
  };

  const CurrentIconComponent = ICON_MAP[selectedIcon] || LayoutGrid;

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
                zh: `例: ${typeLabelsZh[type]}示例`,
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

        {/* Core Product Category Settings (Sản phẩm chủ lực - Hiển thị Trang chủ) */}
        <section className="bg-white rounded-none border-2 border-amber-200/80 p-5 md:p-6 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1">
            Trang chủ Website
          </div>

          <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4 mb-2">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Danh mục Sản phẩm Chủ lực (Trang chủ)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Cấu hình hiển thị tại khối slider &ldquo;Danh mục sản phẩm chủ lực&rdquo; trên Trang chủ website
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200/50 flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                Đặt làm Sản phẩm Chủ lực trên Trang chủ
              </Label>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Khi bật, danh mục này sẽ xuất hiện trên thanh trượt &ldquo;Danh mục sản phẩm chủ lực&rdquo; ở trang chủ theo thứ tự bạn đặt.
              </p>
            </div>
            <Switch
              checked={isCore}
              onCheckedChange={(checked) => {
                setIsCore(checked);
                if (checked && formData.display_order <= 0) {
                  setFormData((prev) => ({ ...prev, display_order: 1 }));
                }
              }}
            />
          </div>

          {isCore && (
            <div className="space-y-6 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              {/* Display Order */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Thứ tự hiển thị trên Slider Trang chủ (display_order)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    className="h-11 max-w-[160px] border-slate-200 text-base font-bold rounded-none"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  />
                  <span className="text-[11px] text-slate-500 italic">
                    (Số nhỏ hơn sẽ hiển thị trước từ trái sang phải. VD: 1, 2, 3...)
                  </span>
                </div>
              </div>

              {/* Subtitle / Slogan */}
              <div className="space-y-2">
                <LocalizedInput
                  id="subtitle"
                  label="Tiêu đề phụ / Mô tả ngắn thẻ danh mục"
                  value={subtitleLocalized}
                  onChange={setSubtitleLocalized}
                  placeholder={{
                    vi: "VD: Thương hiệu quốc gia, chất lượng vượt trội",
                    en: "E.g.: National brand, superior quality",
                    zh: "例: 越南国家品牌，传世卓越品质",
                  }}
                />
                <p className="text-[9px] text-slate-400 italic">
                  Dòng chữ nhỏ hiển thị bên dưới tên danh mục trên thẻ slider trang chủ.
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Hình ảnh đại diện thẻ danh mục (Trang chủ)
                </Label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Ảnh bìa hiển thị phía trên thẻ sản phẩm chủ lực. Tỷ lệ tối ưu: hình chữ nhật nằm ngang (4:3 hoặc 16:9).
                </p>
                <ImageUploader
                  value={imageUrl}
                  onChange={setImageUrl}
                  aspectRatio="video"
                />
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Đường dẫn ảnh (URL hoặc đường dẫn nội bộ)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="VD: /images/dongduong/cat-gachmen.png hoặc https://..."
                      className="h-10 text-xs font-mono rounded-none border-slate-200"
                    />
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImageUrl('')}
                        className="h-10 px-3 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-none shrink-0"
                      >
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Biểu tượng nhận diện (Icon)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                      <SelectTrigger className="h-11 border-slate-200 text-xs font-bold rounded-none">
                        <SelectValue placeholder="Chọn biểu tượng icon" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {AVAILABLE_CORE_ICONS.map((item) => {
                          const IconComp = item.icon;
                          return (
                            <SelectItem key={item.value} value={item.value}>
                              <div className="flex items-center gap-2.5">
                                <IconComp className="size-4 text-amber-500" />
                                <span className="text-xs font-medium">{item.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Icon Quick Preview */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D49B45] shrink-0">
                      <CurrentIconComponent className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-800">{selectedIcon}</div>
                      <div className="text-[10px] text-slate-500">Biểu tượng hiển thị góc trái thẻ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <Eye size={12} /> Xem trước hiển thị trên Trang chủ
                </div>
                <div className="max-w-sm border-2 border-sky-400 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-100 flex items-center justify-center">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 font-medium italic">
                        Chưa chọn ảnh danh mục
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#D49B45]">
                      <CurrentIconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black uppercase text-[#0B2545] truncate">
                        {formData.name_localized.vi || "TÊN DANH MỤC"}
                      </div>
                      <div className="text-xs text-slate-600 truncate mt-0.5">
                        {subtitleLocalized.vi || "Tiêu đề phụ mô tả sản phẩm..."}
                      </div>
                    </div>
                    <div className="text-slate-300">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            Thông tin danh mục và cấu hình hiển thị Sản phẩm Chủ lực sẽ được cập nhật ngay lập tức vào cơ sở dữ liệu.
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
