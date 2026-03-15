'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import $api from '@/utils/axios';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/portal/rich-text-editor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { generateSlug } from '@/utils/slug';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PORTAL_ROUTES, API_ROUTES } from '@/constants/routes';
import { StatusFormSection } from '@/components/portal/status-form-section';
import { toast } from 'sonner';

export default function EditJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        requirements: '',
        benefits: '',
        location: '',
        employment_type: 'full_time',
        salary_range: '',
        experience_level: '',
        department: '',
        status: 'open' as 'open' | 'closed',
        deadline: undefined as Date | undefined,
    });

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            try {
                const res = await $api.get(`${API_ROUTES.JOBS}/${jobId}`);
                const job = res.data.data;
                if (job) {
                    setFormData({
                        title: job.title || '',
                        slug: job.slug || '',
                        description: job.description || '',
                        requirements: job.requirements || '',
                        benefits: job.benefits || '',
                        location: job.location || '',
                        employment_type: job.employment_type || 'full_time',
                        salary_range: job.salary_range || '',
                        experience_level: job.experience_level || '',
                        department: job.department || '',
                        status: job.status || 'open',
                        deadline: job.deadline ? new Date(job.deadline) : undefined,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch job', error);
                toast.error('Không thể tải thông tin tuyển dụng');
            } finally {
                setIsLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

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
        if (!formData.title || !formData.slug || !formData.description) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = {
                ...formData,
                deadline: formData.deadline ? formData.deadline.toISOString() : null,
            };
            await $api.patch(`${API_ROUTES.JOBS}/${jobId}`, submissionData);
            toast.success('Cập nhật tin tuyển dụng thành công');
            router.push(PORTAL_ROUTES.cms.jobs.list);
        } catch (error: any) {
            console.error(error);
            const message =
                error.response?.data?.error || error.message || 'Lỗi khi cập nhật tin tuyển dụng';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.jobs.list}>
                        <Button
                            variant="outline"
                            className="h-14 w-14 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                            Chỉnh sửa tin tuyển dụng
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            Cập nhật thông tin tin tuyển dụng.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-14 px-8 bg-brand-primary hover:bg-brand-secondary text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                    {isSubmitting ? (
                        <Loader2 size={18} className="mr-3 animate-spin" />
                    ) : (
                        <Save size={18} className="mr-3" />
                    )}
                    Lưu thay đổi
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="title"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Tiêu đề *
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="VD: Kỹ sư Tự động hóa"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="slug"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Đường dẫn (Slug) *
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="ky-su-tu-dong-hoa"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="description"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Mô tả công việc *
                                </Label>
                                <RichTextEditor
                                    content={formData.description}
                                    onChange={(val) =>
                                        setFormData({ ...formData, description: val })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="requirements"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Yêu cầu ứng viên
                                </Label>
                                <RichTextEditor
                                    content={formData.requirements}
                                    onChange={(val) =>
                                        setFormData({ ...formData, requirements: val })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="benefits"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Quyền lợi
                                </Label>
                                <RichTextEditor
                                    content={formData.benefits}
                                    onChange={(val) => setFormData({ ...formData, benefits: val })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <StatusFormSection
                        isActive={formData.status === 'open'}
                        onActiveChange={(isActive) =>
                            setFormData({ ...formData, status: isActive ? 'open' : 'closed' })
                        }
                        label="Trạng thái tuyển dụng"
                        description="Tin tuyển dụng đang tuyển sẽ hiển thị trên website."
                    />

                    <div className="bg-white rounded-none border border-slate-100 p-8 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Chi tiết vị trí
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="department"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Phòng ban
                                </Label>
                                <Input
                                    id="department"
                                    placeholder="VD: Kỹ thuật"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.department}
                                    onChange={(e) =>
                                        setFormData({ ...formData, department: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="location"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Địa điểm
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="VD: TP. Hồ Chí Minh"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="employment_type"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Loại hình
                                </Label>
                                <Select
                                    value={formData.employment_type}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, employment_type: value })
                                    }
                                >
                                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-none text-sm font-bold">
                                        <SelectValue placeholder="Chọn loại hình" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value="full_time">Toàn thời gian</SelectItem>
                                        <SelectItem value="part_time">Bán thời gian</SelectItem>
                                        <SelectItem value="contract">Hợp đồng</SelectItem>
                                        <SelectItem value="internship">Thực tập</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="salary_range"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Mức lương
                                </Label>
                                <Input
                                    id="salary_range"
                                    placeholder="VD: 15-25 triệu VND"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.salary_range}
                                    onChange={(e) =>
                                        setFormData({ ...formData, salary_range: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="experience_level"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Kinh nghiệm
                                </Label>
                                <Input
                                    id="experience_level"
                                    placeholder="VD: 2-3 năm"
                                    className="h-14 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.experience_level}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            experience_level: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <Label
                                    htmlFor="deadline"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Hạn nộp hồ sơ
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                                'h-14 w-full justify-start text-left font-bold bg-slate-50 border-none rounded-none shadow-none focus:ring-1 focus:ring-brand-primary/20',
                                                !formData.deadline && 'text-slate-300',
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.deadline ? (
                                                format(formData.deadline, 'PPP', { locale: vi })
                                            ) : (
                                                <span>Chọn ngày kết thúc</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0 rounded-none border-slate-100"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={formData.deadline}
                                            onSelect={(date) =>
                                                setFormData({ ...formData, deadline: date })
                                            }
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
