"use client";

import * as React from "react";
import Link from "next/link";
import { Save, ImagePlus, Globe, Search, Layers, Layout, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import $api from "@/utils/axios";


export interface CategoryFormData {
  name: string;
  category_type_id: string;
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  type: "news" | "project" | "product";
  isEditing?: boolean;
  backUrl: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  type,
  isEditing = false,
  backUrl,
}: CategoryFormProps) {
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: initialData?.name || "",
    category_type_id: initialData?.category_type_id || "",
  });

  // Fetch UUID của category_type tương ứng từ API
  React.useEffect(() => {
    if (initialData?.category_type_id) return; // đang edit, đã có sẵn
    $api.get(`/category-types?name=${type}`)
      .then((res) => {
        const found = res.data?.data?.[0];
        if (found?.id) {
          setFormData((prev) => ({ ...prev, category_type_id: found.id }));
        }
      })
      .catch(() => {});
  }, [type, initialData?.category_type_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const typeLabels = {
    news: "tin tức",
    project: "dự án",
    product: "sản phẩm",
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-brand-primary pl-4 mb-2">
            <Layout size={18} className="text-brand-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Thông tin cơ bản</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tên danh mục *</Label>
              <Input 
                id="name" 
                className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none focus-visible:ring-brand-primary/20" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
                placeholder={`VD: Danh mục ${typeLabels[type]} mẫu`}
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loại danh mục (ID)</Label>
              <Input 
                disabled 
                className="h-14 bg-slate-100 border-none text-sm font-bold rounded-none opacity-50" 
                value={formData.category_type_id} 
              />
              <p className="text-[9px] text-slate-400 italic">Mã định danh cho loại {typeLabels[type]}.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        {/* Audit / Action */}
        <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng để lưu</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            Dữ liệu được rút gọn để khớp hoàn toàn với database schema CMS mới.
          </p>
          <div className="pt-2">
            <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest h-14 transition-all rounded-none shadow-lg shadow-brand-primary/20">
              <Save className="mr-2 size-4" /> {isEditing ? "Cập nhật danh mục" : "Lưu danh mục mới"}
            </Button>
            <Link href={backUrl} className="block mt-4">
              <Button type="button" variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-12 rounded-none opacity-50 hover:opacity-100">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

