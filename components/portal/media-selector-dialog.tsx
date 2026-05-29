'use client';

import * as React from 'react';
import { Upload, Loader2, ImageIcon, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { formatFileSize, IMAGE_ACCEPT, validateImageFile } from '@/utils/client-media';

interface UploadedImage {
    filename: string;
    url: string;
    size: number;
    createdAt: string;
}

interface MediaSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export function MediaSelectorDialog({ open, onOpenChange, onSelect }: MediaSelectorDialogProps) {
    const [images, setImages] = React.useState<UploadedImage[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const response = await $api.get(API_ROUTES.UPLOAD);
            if (response.data.success) {
                setImages(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('Không thể tải danh sách ảnh');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (open) {
            fetchImages();
        }
    }, [open]);

    const handleUpload = async (file: File) => {
        if (!file) return;

        const validation = validateImageFile(file, 10);
        if (!validation.ok) {
            toast.error(validation.message);
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await $api.post(API_ROUTES.UPLOAD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                toast.success('Tải ảnh thành công!');
                onSelect(response.data.data.url);
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể tải ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-none border-none">
                <DialogHeader className="bg-brand-primary p-6 text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <ImageIcon className="text-brand-accent" size={20} />
                        <DialogTitle className="text-lg font-black uppercase tracking-tight italic text-white">
                            Chọn tài sản Media
                        </DialogTitle>
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                        Hỗ trợ định dạng JPEG, PNG, WebP (Tối đa 10MB)
                    </p>
                </DialogHeader>

                <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="bg-slate-100 p-1 h-auto shrink-0">
                        <TabsTrigger
                            value="library"
                            className="h-full py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-brand-primary rounded-none border-none shadow-none"
                        >
                            <FolderOpen size={14} className="mr-2" />
                            Thư viện ảnh
                        </TabsTrigger>
                        <TabsTrigger
                            value="upload"
                            className="h-full py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-brand-primary rounded-none border-none shadow-none"
                        >
                            <Upload size={14} className="mr-2" />
                            Tải ảnh mới
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="flex-1 overflow-auto p-6 m-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-primary/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    Đang tải dữ liệu...
                                </span>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <ImageIcon size={48} className="mb-4 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">
                                    Thư viện trống
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images.map((image) => (
                                    <button
                                        key={image.filename}
                                        type="button"
                                        onClick={() => onSelect(image.url)}
                                        className="relative aspect-square border-2 border-slate-100 hover:border-brand-primary transition-all group overflow-hidden"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={image.filename}
                                            fill
                                            unoptimized
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                            <p className="text-[8px] font-black text-white truncate uppercase">
                                                {image.filename}
                                            </p>
                                            <p className="text-[8px] font-bold text-white/60 uppercase">
                                                {formatFileSize(image.size)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 mt-0 p-6">
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file) handleUpload(file);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                'h-full min-h-[300px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group',
                                isDragging
                                    ? 'border-brand-primary bg-brand-primary/5'
                                    : 'border-slate-100 hover:border-brand-primary/40 hover:bg-slate-50/50',
                            )}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Đang xử lý dữ liệu...
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <ImageIcon className="h-16 w-16 text-slate-100 group-hover:text-brand-primary/10 transition-colors" />
                                        <Upload className="absolute -bottom-2 -right-2 h-8 w-8 text-brand-primary group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                            Kéo thả hoặc{' '}
                                            <span className="text-brand-primary italic">
                                                Nhấn để chọn file
                                            </span>
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Hệ thống tự động tối ưu hóa dung lượng cho Web
                                        </p>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={IMAGE_ACCEPT}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(file);
                                    e.target.value = '';
                                }}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-[10px] font-black uppercase tracking-widest rounded-none h-10 px-6"
                    >
                        Hủy bỏ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
