'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Reply,
    Trash2,
    MoreHorizontal,
    Clock,
    User,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { SimpleConfirmDialog } from '@/components/shared/simple-confirm-dialog';
import { useTranslations } from 'next-intl';
import Loading from '@/components/shared/Loading';

interface Comment {
    id: string;
    guest_name: string;
    guest_email: string;
    content: string;
    reply_content: string | null;
    is_approved: boolean;
    created_at: string;
    product_name: string;
    product_slug: string;
}

export default function CommentsManagementPage() {
    const tc = useTranslations('Portal.Common');
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');

    // Reply Dialog State
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    // Delete confirmation state
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await $api.get(API_ROUTES.COMMENTS, {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                },
            });
            if (response.data.success) {
                setComments(response.data.data || []);
                setTotal(response.data.meta?.total || 0);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Không thể tải danh sách bình luận');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleApprove = async (id: string, currentStatus: boolean) => {
        try {
            const response = await $api.patch(`${API_ROUTES.COMMENTS}/${id}`, {
                is_approved: !currentStatus,
            });
            if (response.data.success) {
                toast.success(currentStatus ? 'Đã ẩn bình luận' : 'Đã duyệt bình luận');
                fetchComments();
            }
        } catch {
            toast.error('Thao tác thất bại');
        }
    };

    const handleDelete = (id: string) => {
        setCommentToDelete(id);
    };

    const confirmDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            const response = await $api.delete(`${API_ROUTES.COMMENTS}/${commentToDelete}`);
            if (response.data.success) {
                toast.success('Đã xóa bình luận');
                fetchComments();
            }
        } catch {
            toast.error('Xóa thất bại');
        } finally {
            setCommentToDelete(null);
        }
    };

    const handleReplySubmit = async () => {
        if (!replyingTo || !replyContent.trim()) return;
        setIsSubmittingReply(true);
        try {
            const response = await $api.patch(`${API_ROUTES.COMMENTS}/${replyingTo.id}`, {
                reply_content: replyContent,
                is_approved: true,
            });
            if (response.data.success) {
                toast.success('Đã gửi phản hồi');
                setReplyingTo(null);
                setReplyContent('');
                fetchComments();
            }
        } catch {
            toast.error('Không thể gửi phản hồi');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase text-slate-900 border-l-4 border-[#002d6b] pl-3 leading-none">
                        Quản lý Bình luận
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                        Hệ thống phê duyệt và phản hồi tương tác khách hàng.
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Tổng bình luận: <span className="text-[#002d6b]">{total}</span>
                    </span>
                </div>
            </div>

            <div className="space-y-6 mt-0">
                    <div className="grid gap-4">
                        <Card className="rounded-none border border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 p-4 md:p-5 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 flex-1 max-w-md">
                                        <div className="relative w-full">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="TÌM THEO TÊN, EMAIL, NỘI DUNG..."
                                                className="pl-10 h-10 rounded-none border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus-visible:ring-brand-primary focus-visible:ring-offset-0"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Filter size={16} className="text-slate-400" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                Lọc:
                                            </span>
                                        </div>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="h-10 w-[180px] rounded-none border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:ring-offset-0">
                                                <SelectValue placeholder="Tất cả trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-slate-100">
                                                <SelectItem
                                                    value="all"
                                                    className="text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Tất cả trạng thái
                                                </SelectItem>
                                                <SelectItem
                                                    value="pending"
                                                    className="text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Chờ duyệt
                                                </SelectItem>
                                                <SelectItem
                                                    value="approved"
                                                    className="text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Đã duyệt
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative p-0 min-h-[300px]">
                                {isLoading ? (
                                    <Loading variant="section" size="md" text={tc('loading')} />
                                ) : comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 min-h-[300px]">
                                        <MessageSquare size={48} className="mb-4 opacity-10" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            Không tìm thấy bình luận nào.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="p-5 md:p-6 hover:bg-slate-50/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        {/* Header: Guest Info & Product */}
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 rounded-none bg-[#002d6b]/5 flex items-center justify-center text-[#002d6b] border border-[#002d6b]/10">
                                                                    <User size={14} />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                                        {comment.guest_name}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                                        {comment.guest_email}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2">
                                                                <Clock
                                                                    size={12}
                                                                    className="text-slate-300"
                                                                />
                                                                {format(
                                                                    new Date(comment.created_at),
                                                                    'HH:mm - dd/MM/yyyy',
                                                                    { locale: vi },
                                                                )}
                                                            </div>

                                                            <Badge
                                                                variant={
                                                                    comment.is_approved
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className="rounded-none text-[9px] uppercase tracking-widest font-black py-1 px-3 h-auto border-none"
                                                                style={{
                                                                    backgroundColor:
                                                                        comment.is_approved
                                                                            ? '#10b981'
                                                                            : '#f59e0b',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                {comment.is_approved
                                                                    ? 'Đã duyệt'
                                                                    : 'Chờ duyệt'}
                                                            </Badge>
                                                            <a
                                                                href={`/san-pham/${comment.product_slug}`}
                                                                target="_blank"
                                                                className="text-[10px] font-black uppercase text-[#002d6b] hover:text-[#002d6b]/80 flex items-center gap-1.5 transition-colors"
                                                            >
                                                                <ExternalLink size={12} /> SP:{' '}
                                                                {comment.product_name}
                                                            </a>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="bg-slate-50/50 border-l-4 border-l-[#002d6b] p-4 text-sm text-slate-700 leading-relaxed italic">
                                                            &quot;{comment.content}&quot;
                                                        </div>

                                                        {/* Reply */}
                                                        {comment.reply_content && (
                                                            <div className="pl-8 border-l-2 border-[#fbbf24] mt-4 space-y-2">
                                                                <div className="text-[10px] font-black uppercase text-[#fbbf24] tracking-[0.2em] flex items-center gap-2">
                                                                    <CheckCircle2 size={12} /> PHẢN
                                                                    HỒI TỪ HỆ THỐNG:
                                                                </div>
                                                                <p className="text-sm text-slate-500 italic leading-relaxed bg-amber-50/30 p-3 border border-amber-100/50">
                                                                    {comment.reply_content}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 rounded-none gap-2 px-3 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-[#002d6b] hover:text-white hover:border-[#002d6b] transition-all"
                                                            onClick={() => {
                                                                setReplyingTo(comment);
                                                                setReplyContent(
                                                                    comment.reply_content || '',
                                                                );
                                                            }}
                                                        >
                                                            <Reply size={14} /> Phản hồi
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:bg-slate-100 rounded-none transition-colors"
                                                                >
                                                                    <MoreHorizontal size={14} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="rounded-none border-slate-100 shadow-xl w-48 p-1"
                                                            >
                                                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-2.5 py-1.5">
                                                                    Thao tác quản trị
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-2.5 py-1.5 transition-colors"
                                                                    onSelect={() =>
                                                                        handleApprove(
                                                                            comment.id,
                                                                            comment.is_approved,
                                                                        )
                                                                    }
                                                                >
                                                                    {comment.is_approved ? (
                                                                        <>
                                                                            <XCircle
                                                                                size={14}
                                                                                className="text-amber-500"
                                                                            />{' '}
                                                                            Ẩn bình luận
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckCircle2
                                                                                size={14}
                                                                                className="text-emerald-500"
                                                                            />{' '}
                                                                            Duyệt bình luận
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 focus:text-rose-500 px-2.5 py-1.5 hover:bg-rose-50"
                                                                    onSelect={() =>
                                                                        handleDelete(comment.id)
                                                                    }
                                                                >
                                                                    <Trash2 size={14} /> Xóa vĩnh
                                                                    viễn
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pagination */}
                        {total > 10 && (
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Hiển thị {comments.length} / {total} bình luận
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <div className="h-8 min-w-[60px] flex items-center justify-center text-[10px] font-black border border-slate-200 px-4 bg-white uppercase tracking-widest">
                                        TRANG {page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page * 10 >= total}
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
            </div>

            {/* Reply Dialog */}
            <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
                <DialogContent className="max-w-2xl rounded-none border-none p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-5 md:p-6 bg-[#002d6b] text-white space-y-2">
                        <DialogTitle className="text-lg md:text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <Reply size={20} className="text-[#fbbf24]" />
                            Phản hồi tương tác
                        </DialogTitle>
                        <DialogDescription className="text-white/60 font-medium italic text-xs">
                            Câu trả lời của bạn sẽ được hiển thị công khai dưới bình luận của khách
                            hàng. Hãy đảm bảo nội dung chuyên nghiệp và chính xác.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-5 md:p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Câu hỏi từ {replyingTo?.guest_name}:
                            </div>
                            <div className="bg-slate-50 p-4 rounded-none border border-slate-100 text-sm text-slate-600 italic leading-relaxed border-l-4 border-l-[#fbbf24]">
                                &quot;{replyingTo?.content}&quot;
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002d6b]">
                                Nội dung trả lời hệ thống:
                            </div>
                            <Textarea
                                placeholder="NHẬP NỘI DUNG PHẢN HỒI CHI TIẾT TẠI ĐÂY..."
                                className="min-h-[120px] rounded-none border-slate-200 focus-visible:ring-offset-0 focus-visible:ring-brand-primary text-sm font-medium leading-relaxed italic placeholder:text-slate-200"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-5 md:p-6 bg-slate-50/50 flex sm:justify-between items-center gap-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setReplyingTo(null)}
                            className="rounded-none text-[10px] font-black uppercase tracking-widest h-10 px-4"
                        >
                            Hủy thao tác
                        </Button>
                        <Button
                            className="bg-[#002d6b] hover:bg-[#001d4b] text-white rounded-none h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#002d6b]/20 flex items-center gap-3"
                            onClick={handleReplySubmit}
                            disabled={isSubmittingReply || !replyContent.trim()}
                        >
                            {isSubmittingReply ? (
                                <>
                                    <Clock className="animate-spin" size={14} /> ĐANG GỬI...
                                </>
                            ) : (
                                'GỬI PHẢN HỒI & PHÊ DUYỆT'
                             )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SimpleConfirmDialog
                open={!!commentToDelete}
                onOpenChange={(open) => !open && setCommentToDelete(null)}
                onConfirm={confirmDeleteComment}
                title="Xác nhận xóa bình luận?"
                description="Hành động này sẽ xóa vĩnh viễn bình luận khỏi hệ thống và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
                confirmText="Xác nhận xóa"
                variant="destructive"
            />
        </div>
    );
}
