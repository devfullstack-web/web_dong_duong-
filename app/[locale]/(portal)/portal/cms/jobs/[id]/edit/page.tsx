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
import { LocalizedInput } from '@/components/portal/LocalizedInput';
import { LocalizedRichTextEditor } from '@/components/portal/LocalizedRichTextEditor';
import { createEmptyLocalizedText, toLocalizedText, type LocalizedText } from '@/types/i18n';
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
import { useQueryClient } from '@tanstack/react-query';
import { EMPLOYMENT_TYPE, JOB_STATUS, type EmploymentType, type JobStatus } from '@/constants/content';

export default function EditJobPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const jobId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title_localized: createEmptyLocalizedText(),
        slug: '',
        description_localized: createEmptyLocalizedText(),
        requirements_localized: createEmptyLocalizedText(),
        benefits_localized: createEmptyLocalizedText(),
        location: '',
        employment_type: EMPLOYMENT_TYPE.FULL_TIME as EmploymentType,
        salary_range: '',
        experience_level: '',
        department: '',
        status: JOB_STATUS.OPEN as JobStatus,
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
                        title_localized: job.title_localized || toLocalizedText(job.title),
                        slug: job.slug || '',
                        description_localized: job.description_localized || toLocalizedText(job.description),
                        requirements_localized: job.requirements_localized || toLocalizedText(job.requirements),
                        benefits_localized: job.benefits_localized || toLocalizedText(job.benefits),
                        location: job.location || '',
                        employment_type: job.employment_type || EMPLOYMENT_TYPE.FULL_TIME,
                        salary_range: job.salary_range || '',
                        experience_level: job.experience_level || '',
                        department: job.department || '',
                        status: job.status || JOB_STATUS.OPEN,
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

    const handleTitleChange = (title_localized: LocalizedText) => {
        const slug = generateSlug(title_localized.vi);
        setFormData((prev) => ({
            ...prev,
            title_localized,
            slug: prev.slug === '' || prev.slug === generateSlug(prev.title_localized.vi) ? slug : prev.slug,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.title_localized.vi || !formData.slug || !formData.description_localized.vi) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Đường dẫn, Mô tả)');
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionData = {
                title: formData.title_localized.vi,
                title_localized: formData.title_localized,
                slug: formData.slug,
                description: formData.description_localized.vi,
                description_localized: formData.description_localized,
                requirements: formData.requirements_localized.vi,
                requirements_localized: formData.requirements_localized,
                benefits: formData.benefits_localized.vi,
                benefits_localized: formData.benefits_localized,
                location: formData.location,
                employment_type: formData.employment_type,
                salary_range: formData.salary_range,
                experience_level: formData.experience_level,
                department: formData.department,
                status: formData.status,
                deadline: formData.deadline ? formData.deadline.toISOString() : null,
            };
            await $api.patch(`${API_ROUTES.JOBS}/${jobId}`, submissionData);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
            toast.success('Cập nhật tin tuyển dụng thành công');
            router.push(PORTAL_ROUTES.cms.jobs.list);
        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { error?: string } }; message?: string };
            const message = err.response?.data?.error || err.message || 'Lỗi khi cập nhật tin tuyển dụng';
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href={PORTAL_ROUTES.cms.jobs.list}>
                        <Button
                            variant="outline"
                            className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50"
                        >
                            <ArrowLeft size={16} />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 border-l-4 border-brand-primary pl-3">
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
                    className="h-10 px-6 bg-brand-primary hover:bg-brand-secondary text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                    {isSubmitting ? (
                        <Loader2 size={16} className="mr-2 animate-spin" />
                    ) : (
                        <Save size={16} className="mr-2" />
                    )}
                    Lưu thay đổi
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-none border border-slate-100 p-5 md:p-6 space-y-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-4">
                            <LocalizedInput
                                id="title"
                                label="Tiêu đề tin tuyển dụng"
                                value={formData.title_localized}
                                onChange={handleTitleChange}
                                required
                                placeholder={{
                                    vi: 'VD: Kỹ sư Tự động hóa...',
                                    en: 'E.g.: Automation Engineer...',
                                    zh: '例如: 自动化工程师...',
                                }}
                            />
                            <div className="space-y-2">
                                <Label
                                    htmlFor="slug"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Đường dẫn (Slug) *
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="ky-su-tu-dong-hoa"
                                    className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                />
                            </div>
                            <LocalizedRichTextEditor
                                id="description"
                                label="Mô tả công việc"
                                value={formData.description_localized}
                                onChange={(val) =>
                                    setFormData({ ...formData, description_localized: val })
                                }
                                required
                                placeholder="Mô tả chi tiết công việc..."
                            />
                            <LocalizedRichTextEditor
                                id="requirements"
                                label="Yêu cầu ứng viên"
                                value={formData.requirements_localized}
                                onChange={(val) =>
                                    setFormData({ ...formData, requirements_localized: val })
                                }
                                placeholder="Yêu cầu năng lực, kinh nghiệm..."
                            />
                            <LocalizedRichTextEditor
                                id="benefits"
                                label="Quyền lợi & Đãi ngộ"
                                value={formData.benefits_localized}
                                onChange={(val) =>
                                    setFormData({ ...formData, benefits_localized: val })
                                }
                                placeholder="Chế độ bảo hiểm, thưởng, đào tạo..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <StatusFormSection
                        isActive={formData.status === JOB_STATUS.OPEN}
                        onActiveChange={(isActive) =>
                            setFormData({
                                ...formData,
                                status: isActive ? JOB_STATUS.OPEN : JOB_STATUS.CLOSED,
                            })
                        }
                        label="Trạng thái tuyển dụng"
                        description="Tin tuyển dụng đang tuyển sẽ hiển thị trên website."
                    />

                    <div className="bg-white rounded-none border border-slate-100 p-5 md:p-6 space-y-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            Chi tiết vị trí
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="department"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Phòng ban
                                </Label>
                                <Input
                                    id="department"
                                    placeholder="VD: Kỹ thuật"
                                    className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.department}
                                    onChange={(e) =>
                                        setFormData({ ...formData, department: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Địa điểm
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="VD: TP. Hồ Chí Minh"
                                    className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="employment_type"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Loại hình
                                </Label>
                                <Select
                                    value={formData.employment_type}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            employment_type: value as EmploymentType,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-none rounded-none text-sm font-bold">
                                        <SelectValue placeholder="Chọn loại hình" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
                                        <SelectItem value={EMPLOYMENT_TYPE.FULL_TIME}>
                                            Toàn thời gian
                                        </SelectItem>
                                        <SelectItem value={EMPLOYMENT_TYPE.PART_TIME}>
                                            Bán thời gian
                                        </SelectItem>
                                        <SelectItem value={EMPLOYMENT_TYPE.CONTRACT}>
                                            Hợp đồng
                                        </SelectItem>
                                        <SelectItem value={EMPLOYMENT_TYPE.INTERNSHIP}>
                                            Thực tập
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="salary_range"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Mức lương
                                </Label>
                                <Input
                                    id="salary_range"
                                    placeholder="VD: 15-25 triệu VND"
                                    className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.salary_range}
                                    onChange={(e) =>
                                        setFormData({ ...formData, salary_range: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="experience_level"
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500"
                                >
                                    Kinh nghiệm
                                </Label>
                                <Input
                                    id="experience_level"
                                    placeholder="VD: 2-3 năm"
                                    className="h-11 bg-slate-50 border-none text-sm font-bold rounded-none"
                                    value={formData.experience_level}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            experience_level: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
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
                                                'h-11 w-full justify-start text-left font-bold bg-slate-50 border-none rounded-none shadow-none focus:ring-1 focus:ring-brand-primary/20',
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
