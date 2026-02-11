'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_ROUTES, PORTAL_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import {
    ArrowLeft,
    Save,
    Loader2,
    Eye,
    X,
    User,
    CalendarDays,
    Clock,
    Share2,
    Printer,
    Facebook,
    Linkedin,
    Twitter,
    Bookmark,
    MoveRight,
    FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/portal/rich-text-editor';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusFormSection } from '@/components/portal/status-form-section';
import { ImageUploader } from '@/components/portal/ImageUploader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { generateSlug } from '@/utils/slug';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    category_id: string;
    author_id: string;
    status: string;
    image_url: string | null;
    gallery: string[] | null;
    published_at: string | null;
}

export default function EditNewsPage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category_id: '',
        author_id: '',
        status: 'draft' as 'draft' | 'published',
        image_url: '',
        gallery: [] as string[],
        published_at: undefined as Date | undefined,
    });

    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [recentArticles, setRecentArticles] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch article, categories and authors in parallel
                const [articleRes, catRes, authorRes] = await Promise.all([
                    $api.get(`${API_ROUTES.NEWS}/${newsId}`),
                    $api.get(`${API_ROUTES.CATEGORIES}?type=news`),
                    $api.get(`${API_ROUTES.AUTHORS}`),
                ]);

                if (articleRes.data.success) {
                    const a = articleRes.data.data;
                    setArticle(a);
                    setFormData({
                        title: a.title || '',
                        slug: a.slug || '',
                        summary: a.summary || '',
                        content: a.content || '',
                        category_id: a.category_id || '',
                        author_id: a.author_id || authorRes.data.data?.[0]?.id || '',
                        status: a.status || 'draft',
                        image_url: a.image_url || '',
                        gallery: Array.isArray(a.gallery) ? a.gallery : [],
                        published_at: a.published_at ? new Date(a.published_at) : undefined,
                    });
                }

                if (catRes.data.success) {
                    setCategories(catRes.data.data || []);
                }

                // Fetch recent articles for preview sidebar
                const recentRes = await $api.get(`${API_ROUTES.NEWS}?limit=5`);
                if (recentRes.data.success) {
                    setRecentArticles(recentRes.data.data);
                }

                // If no author_id set, try to use the first one from author list
                if (
                    authorRes.data.success &&
                    authorRes.data.data?.length > 0 &&
                    !formData.author_id
                ) {
                    setFormData((prev) => ({ ...prev, author_id: authorRes.data.data[0].id }));
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                toast.error('Không thể tải thông tin bài viết');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [newsId]);

    const handleTitleChange = (title: string) => {
        const slug = generateSlug(title);

        setFormData((prev) => ({
            ...prev,
            title,
            slug: prev.slug === '' || prev.slug === generateSlug(prev.title) ? slug : prev.slug,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const submissionData = {
                ...formData,
                published_at: formData.published_at ? formData.published_at.toISOString() : null,
            };
            const response = await $api.patch(`${API_ROUTES.NEWS}/${newsId}`, submissionData);
            if (response.data.success) {
                toast.success('Cập nhật bài viết thành công!');
                router.push(PORTAL_ROUTES.cms.news.list);
            }
        } catch (error) {
            console.error('Error updating article:', error);
            toast.error('Không thể cập nhật bài viết');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="mt-4 text-slate-500 font-medium italic animate-pulse">
                    Đang tải thông tin bài viết...
                </p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-slate-500 font-medium">Không tìm thấy bài viết.</p>
                <Link href={PORTAL_ROUTES.cms.news.list}>
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
                    <Link href={PORTAL_ROUTES.cms.news.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                            disabled={saving}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            Chỉnh sửa bài viết
                        </h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-sm">
                            Cập nhật nội dung bài viết tin tức và chuẩn hóa dữ liệu.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="text-[10px] font-black uppercase tracking-widest px-6 py-4 h-auto border-slate-100 rounded-none text-slate-500"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Hủy thay đổi
                    </Button>

                    <Tabs
                        value={viewMode}
                        onValueChange={(v) => setViewMode(v as any)}
                        className="bg-slate-100 p-1 rounded-none border border-slate-200"
                    >
                        <TabsList className="bg-transparent h-10 gap-1 rounded-none shadow-none p-0 ">
                            <TabsTrigger
                                value="edit"
                                className="rounded-none data-[state=active]:bg-white hover:cursor-pointer data-[state=active]:text-brand-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest px-4 h-full"
                            >
                                <FileEdit size={14} className="mr-2" /> Soạn thảo
                            </TabsTrigger>
                            <TabsTrigger
                                value="preview"
                                className="rounded-none data-[state=active]:bg-white hover:cursor-pointer data-[state=active]:text-brand-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest px-4 h-full"
                            >
                                <Eye size={14} className="mr-2" /> Xem trước
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-brand-primary hover:bg-brand-secondary text-[10px] font-black uppercase tracking-widest px-8 py-4 hover:cursor-pointer h-auto transition-all rounded-none"
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

            {viewMode === 'preview' ? (
                <div className="bg-white border border-slate-100 min-h-[800px] overflow-hidden">
                    {/* Simulated Public Site Content */}
                    <div className="flex flex-col min-h-full">
                        {/* Article Header */}
                        <section className="pt-20 pb-12 border-b border-slate-100 px-8 bg-slate-50/30">
                            <div className="container mx-auto space-y-6">
                                <div className="inline-flex items-center bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary rounded-none">
                                    {categories.find((c) => c.id === formData.category_id)?.name ||
                                        'Danh mục'}
                                </div>

                                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                    {formData.title || 'Tiêu đề bài viết'}
                                </h1>

                                <div className="flex flex-wrap items-center gap-y-4 gap-6 pt-4 border-t border-slate-100 text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white border border-slate-100 flex items-center justify-center text-slate-400 rounded-none">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Tác giả
                                            </div>
                                            <div className="text-xs font-bold text-slate-900">
                                                Quản trị viên
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white border border-slate-100 flex items-center justify-center text-slate-400 rounded-none">
                                            <CalendarDays size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Ngày đăng
                                            </div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {formData.published_at
                                                    ? format(formData.published_at, 'dd/MM/yyyy', {
                                                          locale: vi,
                                                      })
                                                    : 'Đang cập nhật'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white border border-slate-100 flex items-center justify-center text-slate-400 rounded-none">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Thời gian đọc
                                            </div>
                                            <div className="text-xs font-bold text-slate-900">
                                                3 phút đọc
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-auto flex items-center gap-2">
                                        <button
                                            title="Chia sẻ"
                                            className="h-9 w-9 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-default rounded-none"
                                        >
                                            <Share2 size={16} />
                                        </button>
                                        <button
                                            title="In"
                                            className="h-9 w-9 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-default rounded-none"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Layout Grid */}
                        <section className="py-12 px-8 grow">
                            <div className="container mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    {/* Main Content */}
                                    <div className="lg:col-span-8 space-y-8">
                                        {formData.image_url && (
                                            <div className="relative aspect-video overflow-hidden shadow-lg mb-8 rounded-none">
                                                <Image
                                                    src={formData.image_url}
                                                    alt="Featured"
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}

                                        <p className="text-xl sm:text-2xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-brand-primary pl-8">
                                            {formData.summary ||
                                                'Bản tóm tắt bài viết sẽ hiển thị ở đây...'}
                                        </p>

                                        <div
                                            className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand-primary hover:prose-a:text-brand-secondary prose-img:rounded-none"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    formData.content ||
                                                    `<p className="italic text-slate-400">Nội dung bài viết đang được soạn thảo...</p>`,
                                            }}
                                        />

                                        {/* Share & Actions */}
                                        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                                            <div className="flex gap-4 items-center">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Chia sẻ bài viết:
                                                </span>
                                                <div className="flex gap-2">
                                                    {[Facebook, Linkedin, Twitter].map(
                                                        (Icon, i) => (
                                                            <button
                                                                key={i}
                                                                className="h-8 w-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-brand-primary hover:text-white transition-all cursor-default rounded-none border border-slate-100"
                                                            >
                                                                <Icon size={14} />
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 px-5 py-2.5 hover:bg-slate-200 transition-all cursor-default rounded-none border border-slate-100">
                                                    <Bookmark size={14} /> Lưu bài viết
                                                </button>
                                                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary px-5 py-2.5 hover:bg-brand-secondary transition-all cursor-default rounded-none">
                                                    Liên hệ tư vấn <MoveRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real Sidebar Emulation */}
                                    <aside className="lg:col-span-4 space-y-12">
                                        {/* Categories */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                                <span className="w-8 h-[2px] bg-brand-primary"></span>{' '}
                                                Danh mục
                                            </h3>
                                            <div className="flex flex-col border-t border-slate-100">
                                                {categories.map((cat: any) => (
                                                    <div
                                                        key={cat.id}
                                                        className="group flex items-center justify-between py-4 border-b border-slate-100 hover:pl-2 transition-all cursor-default"
                                                    >
                                                        <span className="text-sm font-bold text-slate-600 group-hover:text-brand-primary transition-colors">
                                                            {cat.name}
                                                        </span>
                                                        <MoveRight
                                                            size={14}
                                                            className="text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recent News */}
                                        <div className="space-y-8">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                                <span className="w-8 h-[2px] bg-brand-primary"></span>{' '}
                                                Tin mới nhất
                                            </h3>
                                            <div className="space-y-6">
                                                {recentArticles.map((ra: any) => (
                                                    <div
                                                        key={ra.id}
                                                        className="group block space-y-2 cursor-default"
                                                    >
                                                        <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">
                                                            {ra.published_at
                                                                ? format(
                                                                      ra.published_at,
                                                                      'dd/MM/yyyy',
                                                                      { locale: vi },
                                                                  )
                                                                : 'Đang cập nhật'}
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-snug tracking-tight">
                                                            {ra.title}
                                                        </h4>
                                                        <div className="h-px w-0 group-hover:w-full bg-slate-100 transition-all duration-500"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
                >
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="title"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Tiêu đề bài viết *
                                </Label>
                                <Input
                                    id="title"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
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
                                    htmlFor="summary"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Mô tả ngắn *
                                </Label>
                                <Textarea
                                    id="summary"
                                    className="min-h-[100px] bg-slate-50 border-none text-sm font-medium rounded-none placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20"
                                    value={formData.summary}
                                    onChange={(e) =>
                                        setFormData({ ...formData, summary: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <Label
                                    htmlFor="content"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Nội dung bài viết *
                                </Label>
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content: string) =>
                                        setFormData({ ...formData, content })
                                    }
                                    placeholder="Nhập nội dung chi tiết của bài viết..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <StatusFormSection
                            isActive={formData.status === 'published'}
                            onActiveChange={(isActive) =>
                                setFormData({
                                    ...formData,
                                    status: isActive ? 'published' : 'draft',
                                })
                            }
                            label="Trạng thái xuất bản"
                            description="Cho phép bài viết hiển thị công khai trên website."
                        />

                        <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                                Phân loại & Thời gian
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
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Ngày xuất bản
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'h-14 w-full justify-start text-left font-bold bg-slate-50 border-none rounded-none shadow-none focus:ring-1 focus:ring-brand-primary/20',
                                                !formData.published_at && 'text-slate-300',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.published_at ? (
                                                format(formData.published_at, 'PPP', { locale: vi })
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 rounded-none border-slate-100"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.published_at}
                                            onSelect={(date) =>
                                                setFormData({ ...formData, published_at: date })
                                            }
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                                Hình ảnh bài viết
                            </h3>
                            <ImageUploader
                                value={formData.image_url}
                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                                gallery={formData.gallery}
                                onGalleryChange={(urls) =>
                                    setFormData({ ...formData, gallery: urls })
                                }
                            />
                        </div>

                        <div className="p-6 bg-brand-primary/5 border border-brand-primary/10">
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                Dữ liệu được chuẩn hóa theo cấu trúc database CMS. Tác giả được tự
                                động gán là quản trị viên.
                            </p>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
