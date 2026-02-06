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
import { RadialChartGrid } from '@/components/portal/charts/RadialChartGrid';
import { AreaChartGradient } from '@/components/portal/charts/AreaChartGradient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutList, PieChart as PieChartIcon } from 'lucide-react';

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
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
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

    const fetchStats = async () => {
        try {
            const res = await $api.get(API_ROUTES.STATS);
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch comment stats', error);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchStats();
    }, [fetchComments]);

    const handleApprove = async (id: string, currentStatus: boolean) => {
        try {
            const response = await $api.patch(`${API_ROUTES.COMMENTS}/${id}`, {
                is_approved: !currentStatus,
            });
            if (response.data.success) {
                toast.success(currentStatus ? 'Đã ẩn bình luận' : 'Đã duyệt bình luận');
                fetchComments();
                fetchStats();
            }
        } catch (error) {
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
                fetchStats();
            }
        } catch (error) {
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
                fetchStats();
            }
        } catch (error) {
            toast.error('Không thể gửi phản hồi');
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Prepare chart data
    const commentChartData = [
        {
            browser: 'approved',
            visitors: stats?.commentStats?.approved || 0,
            fill: '#10b981',
        },
        {
            browser: 'pending',
            visitors: stats?.commentStats?.pending || 0,
            fill: '#f59e0b',
        },
    ];

    const commentTrendData =
        stats?.trends?.map((t: any) => ({
            month: t.month.toUpperCase(),
            comments: t.comments || 0,
        })) || [];

    return (
        <div className="flex-1 space-y-10 py-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#002d6b] text-white text-[8px] font-black uppercase tracking-widest">
                            Customer Feedback
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />{' '}
                            Interactive Monitoring
                        </span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[#002d6b] border-l-8 border-[#002d6b] pl-6 leading-none">
                        Quản lý Bình luận
                    </h2>
                    <p className="text-slate-500 font-medium italic text-xs max-w-2xl leading-relaxed">
                        Hệ thống phê duyệt và phản hồi tương tác khách hàng. Theo dõi mức độ quan
                        tâm về sản phẩm qua biểu đồ xu hướng và trạng thái xử lý bình luận.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-8">
                <div className="flex items-center justify-between">
                    <TabsList className="h-auto p-1 bg-slate-100/80 rounded-none gap-1">
                        <TabsTrigger
                            value="list"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <LayoutList size={14} /> Danh sách bình luận
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-white data-[state=active]:text-[#002d6b] data-[state=active]:shadow-sm rounded-none px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all duration-200 gap-2"
                        >
                            <PieChartIcon size={14} /> Biểu đồ phân tích
                        </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Tổng bình luận: <span className="text-[#002d6b]">{total}</span>
                        </span>
                    </div>
                </div>

                <TabsContent value="list" className="space-y-6 mt-0 border-none p-0">
                    <div className="grid gap-4">
                        <Card className="rounded-none border border-slate-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 flex-1 max-w-md">
                                        <div className="relative w-full">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="TÌM THEO TÊN, EMAIL, NỘI DUNG..."
                                                className="pl-12 h-12 rounded-none border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 focus-visible:ring-brand-primary focus-visible:ring-offset-0"
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
                                            <SelectTrigger className="h-12 w-[200px] rounded-none border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:ring-offset-0">
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
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                        <div className="h-12 w-12 border-4 border-[#002d6b] border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            Đang tải dữ liệu...
                                        </p>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
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
                                                className="p-8 hover:bg-slate-50/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-8">
                                                    <div className="flex-1 space-y-4">
                                                        {/* Header: Guest Info & Product */}
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 rounded-none bg-[#002d6b]/5 flex items-center justify-center text-[#002d6b] border border-[#002d6b]/10">
                                                                    <User size={18} />
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
                                                        <div className="bg-slate-50/50 border-l-4 border-l-[#002d6b] p-6 text-sm text-slate-700 leading-relaxed italic">
                                                            "{comment.content}"
                                                        </div>

                                                        {/* Reply */}
                                                        {comment.reply_content && (
                                                            <div className="pl-8 border-l-2 border-[#fbbf24] mt-4 space-y-2">
                                                                <div className="text-[10px] font-black uppercase text-[#fbbf24] tracking-[0.2em] flex items-center gap-2">
                                                                    <CheckCircle2 size={12} /> PHẢN
                                                                    HỒI TỪ HỆ THỐNG:
                                                                </div>
                                                                <p className="text-sm text-slate-500 italic leading-relaxed bg-amber-50/30 p-4 border border-amber-100/50">
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
                                                            className="h-10 rounded-none gap-3 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-[#002d6b] hover:text-white hover:border-[#002d6b] transition-all"
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
                                                                    className="h-10 w-10 hover:bg-slate-100 rounded-none transition-colors"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="rounded-none border-slate-100 shadow-xl w-56 p-2"
                                                            >
                                                                <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 py-2">
                                                                    Thao tác quản trị
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-slate-50" />
                                                                <DropdownMenuItem
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 px-3 py-2 transition-colors"
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
                                                                    className="text-[10px] font-black uppercase tracking-tight cursor-pointer gap-3 text-rose-500 focus:text-rose-500 px-3 py-2 hover:bg-rose-50"
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
                                        className="h-10 w-10 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <div className="h-10 min-w-[60px] flex items-center justify-center text-[10px] font-black border border-slate-200 px-4 bg-white uppercase tracking-widest">
                                        TRANG {page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 rounded-none border-slate-200 transition-all hover:bg-slate-50"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page * 10 >= total}
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent
                    value="analytics"
                    className="space-y-8 mt-0 border-none p-0 animate-in fade-in duration-500"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <RadialChartGrid
                            title="Trạng thái phê duyệt"
                            description="Tỷ lệ bình luận đã duyệt vs chờ xử lý"
                            data={commentChartData}
                            config={{
                                visitors: { label: 'Bình luận' },
                                approved: { label: 'Đã duyệt', color: '#10b981' },
                                pending: { label: 'Chờ duyệt', color: '#f59e0b' },
                            }}
                            footerTitle="Mức độ tương tác"
                            footerDescription="Cập nhật tự động từ hệ thống"
                            className="lg:col-span-1"
                        />
                        <AreaChartGradient
                            title="Mật độ thảo luận"
                            description="Số lượng bình luận mới được gửi qua các tháng"
                            data={commentTrendData}
                            config={{
                                comments: { label: 'Bình luận', color: '#002d6b' },
                            }}
                            dataKeys={['comments']}
                            xAxisKey="month"
                            footerTitle="Xu hướng quan tâm"
                            footerDescription="Dựa trên dữ liệu 6 tháng gần nhất"
                            className="lg:col-span-2"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reply Dialog */}
            <Dialog open={!!replyingTo} onOpenChange={() => setReplyingTo(null)}>
                <DialogContent className="max-w-2xl rounded-none border-none p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-10 bg-[#002d6b] text-white space-y-4">
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-6">
                            <Reply size={32} className="text-[#fbbf24]" />
                            Phản hồi tương tác
                        </DialogTitle>
                        <DialogDescription className="text-white/60 font-medium italic text-sm">
                            Câu trả lời của bạn sẽ được hiển thị công khai dưới bình luận của khách
                            hàng. Hãy đảm bảo nội dung chuyên nghiệp và chính xác.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Câu hỏi từ {replyingTo?.guest_name}:
                            </div>
                            <div className="bg-slate-50 p-8 rounded-none border border-slate-100 text-sm text-slate-600 italic leading-relaxed border-l-4 border-l-[#fbbf24]">
                                "{replyingTo?.content}"
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002d6b]">
                                Nội dung trả lời hệ thống:
                            </div>
                            <Textarea
                                placeholder="NHẬP NỘI DUNG PHẢN HỒI CHI TIẾT TẠI ĐÂY..."
                                className="min-h-[200px] rounded-none border-slate-200 focus-visible:ring-offset-0 focus-visible:ring-brand-primary text-sm font-medium leading-relaxed italic placeholder:text-slate-200"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-10 bg-slate-50/50 flex sm:justify-between items-center gap-6 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={() => setReplyingTo(null)}
                            className="rounded-none text-[10px] font-black uppercase tracking-widest h-14 px-8"
                        >
                            Hủy thao tác
                        </Button>
                        <Button
                            className="bg-[#002d6b] hover:bg-[#001d4b] text-white rounded-none h-14 px-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#002d6b]/20 flex items-center gap-3"
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
