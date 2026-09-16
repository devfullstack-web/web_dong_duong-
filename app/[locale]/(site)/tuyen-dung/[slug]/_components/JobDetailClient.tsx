'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import Link from 'next/link';
import {
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    ArrowLeft,
    Send,
    Building2,
    Users,
    CheckCircle,
    Share2,
    Bookmark,
} from 'lucide-react';
import { SITE_ROUTES, API_ROUTES } from '@/constants/routes';
import $api from '@/utils/axios';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useSiteInfo } from '@/components/providers/site-info-provider';
import { Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'motion/react';
import { sanitizeRichText } from '@/utils/sanitize';
import { EMPLOYMENT_TYPE, JOB_STATUS, type EmploymentType, type JobStatus } from '@/constants/content';
import { getLocalizedValue, type LocalizedText, type Locale } from '@/types/i18n';

interface JobDetailClientProps {
    job: {
        id: string;
        title: string;
        title_localized?: LocalizedText | null;
        slug: string;
        description: string;
        description_localized?: LocalizedText | null;
        requirements: string | null;
        requirements_localized?: LocalizedText | null;
        benefits: string | null;
        benefits_localized?: LocalizedText | null;
        location: string | null;
        employment_type: EmploymentType;
        salary_range: string | null;
        experience_level: string | null;
        department: string | null;
        status: JobStatus;
        deadline: Date | null;
        created_at: Date;
    };
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
    const COMPANY_INFO = useSiteInfo();
    const locale = useLocale();
    const isVi = locale === 'vi';
    const isZh = locale === 'zh';
    const dateLocale = isZh ? zhCN : isVi ? vi : enUS;

    const tJob = (viText: string, enText: string, zhText: string) => {
        if (isZh) return zhText;
        if (isVi) return viText;
        return enText;
    };

    const employmentLabel = {
        [EMPLOYMENT_TYPE.FULL_TIME]: tJob('Toàn thời gian', 'Full Time', '全职'),
        [EMPLOYMENT_TYPE.PART_TIME]: tJob('Bán thời gian', 'Part Time', '兼职'),
        [EMPLOYMENT_TYPE.CONTRACT]: tJob('Hợp đồng', 'Contract', '合同工'),
        [EMPLOYMENT_TYPE.INTERNSHIP]: tJob('Thực tập', 'Internship', '实习生'),
    }[job.employment_type] || tJob('Toàn thời gian', 'Full Time', '全职');

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pt-20">
            {/* Hero Section */}
            <section className="bg-brand-primary py-12 sm:py-20 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="/uploads/images/2026/01/19/1768814857344-hfho0c.png"
                        alt="News Background"
                        fill
                        unoptimized
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-slate-950/80 via-slate-950/40 to-white/0"></div>
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl"></div>

                <div className="container relative z-10 mx-auto px-4 lg:px-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Link
                            href={SITE_ROUTES.RECRUITMENT}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft
                                size={16}
                                className="group-hover:-translate-x-1 transition-transform"
                            />
                            {tJob('Quay lại danh sách', 'Back to Jobs', '返回职位列表')}
                        </Link>
                    </motion.div>

                    <div className="max-w-4xl space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-accent px-3 py-1.5 rounded-full">
                                {job.department || tJob('Tổng hợp', 'General', '综合业务部')}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-white border border-white/20 px-3 py-1.5 rounded-full bg-white/5">
                                {employmentLabel}
                            </span>
                            {job.status === JOB_STATUS.CLOSED && (
                                <span className="text-xs font-bold uppercase tracking-wider text-white bg-red-500 px-3 py-1.5 rounded-full">
                                    {tJob('Đã đóng', 'Closed', '已结束招聘')}
                                </span>
                            )}
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
                        >
                            {getLocalizedValue(job.title_localized, locale as Locale) || job.title}
                        </motion.h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm sm:text-base font-medium text-slate-300">
                            <span className="flex items-center gap-2">
                                <MapPin size={18} className="text-brand-accent" />
                                {job.location || tJob('Việt Nam', 'Vietnam', '越南')}
                            </span>
                            {job.salary_range && (
                                <span className="flex items-center gap-2 border-l border-white/10 pl-8 hidden sm:flex">
                                    <DollarSign size={18} className="text-brand-accent" />
                                    {job.salary_range}
                                </span>
                            )}
                            {job.experience_level && (
                                <span className="flex items-center gap-2 border-l border-white/10 pl-8 hidden sm:flex">
                                    <Briefcase size={18} className="text-brand-accent" />
                                    {job.experience_level}
                                </span>
                            )}
                            {job.deadline && (
                                <span className="flex items-center gap-2 border-l border-white/10 pl-8 hidden sm:flex">
                                    <Clock size={18} className="text-brand-accent" />
                                    {tJob('Hạn:', 'Deadline:', '截止:')}{' '}
                                    {format(new Date(job.deadline), 'dd/MM/yyyy', { locale: dateLocale })}
                                </span>
                            )}
                        </div>

                        {/* Mobile quick info */}
                        <div className="sm:hidden grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-white/10">
                            {job.salary_range && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">
                                        {tJob('Mức lương', 'Salary', '薪资待遇')}
                                    </span>
                                    <span className="text-white text-sm sm:text-base font-bold">
                                        {job.salary_range}
                                    </span>
                                </div>
                            )}
                            {job.deadline && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">
                                        {tJob('Hạn nộp', 'Deadline', '截止日期')}
                                    </span>
                                    <span className="text-white text-sm sm:text-base font-bold">
                                        {format(new Date(job.deadline), 'dd/MM/yyyy', {
                                            locale: dateLocale,
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Job Info Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white p-8 sm:p-10 shadow-sm border border-slate-100 space-y-12"
                            >
                                {/* Description */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-8 bg-brand-primary"></div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {tJob('Mô tả công việc', 'Job Description', '岗位职责与工作描述')}
                                        </h2>
                                    </div>
                                    <div
                                        className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeRichText(
                                                getLocalizedValue(job.description_localized, locale as Locale) ||
                                                    job.description,
                                            ),
                                        }}
                                    />
                                </div>

                                {/* Requirements */}
                                {(getLocalizedValue(job.requirements_localized, locale as Locale) || job.requirements) && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-8 bg-brand-primary"></div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                {tJob('Yêu cầu ứng viên', 'Job Requirements', '任职资格与能力要求')}
                                            </h2>
                                        </div>
                                        <div
                                            className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeRichText(
                                                    getLocalizedValue(job.requirements_localized, locale as Locale) ||
                                                        (job.requirements as string),
                                                ),
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Benefits */}
                                {(getLocalizedValue(job.benefits_localized, locale as Locale) || job.benefits) && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-8 bg-brand-primary"></div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                {tJob('Quyền lợi ứng viên', 'Benefits & Perks', '薪酬福利与发展晋升')}
                                            </h2>
                                        </div>
                                        <div
                                            className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeRichText(
                                                    getLocalizedValue(job.benefits_localized, locale as Locale) ||
                                                        (job.benefits as string),
                                                ),
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Quick Actions Footer */}
                                <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-slate-200"
                                        >
                                            <Bookmark size={18} /> {tJob('Lưu tin', 'Save Job', '收藏职位')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-slate-200"
                                        >
                                            <Share2 size={18} /> {tJob('Chia sẻ', 'Share', '分享')}
                                        </Button>
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium italic">
                                        {tJob('Đăng ngày:', 'Posted on:', '发布日期:')}{' '}
                                        {format(new Date(job.created_at), 'dd/MM/yyyy', {
                                            locale: dateLocale,
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Apply Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                id="apply-form"
                                className="bg-white p-8 shadow-xl shadow-brand-primary/5 border border-slate-100 space-y-6 sticky top-28"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {tJob('Ứng tuyển nhanh', 'Quick Apply', '快速投递简历')}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {tJob('Hãy điền thông tin và đính kèm CV để chuyên viên tuyển dụng liên hệ với bạn.', 'Fill in your details and attach your CV to apply.', '请填写个人信息并上传简历，我们的人力资源团队将尽快与您联系。')}
                                    </p>
                                </div>

                                <ApplyForm jobId={job.id} locale={locale} />

                                <div className="pt-4 border-t border-slate-50 text-center">
                                    <p className="text-xs text-slate-500 font-medium">
                                        {tJob('Cần hỗ trợ? Gửi email tới', 'Need help? Send email to', '如有疑问请发送邮件至')} <br />
                                        <a
                                            href={`mailto:${COMPANY_INFO.email}`}
                                            className="text-brand-primary font-bold hover:underline"
                                        >
                                            {COMPANY_INFO.email}
                                        </a>
                                    </p>
                                </div>
                            </motion.div>

                            {/* Company Info */}
                            <div className="bg-slate-50 p-8 border border-slate-100 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                        <Building2 size={24} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                                            {COMPANY_INFO.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Since {COMPANY_INFO.foundedYear || 2015}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm font-medium text-slate-600">
                                    <div className="flex items-start gap-3">
                                        <MapPin
                                            size={18}
                                            className="text-brand-primary shrink-0 mt-0.5"
                                        />
                                        <span className="leading-relaxed">
                                            {COMPANY_INFO.address}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users
                                            size={18}
                                            className="text-brand-primary shrink-0 mt-0.5"
                                        />
                                        <span>{tJob('50 - 100 nhân sự', '50 - 100 employees', '50 - 100 名员工')}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock
                                            size={18}
                                            className="text-brand-primary shrink-0 mt-0.5"
                                        />
                                        <span>{COMPANY_INFO.workingHours?.weekdays || tJob('Thứ 2 - Thứ 6 (08:00 - 17:30)', 'Mon - Fri (08:00 - 17:30)', '周一至周五 (08:00 - 17:30)')}</span>
                                    </div>
                                </div>

                                <Link href={SITE_ROUTES.ABOUT} className="block">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-brand-primary hover:text-brand-secondary hover:bg-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        {tJob('Tìm hiểu thêm về chúng tôi', 'Learn more about us', '了解更多企业信息')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ApplyForm({ jobId, locale }: { jobId: string; locale: string }) {
    const isZh = locale === 'zh';
    const isEn = locale === 'en';
    const tForm = (viText: string, enText: string, zhText: string) => {
        if (isZh) return zhText;
        if (isEn) return enText;
        return viText;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        cv_url: '',
        cover_letter: '',
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(tForm('File quá lớn. Tối đa 5MB', 'File too large. Max 5MB', '文件过大，最大限制 5MB'));
                return;
            }
            const allowed = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowed.includes(file.type)) {
                toast.error(tForm('Chỉ chấp nhận file PDF, DOC, DOCX', 'Only PDF, DOC, DOCX files are allowed', '仅支持上传 PDF, DOC, DOCX 文件'));
                return;
            }
            setCvFile(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.full_name || !formData.email || !formData.phone || !cvFile) {
            toast.error(tForm('Vui lòng điền đủ thông tin và đính kèm CV', 'Please fill in all required fields and attach your CV', '请完整填写必填信息并上传简历文件'));
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('file', cvFile);
            data.append('job_id', jobId);
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            if (formData.cover_letter) {
                data.append('cover_letter', formData.cover_letter);
            }

            const response = await $api.post(API_ROUTES.APPLICATIONS, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                toast.success(tForm('Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ sớm.', 'Application submitted successfully! We will contact you soon.', '简历投递成功！我们将尽快与您取得联系。'));
                setFormData({ full_name: '', email: '', phone: '', cv_url: '', cover_letter: '' });
                setCvFile(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(tForm('Gặp lỗi khi nộp hồ sơ. Vui lòng thử lại.', 'Failed to submit application. Please try again.', '投递失败，请稍后重试。'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-slate-700">{tForm('Họ và tên *', 'Full name *', '姓名 *')}</Label>
                <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-50 border-slate-200 h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm sm:text-base font-medium"
                    placeholder={tForm('Ví dụ: Nguyễn Văn A', 'e.g. John Doe', '例如：张先生 / 李女士')}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">{tForm('Email *', 'Email *', '电子邮箱 *')}</Label>
                    <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-50 border-slate-200 h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm sm:text-base font-medium"
                        placeholder="example@mail.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700">{tForm('Số điện thoại *', 'Phone number *', '联系电话 *')}</Label>
                    <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-slate-50 border-slate-200 h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm sm:text-base font-medium"
                        placeholder="09xx xxx xxx"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-slate-700">
                    {tForm('Lời nhắn (không bắt buộc)', 'Cover letter (optional)', '求职留言（选填）')}
                </Label>
                <Textarea
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    className="bg-slate-50 border-slate-200 min-h-[100px] focus:ring-brand-primary placeholder:text-slate-400 text-sm sm:text-base font-medium py-3"
                    placeholder={tForm('Giới thiệu ngắn gọn sở trường của bạn...', 'Briefly introduce your strengths and expectations...', '简要介绍您的工作经验与专长...')}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-bold text-slate-700">{tForm('Hồ sơ (CV) *', 'Curriculum Vitae (CV) *', '个人简历 (CV) *')}</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center',
                        cvFile
                            ? 'bg-brand-primary/5 border-brand-primary'
                            : 'hover:border-brand-primary/50 hover:bg-slate-50',
                    )}
                >
                    {cvFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white">
                                <CheckCircle size={20} />
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-brand-primary truncate max-w-full italic px-2">
                                {cvFile.name}
                            </p>
                            <span className="text-xs text-slate-400 font-medium">
                                {tForm('Click để thay đổi file', 'Click to change file', '点击更换文件')}
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-primary/10 transition-colors">
                                <Upload className="size-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-600">{tForm('Bấm để tải lên CV', 'Click to upload CV', '点击上传简历')}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {tForm('Hỗ trợ PDF, DOC, DOCX (Tối đa 5MB)', 'Supports PDF, DOC, DOCX (Max 5MB)', '支持 PDF, DOC, DOCX 格式 (最大 5MB)')}
                            </p>
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white h-12 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> {tForm('Đang gửi hồ sơ...', 'Submitting application...', '正在投递简历...')}
                    </>
                ) : (
                    <>
                        {tForm('Nộp hồ sơ ngay', 'Submit Application', '立即投递')} <Send size={16} className="ml-2" />
                    </>
                )}
            </Button>
        </form>
    );
}
