'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { StatusFormSection } from '@/components/portal/status-form-section';
import { ImageUploader } from '@/components/portal/ImageUploader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { generateSlug } from '@/utils/slug';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import $api from '@/utils/axios';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    client_name: string | null;
    start_date: string | null;
    end_date: string | null;
    category_id: string;
    status: string;
    image_url: string | null;
    gallery: string[] | null;
}

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [project, setProject] = React.useState<Project | null>(null);
    const [categories, setCategories] = React.useState<any[]>([]);

    const [formData, setFormData] = React.useState({
        name: '',
        slug: '',
        description: '',
        client_name: '',
        start_date: undefined as Date | undefined,
        end_date: undefined as Date | undefined,
        category_id: '',
        status: 'ongoing',
        image: '',
        gallery: [] as string[],
    });

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch project by ID
                const projectRes = await $api.get(`${API_ROUTES.PROJECTS}/${projectId}`);
                if (projectRes.data.success) {
                    const p = projectRes.data.data;
                    setProject(p);
                    setFormData({
                        name: p.name || '',
                        slug: p.slug || '',
                        description: p.description || '',
                        client_name: p.client_name || '',
                        start_date: p.start_date ? new Date(p.start_date) : undefined,
                        end_date: p.end_date ? new Date(p.end_date) : undefined,
                        category_id: p.category_id || '',
                        status: p.status || 'ongoing',
                        image: p.image_url || '',
                        gallery: p.gallery || [],
                    });
                }

                // Fetch categories
                const catRes = await $api.get(`${API_ROUTES.CATEGORIES}?type=project`);
                if (catRes.data.success) {
                    setCategories(catRes.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching project:', error);
                toast.error('Không thể tải thông tin dự án');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const submissionData = {
                ...formData,
                start_date: formData.start_date?.toISOString() || null,
                end_date: formData.end_date?.toISOString() || null,
                image_url: formData.image,
            };
            const response = await $api.patch(
                `${API_ROUTES.PROJECTS}/${projectId}`,
                submissionData,
            );
            if (response.data.success) {
                toast.success('Cập nhật dự án thành công!');
                router.push(PORTAL_ROUTES.cms.projects.list);
            }
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Không thể cập nhật dự án');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy dự án.</p>
                <Link href={PORTAL_ROUTES.cms.projects.list}>
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
                    <Link href={PORTAL_ROUTES.cms.projects.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Chỉnh sửa dự án
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Cập nhật thông tin dự án và chuẩn hóa dữ liệu.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="text-[10px] font-black uppercase tracking-widest px-6 py-4 hover:cursor-pointer h-auto bord  er-slate-100 rounded-none text-slate-500"
                    >
                        Hủy thay đổi
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 h-auto transition-all rounded-none hover:cursor-pointer"
                    >
                        {saving ? (
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
                        <div className="space-y-3">
                            <Label
                                htmlFor="name"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Tên dự án *
                            </Label>
                            <Input
                                id="name"
                                className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                value={formData.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const slug = generateSlug(name);

                                    setFormData((prev) => ({
                                        ...prev,
                                        name,
                                        slug:
                                            prev.slug === '' ||
                                            prev.slug === generateSlug(prev.name)
                                                ? slug
                                                : prev.slug,
                                    }));
                                }}
                                required
                            />
                        </div>

                        <div className="space-y-3">
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

                        <div className="space-y-3">
                            <Label
                                htmlFor="description"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Mô tả dự án *
                            </Label>
                            <RichTextEditor
                                content={formData.description}
                                onChange={(content: string) =>
                                    setFormData({ ...formData, description: content })
                                }
                                placeholder="Mô tả chi tiết về dự án, phạm vi công việc..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label
                                htmlFor="client_name"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                            >
                                Tên khách hàng / Chủ đầu tư
                            </Label>
                            <Input
                                id="client_name"
                                placeholder="Ví dụ: Tập đoàn ABC"
                                className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                value={formData.client_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, client_name: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Thời gian thực hiện dự án
                            </Label>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={'outline'}
                                            className={cn(
                                                'h-14 w-full sm:w-[350px] justify-start text-left font-bold bg-slate-50 border-none rounded-none shadow-none focus:ring-1 focus:ring-brand-primary/20',
                                                !formData.start_date && 'text-slate-300',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.start_date ? (
                                                formData.end_date ? (
                                                    <>
                                                        {format(formData.start_date, 'dd/MM/yyyy', {
                                                            locale: vi,
                                                        })}{' '}
                                                        -{' '}
                                                        {format(formData.end_date, 'dd/MM/yyyy', {
                                                            locale: vi,
                                                        })}
                                                    </>
                                                ) : (
                                                    format(formData.start_date, 'dd/MM/yyyy', {
                                                        locale: vi,
                                                    })
                                                )
                                            ) : (
                                                <span>Chọn khoảng thời gian dự án</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 rounded-none border border-slate-100 shadow-xl"
                                        align="start"
                                    >
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={formData.start_date}
                                            selected={{
                                                from: formData.start_date,
                                                to: formData.end_date,
                                            }}
                                            onSelect={(range) => {
                                                setFormData({
                                                    ...formData,
                                                    start_date: range?.from,
                                                    end_date: range?.to,
                                                });
                                            }}
                                            numberOfMonths={2}
                                            locale={vi}
                                            className="rounded-none bg-white"
                                        />
                                        {(formData.start_date || formData.end_date) && (
                                            <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            start_date: undefined,
                                                            end_date: undefined,
                                                        })
                                                    }
                                                >
                                                    <X className="mr-2 size-3" /> Xóa ngày
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                    * Chọn ngày bắt đầu và ngày kết thúc (nếu có)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <StatusFormSection
                        isActive={formData.status === 'completed'}
                        onActiveChange={(isActive) =>
                            setFormData({ ...formData, status: isActive ? 'completed' : 'ongoing' })
                        }
                        label="Trạng thái hoàn thành"
                        description="Đánh dấu dự án đã hoàn thành và bàn giao."
                    />

                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Phân loại dự án
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
                            Hình ảnh dự án
                        </h3>
                        <ImageUploader
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            gallery={formData.gallery}
                            onGalleryChange={(urls) => setFormData({ ...formData, gallery: urls })}
                        />
                    </div>

                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10">
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Thông tin dự án được chuẩn hóa theo cấu trúc database CMS.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
