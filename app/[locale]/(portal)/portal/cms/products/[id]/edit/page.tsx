'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package, Loader2 } from 'lucide-react';
import { generateSlug } from '@/utils/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedInput, LocalizedTextarea } from '@/components/portal/LocalizedInput';
import { LocalizedRichTextEditor } from '@/components/portal/LocalizedRichTextEditor';
import {
    LocalizedFeaturesList,
    LocalizedTechSpecsList,
    type LocalizedFeatures,
    type LocalizedTechSpecs,
} from '@/components/portal/LocalizedLists';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import $api from '@/utils/axios';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { StatusFormSection } from '@/components/portal/status-form-section';
import { ImageUploader } from '@/components/portal/ImageUploader';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createEmptyLocalizedText, toLocalizedText, getLocalizedValue } from '@/types/i18n';
import type { LocalizedText } from '@/types/i18n';

interface Category {
    id: string;
    name: string;
    name_localized?: LocalizedText | null;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        name_localized: createEmptyLocalizedText(),
        slug: '',
        sku: '',
        description_localized: createEmptyLocalizedText(),
        price: '0',
        stock: '0',
        category_id: '',
        status: 'active' as 'active' | 'inactive',
        image: '',
        is_featured: false,
        origin: '',
        warranty: '12 tháng',
        availability: 'Sẵn hàng',
        delivery_info: 'Toàn quốc',
        catalog_url: '',
        tech_summary_localized: createEmptyLocalizedText(),
        features_localized: { vi: [''], en: [''] } as LocalizedFeatures,
        tech_specs_localized: {
            vi: [{ key: '', value: '' }],
            en: [{ key: '', value: '' }],
        } as LocalizedTechSpecs,
        gallery: [] as string[],
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories and product in parallel
                const [categoriesRes, productRes] = await Promise.all([
                    $api.get(`${API_ROUTES.CATEGORIES}?type=product`),
                    $api.get(`${API_ROUTES.PRODUCTS}/${productId}`),
                ]);

                setCategories(categoriesRes.data.data || []);

                const product = productRes.data.data;
                if (product) {
                    setFormData({
                        name_localized: product.name_localized || toLocalizedText(product.name),
                        slug: product.slug || '',
                        sku: product.sku || '',
                        description_localized: product.description_localized || toLocalizedText(product.description),
                        price: product.price || '0',
                        stock: product.stock?.toString() || '0',
                        category_id: product.category_id || '',
                        status: product.status || 'active',
                        image: product.image_url || '',
                        is_featured: product.is_featured || false,
                        origin: product.origin || '',
                        warranty: product.warranty || '12 tháng',
                        availability: product.availability || 'Sẵn hàng',
                        delivery_info: product.delivery_info || 'Toàn quốc',
                        catalog_url: product.catalog_url || '',
                        tech_summary_localized: product.tech_summary_localized || toLocalizedText(product.tech_summary),
                        features_localized: product.features_localized
                            ? product.features_localized
                            : {
                                  vi:
                                      Array.isArray(product.features) && product.features.length > 0
                                          ? product.features
                                          : [''],
                                  en: [''],
                              },
                        tech_specs_localized: product.tech_specs_localized
                            ? product.tech_specs_localized
                            : {
                                  vi: product.tech_specs
                                      ? Object.entries(product.tech_specs).map(([key, value]) => ({
                                            key,
                                            value: String(value),
                                        }))
                                      : [{ key: '', value: '' }],
                                  en: [{ key: '', value: '' }],
                              },
                        gallery: Array.isArray(product.gallery) ? product.gallery : [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                toast.error('Không thể tải thông tin sản phẩm');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchData();
        }
    }, [productId]);

    const handleNameChange = (name_localized: LocalizedText) => {
        const slug = generateSlug(name_localized.vi);

        setFormData((prev) => ({
            ...prev,
            name_localized,
            slug: prev.slug === '' || prev.slug === generateSlug(prev.name_localized.vi) ? slug : prev.slug,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name_localized.vi) {
            toast.error('Vui lòng nhập tên sản phẩm tiếng Việt');
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform tech_specs from array to object for API (legacy - use Vietnamese)
            const specsObject: Record<string, string> = {};
            formData.tech_specs_localized.vi.forEach((spec) => {
                if (spec.key && spec.value) specsObject[spec.key] = spec.value;
            });

            // Filter empty features
            const featuresLocalized = {
                vi: formData.features_localized.vi.filter((f) => f.trim() !== ''),
                en: formData.features_localized.en.filter((f) => f.trim() !== ''),
            };

            // Filter empty tech specs
            const techSpecsLocalized = {
                vi: formData.tech_specs_localized.vi.filter(
                    (s) => s.key.trim() !== '' || s.value.trim() !== '',
                ),
                en: formData.tech_specs_localized.en.filter(
                    (s) => s.key.trim() !== '' || s.value.trim() !== '',
                ),
            };

            const submissionData = {
                // Legacy fields (populated from Vietnamese)
                name: formData.name_localized.vi,
                description: formData.description_localized.vi,
                tech_summary: formData.tech_summary_localized.vi || null,
                // Localized fields
                name_localized: formData.name_localized,
                description_localized: formData.description_localized,
                tech_summary_localized: formData.tech_summary_localized,
                // Other fields
                slug: formData.slug,
                sku: formData.sku,
                price: formData.price,
                stock: formData.stock,
                category_id: formData.category_id,
                status: formData.status,
                is_featured: formData.is_featured,
                origin: formData.origin,
                warranty: formData.warranty,
                availability: formData.availability,
                delivery_info: formData.delivery_info,
                catalog_url: formData.catalog_url,
                tech_specs: specsObject,
                tech_specs_localized: techSpecsLocalized,
                features: featuresLocalized.vi, // Legacy - use Vietnamese
                features_localized: featuresLocalized,
                image_url: formData.image,
                gallery: formData.gallery,
            };

            await $api.patch(`${API_ROUTES.PRODUCTS}/${productId}`, submissionData);

            toast.success('Cập nhật sản phẩm thành công');
            router.push(PORTAL_ROUTES.cms.products.list);
        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { error?: string } }; message?: string };
            const message = err.response?.data?.error || err.message || 'Lỗi khi cập nhật sản phẩm';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="mt-4 text-slate-500 font-medium italic animate-pulse">
                    Đang tải thông tin sản phẩm...
                </p>
            </div>
        );
    }

    if (!formData.name_localized.vi && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm.</p>
                <Link href={PORTAL_ROUTES.cms.products.list}>
                    <Button variant="outline" className="rounded-none">
                        Quay lại danh sách
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.products.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Chỉnh sửa sản phẩm
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Cập nhật thông tin sản phẩm và chuẩn hóa dữ liệu.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="text-[10px] font-black uppercase tracking-widest px-6 py-6 h-auto border-slate-100 rounded-none text-slate-500"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Hủy thay đổi
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-6 h-auto transition-all rounded-none"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 size-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <LocalizedInput
                                id="name"
                                label="Tên sản phẩm"
                                value={formData.name_localized}
                                onChange={handleNameChange}
                                required
                                placeholder={{
                                    vi: 'Nhập tên sản phẩm...',
                                    en: 'Enter product name...',
                                }}
                            />
                            <div className="space-y-3">
                                <Label
                                    htmlFor="sku"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    <Package size={12} className="inline mr-1" /> Mã SKU *
                                </Label>
                                <Input
                                    id="sku"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.sku}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sku: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <Label
                                htmlFor="slug"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Slug (URL) *
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-medium">
                                    /
                                </span>
                                <Input
                                    id="slug"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none pl-6 focus-visible:ring-brand-primary/20"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="price"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Giá bán (VNĐ) *
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({ ...formData, price: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="stock"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Số lượng tồn kho *
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({ ...formData, stock: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <LocalizedRichTextEditor
                            id="description"
                            label="Mô tả sản phẩm"
                            value={formData.description_localized}
                            onChange={(value) =>
                                setFormData({ ...formData, description_localized: value })
                            }
                            placeholder="Mô tả chi tiết về sản phẩm..."
                        />

                        <LocalizedTextarea
                            id="tech_summary"
                            label="Tóm tắt kỹ thuật (Dành cho trang chi tiết)"
                            value={formData.tech_summary_localized}
                            onChange={(value) =>
                                setFormData({ ...formData, tech_summary_localized: value })
                            }
                            placeholder={{
                                vi: 'Ví dụ: Cung cấp đầy đủ chứng chỉ CO/CQ và hỗ trợ kỹ thuật tận nơi...',
                                en: 'E.g.: Full CO/CQ certification and on-site technical support...',
                            }}
                            rows={3}
                        />
                    </div>

                    {/* Features Section */}
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Đặc điểm nổi bật
                        </h3>
                        <LocalizedFeaturesList
                            label="Danh sách đặc điểm"
                            value={formData.features_localized}
                            onChange={(value) =>
                                setFormData({ ...formData, features_localized: value })
                            }
                        />
                    </div>

                    {/* Tech Specs Section */}
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Thông số kỹ thuật (Bảng)
                        </h3>
                        <LocalizedTechSpecsList
                            label="Danh sách thông số kỹ thuật"
                            value={formData.tech_specs_localized}
                            onChange={(value) =>
                                setFormData({ ...formData, tech_specs_localized: value })
                            }
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <StatusFormSection
                        isActive={formData.status === 'active'}
                        onActiveChange={(isActive) =>
                            setFormData({ ...formData, status: isActive ? 'active' : 'inactive' })
                        }
                        label="Trạng thái kinh doanh"
                        description="Cho phép sản phẩm hiển thị trên các danh mục bán hàng."
                    />

                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Phân loại sản phẩm
                        </h3>
                        <div className="space-y-3">
                            <Label
                                htmlFor="category_id"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Danh mục *
                            </Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category_id: value })
                                }
                            >
                                <SelectTrigger className="h-14 bg-slate-50 border-none rounded-none text-sm font-bold shadow-none focus:ring-1 focus:ring-brand-primary/20">
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-slate-100">
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                            className="text-sm font-bold rounded-none"
                                        >
                                            {getLocalizedValue(cat.name_localized, 'vi') || cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Thông tin bổ sung
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="origin"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Xuất xứ
                                </Label>
                                <Input
                                    id="origin"
                                    placeholder="VD: OKM Japan"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.origin}
                                    onChange={(e) =>
                                        setFormData({ ...formData, origin: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="warranty"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Bảo hành
                                </Label>
                                <Input
                                    id="warranty"
                                    placeholder="12 tháng"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.warranty}
                                    onChange={(e) =>
                                        setFormData({ ...formData, warranty: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="availability"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Tình trạng kho
                                </Label>
                                <Input
                                    id="availability"
                                    placeholder="Sẵn hàng"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.availability}
                                    onChange={(e) =>
                                        setFormData({ ...formData, availability: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="catalog_url"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Link Catalogue (PDF)
                                </Label>
                                <Input
                                    id="catalog_url"
                                    placeholder="https://..."
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.catalog_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, catalog_url: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Hình ảnh sản phẩm
                        </h3>
                        <ImageUploader
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            gallery={formData.gallery}
                            onGalleryChange={(urls) => setFormData({ ...formData, gallery: urls })}
                        />
                    </div>

                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <Checkbox
                                id="is_featured"
                                className="w-4 h-4 rounded-none border-slate-400 bg-white data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_featured: !!checked })
                                }
                            />
                            <Label
                                htmlFor="is_featured"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-900 cursor-pointer"
                            >
                                Sản phẩm nổi bật
                            </Label>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Đánh dấu để hiển thị sản phẩm tại trang chủ.
                        </p>
                    </div>

                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10">
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Thông tin sản phẩm được đồng bộ với database CMS Sài Gòn Valve.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
