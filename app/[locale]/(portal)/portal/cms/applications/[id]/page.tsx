'use client';

import $api from '@/utils/axios';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    FileDown,
    Eye,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Users,
    ExternalLink,
    ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { API_ROUTES, PORTAL_ROUTES } from '@/constants/routes';
import { DeleteConfirmationDialog } from '@/components/portal/delete-confirmation-dialog';

interface JobApplication {
    id: string;
    job_id: string;
    job_title: string;
    full_name: string;
    email: string;
    phone: string;
    cv_url: string;
    cover_letter: string | null;
    status: string;
    created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Chờ duyệt', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
    reviewed: { label: 'Đã xem', color: 'bg-blue-500/10 text-blue-600', icon: Eye },
    interviewed: { label: 'Phỏng vấn', color: 'bg-purple-500/10 text-purple-600', icon: Users },
    rejected: { label: 'Từ chối', color: 'bg-rose-500/10 text-rose-600', icon: XCircle },
    accepted: {
        label: 'Trúng tuyển',
        color: 'bg-emerald-500/10 text-emerald-600',
        icon: CheckCircle2,
    },
};

export default function ApplicationDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<JobApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchApplication = async () => {
        setIsLoading(true);
        try {
            const res = await $api.get(`${API_ROUTES.APPLICATIONS}/${id}`);
            setApplication(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải thông tin ứng viên');
            router.push(PORTAL_ROUTES.cms.applications.list);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchApplication();
    }, [id]);

    const handleUpdateStatus = async (status: string) => {
        if (!application) return;
        setIsUpdating(true);
        try {
            await $api.patch(`${API_ROUTES.APPLICATIONS}/${application.id}`, { status });
            setApplication({ ...application, status });
            toast.success('Đã cập nhật trạng thái hồ sơ');
        } catch {
            toast.error('Không thể cập nhật trạng thái');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!application) return;
        setIsDeleting(true);
        try {
            await $api.delete(`${API_ROUTES.APPLICATIONS}/${application.id}`);
            toast.success('Đã xóa hồ sơ ứng viên');
            router.push(PORTAL_ROUTES.cms.applications.list);
        } catch {
            toast.error('Không thể xóa hồ sơ ứng viên');
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-slate-100 border-t-brand-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                        Đang truy xuất dữ liệu hồ sơ...
                    </p>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <div className="space-y-10 pb-20">
            {/* breadcrumb-style return */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="h-10 w-10 p-0 rounded-none hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                >
                    <ArrowLeft size={16} />
                </Button>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span
                        onClick={() => router.push(PORTAL_ROUTES.cms.applications.list)}
                        className="hover:text-brand-primary cursor-pointer transition-colors"
                    >
                        QUẢN LÝ ỨNG VIÊN
                    </span>
                    <ChevronRight size={14} className="opacity-30" />
                    <span className="text-slate-900 uppercase">
                        CHI TIẾT HỒ SƠ #{application.id.slice(0, 8)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Info & Preview */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Header Info */}
                    <div className="bg-white border border-slate-100 overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
                        <div className="p-10 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge
                                            className={cn(
                                                'border-none text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-none',
                                                STATUS_CONFIG[application.status]?.color,
                                            )}
                                        >
                                            {STATUS_CONFIG[application.status]?.label}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-slate-400 italic flex items-center gap-2">
                                            <CalendarIcon size={12} />
                                            Nộp vào{' '}
                                            {format(
                                                new Date(application.created_at),
                                                'HH:mm, dd/MM/yyyy',
                                                { locale: vi },
                                            )}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl font-black uppercase tracking-tight text-slate-950 leading-none">
                                        {application.full_name}
                                    </h1>
                                    <p className="text-lg font-bold text-brand-primary flex items-center gap-3 uppercase tracking-widest">
                                        <Users size={20} />
                                        {application.job_title}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteDialogOpen(true)}
                                        className="h-14 w-14 rounded-none border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={24} />
                                    </Button>
                                </div>
                            </div>

                            {/* Grid Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                                <div className="space-y-2 p-6 bg-slate-50 border border-slate-100 transition-all hover:border-brand-primary/20 hover:bg-white group">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors">
                                        Địa chỉ Email
                                    </p>
                                    <p className="text-md font-bold text-slate-900 flex items-center gap-3">
                                        <Mail
                                            size={18}
                                            className="text-brand-primary group-hover:scale-110 transition-transform"
                                        />
                                        <a
                                            href={`mailto:${application.email}`}
                                            className="hover:underline"
                                        >
                                            {application.email}
                                        </a>
                                    </p>
                                </div>
                                <div className="space-y-2 p-6 bg-slate-50 border border-slate-100 transition-all hover:border-brand-primary/20 hover:bg-white group">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-primary transition-colors">
                                        Số điện thoại
                                    </p>
                                    <p className="text-md font-bold text-slate-900 flex items-center gap-3">
                                        <Phone
                                            size={18}
                                            className="text-brand-primary group-hover:scale-110 transition-transform"
                                        />
                                        <a
                                            href={`tel:${application.phone}`}
                                            className="hover:underline"
                                        >
                                            {application.phone}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CV Preview Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-4 border-brand-primary pl-4">
                                Hồ sơ ứng tuyển & Preview
                            </h3>
                            <div className="flex gap-4">
                                <a
                                    href={application.cv_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-secondary flex items-center gap-2"
                                >
                                    Mở tab mới <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-slate-100 shadow-2xl relative">
                            <div className="absolute top-4 right-4 z-10">
                                <a
                                    href={application.cv_url}
                                    download
                                    className="bg-slate-950 text-white p-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-colors shadow-lg"
                                >
                                    <FileDown size={16} /> Tải hồ sơ gốc
                                </a>
                            </div>
                            <div className="aspect-3/4 md:aspect-auto md:h-[1000px] w-full bg-slate-50">
                                <iframe
                                    src={`${application.cv_url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-none"
                                    title="CV Preview"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Actions */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Status Management */}
                    <div className="bg-slate-950 text-white p-10 space-y-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 size-40 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 border-l-4 border-brand-accent pl-4">
                                Quản lý quy trình
                            </h3>
                            <p className="text-sm font-medium text-white/70 italic leading-relaxed">
                                Cập nhật bước tiếp theo cho ứng viên này.
                            </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <Button
                                    key={key}
                                    variant="outline"
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus(key)}
                                    className={cn(
                                        'w-full h-16 justify-between rounded-none border-white/10 font-black tracking-widest text-[10px] uppercase gap-4 transition-all pr-6',
                                        application.status === key
                                            ? 'bg-brand-primary text-white border-brand-primary translate-x-3'
                                            : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20',
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <config.icon
                                            size={18}
                                            className={cn(
                                                application.status === key
                                                    ? 'text-white'
                                                    : config.color.split(' ')[1],
                                            )}
                                        />
                                        {config.label}
                                    </div>
                                    {application.status === key && (
                                        <div className="size-2 bg-white rounded-full animate-ping" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Cover Letter Section */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-l-4 border-brand-primary pl-4">
                            Thư giới thiệu / Ghi chú
                        </h3>
                        <div className="bg-white border border-slate-100 p-8 relative min-h-[300px] group shadow-sm">
                            <div className="absolute -top-3 -right-3 text-slate-100 group-hover:text-brand-primary/10 transition-colors pointer-events-none italic">
                                <AlertCircle size={80} strokeWidth={1} />
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-[2.2] whitespace-pre-line relative z-10 italic">
                                {application.cover_letter ||
                                    'Ứng viên không để lại lời nhắn kèm theo hồ sơ này.'}
                            </p>
                            <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Kết thúc tin nhắn
                                </span>
                                <Mail size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Xóa hồ sơ ứng viên"
                description="Dữ liệu và tệp tin CV đính kèm sẽ bị gỡ bỏ hoàn toàn khỏi hệ thống."
                itemName={application.full_name}
                loading={isDeleting}
            />
        </div>
    );
}
