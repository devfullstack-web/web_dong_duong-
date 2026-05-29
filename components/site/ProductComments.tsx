'use client';

import * as React from 'react';
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Reply,
    X,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { usePermissions } from '@/hooks/use-permissions';

interface Comment {
    id: string;
    guest_name: string;
    content: string;
    reply_content: string | null;
    created_at: string;
    is_approved: boolean;
    is_pending?: boolean;
}

interface ProductCommentsProps {
    productId: string;
    productSlug: string;
}

export function ProductComments({ productSlug }: ProductCommentsProps) {
    const { isAdmin } = usePermissions();
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showAll, setShowAll] = React.useState(false);
    const [showForm, setShowForm] = React.useState(false);

    // Admin Reply State
    const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
    const [adminReply, setAdminReply] = React.useState('');
    const [isReplying, setIsReplying] = React.useState(false);

    const [formData, setFormData] = React.useState({
        guest_name: '',
        guest_email: '',
        content: '',
    });

    const fetchComments = React.useCallback(async () => {
        try {
            const response = await $api.get(`${API_ROUTES.PRODUCTS}/${productSlug}/comments`);
            if (response.data.success) {
                let fetchedComments = response.data.data || [];
                if (!isAdmin) {
                    const localPendingRaw = localStorage.getItem(`pending_comments_${productSlug}`);
                    if (localPendingRaw) {
                        try {
                            const localPending: Comment[] = JSON.parse(localPendingRaw);
                            const fetchedIds = new Set(fetchedComments.map((c: Comment) => c.id));
                            const validLocalPending = localPending.filter((c) => !fetchedIds.has(c.id));
                            if (validLocalPending.length > 0) {
                                fetchedComments = [...validLocalPending, ...fetchedComments];
                                fetchedComments.sort((a: Comment, b: Comment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                            }
                        } catch {}
                    }
                }
                setComments(fetchedComments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [productSlug, isAdmin]);

    React.useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.guest_name || !formData.guest_email || !formData.content) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await $api.post(`${API_ROUTES.PRODUCTS}/${productSlug}/comments`, formData);
            if (response.data.success) {
                toast.success('Cảm ơn bạn! Bình luận của bạn đã được gửi và đang chờ duyệt.');
                const newComment: Comment = { ...response.data.data, is_pending: true };
                if (!isAdmin) {
                    const localPendingRaw = localStorage.getItem(`pending_comments_${productSlug}`);
                    let localPending: Comment[] = [];
                    if (localPendingRaw) {
                        try { localPending = JSON.parse(localPendingRaw); } catch {}
                    }
                    localPending.unshift(newComment);
                    localStorage.setItem(`pending_comments_${productSlug}`, JSON.stringify(localPending.slice(0, 10)));
                }
                setComments((prev) => [newComment, ...prev]);
                setFormData({ guest_name: '', guest_email: '', content: '' });
                setShowForm(false);
            }
        } catch {
            toast.error('Không thể gửi bình luận. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminReply = async (commentId: string) => {
        if (!adminReply.trim()) return;
        setIsReplying(true);
        try {
            const response = await $api.patch(`${API_ROUTES.COMMENTS}/${commentId}`, {
                reply_content: adminReply,
                is_approved: true,
            });
            if (response.data.success) {
                toast.success('Đã gửi phản hồi');
                setReplyingToId(null);
                setAdminReply('');
                fetchComments();
            }
        } catch {
            toast.error('Không thể gửi phản hồi');
        } finally {
            setIsReplying(false);
        }
    };

    const displayedComments = showAll ? comments : comments.slice(0, 5);

    return (
        <div className="py-12 border-t border-slate-100">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-brand-primary"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Hỏi đáp & Thảo luận</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                        CHIA SẺ <span className="text-brand-primary">THẮC MẮC</span> CỦA BẠN
                    </h2>
                    <p className="text-xs text-slate-500 font-medium italic">
                        Chúng tôi sẽ phản hồi các câu hỏi kỹ thuật trong thời gian sớm nhất.
                    </p>
                </div>

                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all shadow-xl shadow-slate-900/10 group"
                    >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Đặt câu hỏi
                    </button>
                )}
            </div>

            {/* Comment Form (Toggleable) */}
            {showForm && (
                <div className="mb-12 bg-slate-50 p-8 border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 relative">
                    <button 
                        onClick={() => setShowForm(false)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="max-w-3xl">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
                            <Send size={14} className="text-brand-primary" /> Thông tin câu hỏi
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Họ và tên *"
                                    value={formData.guest_name}
                                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                    className="bg-white border-slate-200 h-11 text-xs font-bold rounded-none focus:ring-brand-primary"
                                    required
                                />
                                <Input
                                    type="email"
                                    placeholder="Email liên hệ *"
                                    value={formData.guest_email}
                                    onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                                    className="bg-white border-slate-200 h-11 text-xs font-bold rounded-none focus:ring-brand-primary"
                                    required
                                />
                            </div>
                            <Textarea
                                placeholder="Nội dung thắc mắc của bạn... *"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="bg-white border-slate-200 min-h-[100px] text-xs font-bold rounded-none focus:ring-brand-primary resize-none"
                                required
                            />
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[9px] text-slate-400 italic">
                                    * Câu hỏi của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-brand-primary hover:bg-brand-secondary text-white px-10 h-11 text-[10px] font-black uppercase tracking-widest transition-all rounded-none"
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                        <div className="size-8 border-4 border-brand-primary border-t-transparent animate-spin mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest">Đang tải thảo luận...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 border border-dashed border-slate-200">
                        <MessageSquare size={32} className="text-slate-200 mb-3" />
                        <p className="text-slate-400 text-xs font-bold italic">Chưa có thảo luận nào cho sản phẩm này.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayedComments.map((comment) => (
                            <div key={comment.id} className="border-b border-slate-50 pb-6 animate-in fade-in duration-500">
                                <div className="flex gap-4">
                                    <div className="size-10 bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{comment.guest_name}</span>
                                            {(comment.is_pending || (isAdmin && !comment.is_approved)) && (
                                                <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 font-black uppercase tracking-tighter border border-amber-100">Đang chờ duyệt</span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 ml-auto">
                                                <Clock size={10} /> {format(new Date(comment.created_at), 'dd/MM/yyyy', { locale: vi })}
                                            </span>
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => { setReplyingToId(comment.id); setAdminReply(comment.reply_content || ''); }}
                                                    className="text-[9px] font-black uppercase text-brand-primary hover:underline flex items-center gap-1.5"
                                                >
                                                    <Reply size={12} /> {comment.reply_content ? 'Sửa' : 'Trả lời'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-xs font-medium text-slate-600 leading-relaxed max-w-4xl">
                                            {comment.content}
                                        </div>

                                        {/* Admin Reply */}
                                        {comment.reply_content && replyingToId !== comment.id && (
                                            <div className="mt-4 flex gap-4 pl-6 border-l-2 border-brand-primary/20 bg-slate-50/50 p-4">
                                                <CheckCircle2 size={14} className="text-brand-primary shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest italic">SG - VAL Phản hồi:</div>
                                                    <div className="text-xs font-medium text-slate-700 leading-relaxed italic">{comment.reply_content}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reply Form */}
                                        {isAdmin && replyingToId === comment.id && (
                                            <div className="mt-4 p-5 bg-white border border-brand-primary/20 space-y-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest">Phản hồi của chuyên gia:</span>
                                                    <button onClick={() => setReplyingToId(null)}><X size={14} className="text-slate-400 hover:text-rose-500" /></button>
                                                </div>
                                                <Textarea 
                                                    value={adminReply} 
                                                    onChange={(e) => setAdminReply(e.target.value)}
                                                    placeholder="Nhập nội dung phản hồi..."
                                                    className="text-xs font-bold min-h-[80px] border-slate-100 rounded-none focus:ring-brand-primary"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={() => handleAdminReply(comment.id)} disabled={isReplying || !adminReply.trim()} className="bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest rounded-none">
                                                        {isReplying ? 'Đang gửi...' : 'Gửi phản hồi'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {comments.length > 5 && (
                            <button 
                                onClick={() => setShowAll(!showAll)}
                                className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-brand-primary transition-all flex items-center justify-center gap-2"
                            >
                                {showAll ? <>Thu gọn <ChevronUp size={12} /></> : <>Xem thêm {comments.length - 5} thảo luận <ChevronDown size={12} /></>}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
