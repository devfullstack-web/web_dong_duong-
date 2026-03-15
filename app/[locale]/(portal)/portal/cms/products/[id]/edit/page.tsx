'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package, Loader2 } from 'lucide-react';
import { generateSlug } from '@/utils/slug';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/portal/rich-text-editor';
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

interface Category {
    id: string;
    name: string;
}

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        sku: '',
        description: '',
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
        tech_summary: '',
        features: [''] as string[],
        tech_specs: [{ key: '', value: '' }] as { key: string; value: string }[],
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
                        name: product.name || '',
                        slug: product.slug || '',
                        sku: product.sku || '',
                        description: product.description || '',
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
                        tech_summary: product.tech_summary || '',
                        features:
                            Array.isArray(product.features) && product.features.length > 0
                                ? product.features
                                : [''],
                        tech_specs: product.tech_specs
                            ? Object.entries(product.tech_specs).map(([key, value]) => ({
                                  key,
                                  value: String(value),
                              }))
                            : [{ key: '', value: '' }],
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

    const handleNameChange = (name: string) => {
        const slug = generateSlug(name);

        setFormData((prev) => ({
            ...prev,
            name,
            slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? slug : prev.slug,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Transform tech_specs from array to object for API
            const specsObject: Record<string, string> = {};
            formData.tech_specs.forEach((spec) => {
                if (spec.key && spec.value) specsObject[spec.key] = spec.value;
            });

            const submissionData = {
                ...formData,
                tech_specs: specsObject,
                features: formData.features.filter((f) => f.trim() !== ''),
                image_url: formData.image,
                gallery: formData.gallery,
            };

            await $api.patch(`${API_ROUTES.PRODUCTS}/${productId}`, submissionData);

            toast.success('Cập nhật sản phẩm thành công');
            router.push(PORTAL_ROUTES.cms.products.list);
        } catch (error: any) {
            console.error(error);
            const message =
                error.response?.data?.error || error.message || 'Lỗi khi cập nhật sản phẩm';
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

    if (!formData.name && !isLoading) {
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
                            <div className="space-y-3">
                                <Label
                                    htmlFor="name"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Tên sản phẩm *
                                </Label>
                                <Input
                                    id="name"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    required
                                />
                            </div>
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

                        <div className="space-y-3">
                            <Label
                                htmlFor="description"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Mô tả sản phẩm
                            </Label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={(content: string) =>
                                    setFormData({ ...formData, description: content })
                                }
                                placeholder="Mô tả chi tiết về sản phẩm..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label
                                htmlFor="tech_summary"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Tóm tắt kỹ thuật (Dành cho trang chi tiết)
                            </Label>
                            <textarea
                                id="tech_summary"
                                placeholder="Ví dụ: Cung cấp đầy đủ chứng chỉ CO/CQ và hỗ trợ kỹ thuật tận nơi..."
                                className="w-full min-h-[80px] p-4 bg-slate-50 border-none text-sm font-medium rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                                value={formData.tech_summary}
                                onChange={(e) =>
                                    setFormData({ ...formData, tech_summary: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Đặc điểm nổi bật
                        </h3>
                        <div className="space-y-4">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="VD: Tiêu chuẩn Nhật Bản..."
                                        className="h-12 bg-slate-50 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                        value={feature}
                                        onChange={(e) => {
                                            const newFeatures = [...formData.features];
                                            newFeatures[index] = e.target.value;
                                            setFormData({ ...formData, features: newFeatures });
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                        onClick={() => {
                                            const newFeatures = formData.features.filter(
                                                (_, i) => i !== index,
                                            );
                                            setFormData({
                                                ...formData,
                                                features: newFeatures.length ? newFeatures : [''],
                                            });
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        features: [...formData.features, ''],
                                    })
                                }
                            >
                                + Thêm đặc điểm
                            </Button>
                        </div>
                    </div>

                    {/* Tech Specs Section */}
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Thông số kỹ thuật (Bảng)
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                    Tên thông số
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">
                                    Giá trị
                                </div>
                            </div>
                            {formData.tech_specs.map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="VD: Kích thước"
                                        className="h-12 bg-slate-50 border-none text-sm font-bold rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                        value={spec.key}
                                        onChange={(e) => {
                                            const newSpecs = [...formData.tech_specs];
                                            newSpecs[index].key = e.target.value;
                                            setFormData({ ...formData, tech_specs: newSpecs });
                                        }}
                                    />
                                    <Input
                                        placeholder="VD: DN50 - DN1200"
                                        className="h-12 bg-slate-100 border-none text-sm font-medium rounded-none focus:ring-1 focus:ring-brand-primary/20"
                                        value={spec.value}
                                        onChange={(e) => {
                                            const newSpecs = [...formData.tech_specs];
                                            newSpecs[index].value = e.target.value;
                                            setFormData({ ...formData, tech_specs: newSpecs });
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 w-12 rounded-none text-slate-400 hover:text-red-500"
                                        onClick={() => {
                                            const newSpecs = formData.tech_specs.filter(
                                                (_, i) => i !== index,
                                            );
                                            setFormData({
                                                ...formData,
                                                tech_specs: newSpecs.length
                                                    ? newSpecs
                                                    : [{ key: '', value: '' }],
                                            });
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary hover:border-brand-primary rounded-none"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        tech_specs: [
                                            ...formData.tech_specs,
                                            { key: '', value: '' },
                                        ],
                                    })
                                }
                            >
                                + Thêm thông số
                            </Button>
                        </div>
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
                                            {cat.name}
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
