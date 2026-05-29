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
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'motion/react';
import { sanitizeRichText } from '@/utils/sanitize';

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    contract: 'Hợp đồng',
    internship: 'Thực tập',
};

interface JobDetailClientProps {
    job: {
        id: string;
        title: string;
        slug: string;
        description: string;
        requirements: string | null;
        benefits: string | null;
        location: string | null;
        employment_type: string;
        salary_range: string | null;
        experience_level: string | null;
        department: string | null;
        status: 'open' | 'closed';
        deadline: Date | null;
        created_at: Date;
    };
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
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
                            Quay lại danh sách
                        </Link>
                    </motion.div>

                    <div className="max-w-4xl space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-brand-accent px-3 py-1.5 rounded-full">
                                {job.department || 'Tổng hợp'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 px-3 py-1.5 rounded-full bg-white/5">
                                {EMPLOYMENT_TYPE_LABELS[job.employment_type]}
                            </span>
                            {job.status === 'closed' && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-red-500 px-3 py-1.5 rounded-full">
                                    Đã đóng
                                </span>
                            )}
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
                        >
                            {job.title}
                        </motion.h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm font-medium text-slate-300">
                            <span className="flex items-center gap-2">
                                <MapPin size={18} className="text-brand-accent" />
                                {job.location || 'Việt Nam'}
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
                                    Hạn:{' '}
                                    {format(new Date(job.deadline), 'dd/MM/yyyy', { locale: vi })}
                                </span>
                            )}
                        </div>

                        {/* Mobile quick info */}
                        <div className="sm:hidden grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-white/10">
                            {job.salary_range && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        Mức lương
                                    </span>
                                    <span className="text-white text-sm font-bold">
                                        {job.salary_range}
                                    </span>
                                </div>
                            )}
                            {job.deadline && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                        Hạn nộp
                                    </span>
                                    <span className="text-white text-sm font-bold">
                                        {format(new Date(job.deadline), 'dd/MM/yyyy', {
                                            locale: vi,
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
                                            Mô tả công việc
                                        </h2>
                                    </div>
                                    <div
                                        className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(job.description) }}
                                    />
                                </div>

                                {/* Requirements */}
                                {job.requirements && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-8 bg-brand-primary"></div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Yêu cầu ứng viên
                                            </h2>
                                        </div>
                                        <div
                                            className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(job.requirements) }}
                                        />
                                    </div>
                                )}

                                {/* Benefits */}
                                {job.benefits && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-8 bg-brand-primary"></div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Quyền lợi ứng viên
                                            </h2>
                                        </div>
                                        <div
                                            className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(job.benefits) }}
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
                                            <Bookmark size={18} /> Lưu tin
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="gap-2 border-slate-200"
                                        >
                                            <Share2 size={18} /> Chia sẻ
                                        </Button>
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium italic">
                                        Đăng ngày:{' '}
                                        {format(new Date(job.created_at), 'dd/MM/yyyy', {
                                            locale: vi,
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
                                        Ứng tuyển nhanh
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Hãy điền thông tin và đính kèm CV để chuyên viên tuyển dụng
                                        liên hệ với bạn.
                                    </p>
                                </div>

                                <ApplyForm jobId={job.id} />

                                <div className="pt-4 border-t border-slate-50 text-center">
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Cần hỗ trợ? Gửi email tới <br />
                                        <a
                                            href="mailto:hr@saigonvalve.vn"
                                            className="text-brand-primary font-bold hover:underline"
                                        >
                                            hr@saigonvalve.vn
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
                                            Sài Gòn Valve
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Since 2010
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
                                            120 Nguyễn Thị Thập, Tân Phú, Quận 7, TP. Hồ Chí Minh
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users
                                            size={18}
                                            className="text-brand-primary shrink-0 mt-0.5"
                                        />
                                        <span>50 - 100 nhân viên</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock
                                            size={18}
                                            className="text-brand-primary shrink-0 mt-0.5"
                                        />
                                        <span>Thứ 2 - Thứ 6 (08:00 - 17:30)</span>
                                    </div>
                                </div>

                                <Link href={SITE_ROUTES.ABOUT} className="block">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-brand-primary hover:text-brand-secondary hover:bg-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        Tìm hiểu thêm về chúng tôi
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

function ApplyForm({ jobId }: { jobId: string }) {
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
                toast.error('File quá lớn. Tối đa 5MB');
                return;
            }
            const allowed = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (!allowed.includes(file.type)) {
                toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
                return;
            }
            setCvFile(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.full_name || !formData.email || !formData.phone || !cvFile) {
            toast.error('Vui lòng điền đủ thông tin và đính kèm CV');
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
                toast.success('Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ sớm.');
                setFormData({ full_name: '', email: '', phone: '', cv_url: '', cover_letter: '' });
                setCvFile(null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Gặp lỗi khi nộp hồ sơ. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Họ và tên *</Label>
                <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-50 border-slate-200 h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm"
                    placeholder="Ví dụ: Nguyễn Văn A"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Email *</Label>
                    <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-50 border-slate-200  h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm"
                        placeholder="example@mail.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Số điện thoại *</Label>
                    <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-slate-50 border-slate-200  h-11 focus:ring-brand-primary placeholder:text-slate-400 text-sm"
                        placeholder="09xx xxx xxx"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                    Lời nhắn (không bắt buộc)
                </Label>
                <Textarea
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    className="bg-slate-50 border-slate-200  min-h-[100px] focus:ring-brand-primary placeholder:text-slate-400 text-sm py-3"
                    placeholder="Giới thiệu ngắn gọn sở trường của bạn..."
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Hồ sơ (CV) *</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed border-slate-200  p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center',
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
                            <p className="text-xs font-bold text-brand-primary truncate max-w-full italic px-2">
                                {cvFile.name}
                            </p>
                            <span className="text-[10px] text-slate-400">
                                Click để thay đổi file
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-brand-primary/10 transition-colors">
                                <Upload className="size-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-slate-600">Bấm để tải lên CV</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Hỗ trợ PDF, DOC, DOCX (Tối đa 5MB)
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
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white h-12  text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-primary/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Đang gửi hồ sơ...
                    </>
                ) : (
                    <>
                        Nộp hồ sơ ngay <Send size={16} className="ml-2" />
                    </>
                )}
            </Button>
        </form>
    );
}
