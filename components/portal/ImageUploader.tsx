'use client';

import * as React from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus, Check, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import $api from '@/utils/axios';
import { API_ROUTES } from '@/constants/routes';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface UploadedImage {
    filename: string;
    url: string;
    size: number;
    createdAt: string;
}

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    gallery?: string[];
    onGalleryChange?: (urls: string[]) => void;
    className?: string;
    aspectRatio?: 'video' | 'square';
}

const EMPTY_ARRAY: string[] = [];

export function ImageUploader({
    value,
    onChange,
    gallery = EMPTY_ARRAY,
    onGalleryChange,
    className,
    aspectRatio = 'video',
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [uploadedImages, setUploadedImages] = React.useState<UploadedImage[]>([]);
    const [isLoadingImages, setIsLoadingImages] = React.useState(false);
    const [selectingFor, setSelectingFor] = React.useState<'main' | 'gallery'>('main');
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [tempSelectedUrl, setTempSelectedUrl] = React.useState<string | null>(null);
    const [tempSelectedUrls, setTempSelectedUrls] = React.useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchUploadedImages = async () => {
        setIsLoadingImages(true);
        try {
            const response = await $api.get(API_ROUTES.UPLOAD);
            if (response.data.success) {
                setUploadedImages(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsLoadingImages(false);
        }
    };

    React.useEffect(() => {
        if (isDialogOpen) {
            fetchUploadedImages();
            // Initialize temp states only if they differ
            if (selectingFor === 'main') {
                if (tempSelectedUrl !== value) {
                    setTempSelectedUrl(value);
                }
            } else {
                // Use a simple length and content check for gallery
                const isGalleryDifferent =
                    tempSelectedUrls.length !== gallery.length ||
                    tempSelectedUrls.some((url, i) => url !== gallery[i]);

                if (isGalleryDifferent) {
                    setTempSelectedUrls([...gallery]);
                }
            }
        } else {
            // Reset states when closing
            // Only call reset functions if there is something to reset to avoid infinite loops
            if (selectedFile || previewUrl) {
                handleCancelUpload();
            }
            if (tempSelectedUrl !== null) {
                setTempSelectedUrl(null);
            }
            if (tempSelectedUrls.length > 0) {
                setTempSelectedUrls([]);
            }
        }
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [isDialogOpen, previewUrl, selectingFor, value, gallery]);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await $api.post(API_ROUTES.UPLOAD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                const url = response.data.data.url;
                if (selectingFor === 'gallery' && onGalleryChange) {
                    onGalleryChange([...gallery, url]);
                } else {
                    onChange(url);
                }
                toast.success('Tải ảnh thành công!');
                fetchUploadedImages();
                handleCancelUpload();
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Không thể tải ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Định dạng không hợp lệ. Chỉ chấp nhận: JPEG, PNG, WebP, GIF');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file vượt quá 5MB');
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleCancelUpload = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSelectImage = (url: string) => {
        if (selectingFor === 'gallery') {
            setTempSelectedUrls((prev) =>
                prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
            );
        } else {
            setTempSelectedUrl(url);
        }
    };

    const handleConfirmLibrarySelection = () => {
        if (selectingFor === 'gallery' && onGalleryChange) {
            onGalleryChange(tempSelectedUrls);
        } else if (selectingFor === 'main' && tempSelectedUrl) {
            onChange(tempSelectedUrl);
        }
        setIsDialogOpen(false);
    };

    const handleRemoveGalleryImage = (index: number) => {
        if (onGalleryChange) {
            const newGallery = gallery.filter((_, i) => i !== index);
            onGalleryChange(newGallery);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const openDialogFor = (type: 'main' | 'gallery') => {
        setSelectingFor(type);
        setIsDialogOpen(true);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={cn('space-y-6', className)}>
            {/* Main Image */}
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Ảnh đại diện
                </label>
                {value ? (
                    <div
                        className={cn(
                            'relative w-full group border border-slate-100 rounded-none',
                            aspectRatio === 'video' ? 'aspect-video' : 'aspect-square',
                        )}
                    >
                        <Image
                            src={value}
                            alt="Preview image"
                            fill
                            unoptimized
                            className={cn(
                                'rounded-none',
                                aspectRatio === 'video' ? 'object-contain' : 'object-cover',
                            )}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => openDialogFor('main')}
                            >
                                Đổi ảnh
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => onChange('')}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => openDialogFor('main')}
                        className="w-full border-2 border-dashed border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50 transition-all p-8 flex flex-col items-center gap-3"
                    >
                        <Upload className="h-10 w-10 text-slate-300" />
                        <div className="space-y-1 text-center">
                            <p className="text-xs font-bold text-slate-500">
                                Nhấn để <span className="text-brand-primary">chọn ảnh</span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                                PNG, JPG, WebP, GIF (tối đa 5MB)
                            </p>
                        </div>
                    </button>
                )}
            </div>

            {/* Gallery */}
            {onGalleryChange && (
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Thư viện ảnh ({gallery.length})
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                        {gallery.map((url, index) => (
                            <div
                                key={index}
                                className="relative aspect-square group border border-slate-100"
                            >
                                <Image
                                    src={url}
                                    alt={`Gallery image ${index + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => openDialogFor('gallery')}
                            className="aspect-square border-2 border-dashed border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50 transition-all flex items-center justify-center"
                        >
                            <ImagePlus className="h-6 w-6 text-slate-300" />
                        </button>
                    </div>
                </div>
            )}

            {/* Image Selection Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black uppercase tracking-widest">
                            {selectingFor === 'main'
                                ? 'Chọn ảnh đại diện'
                                : 'Thêm ảnh vào thư viện'}
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 h-auto">
                            <TabsTrigger
                                value="library"
                                className="py-3 text-xs font-bold uppercase rounded-none border-none shadow-none data-[state=active]:bg-white data-[state=active]:text-brand-primary"
                            >
                                <FolderOpen size={14} className="mr-2" />
                                Thư viện ảnh
                            </TabsTrigger>
                            <TabsTrigger
                                value="upload"
                                className="py-3 text-xs font-bold uppercase rounded-none border-none shadow-none data-[state=active]:bg-white data-[state=active]:text-brand-primary"
                            >
                                <Upload size={14} className="mr-2" />
                                Tải ảnh mới
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="library"
                            className="flex-1 overflow-hidden mt-4 flex flex-col"
                        >
                            <div className="flex-1 overflow-auto min-h-0 pr-2">
                                {isLoadingImages ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                                    </div>
                                ) : uploadedImages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <FolderOpen size={48} className="mb-4" />
                                        <p className="text-sm font-bold">Chưa có ảnh nào</p>
                                        <p className="text-xs">Hãy tải ảnh lên để sử dụng</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-3">
                                        {uploadedImages.map((image) => {
                                            const isSelected =
                                                selectingFor === 'main'
                                                    ? tempSelectedUrl === image.url
                                                    : tempSelectedUrls.includes(image.url);

                                            return (
                                                <button
                                                    key={image.filename}
                                                    type="button"
                                                    onClick={() => handleSelectImage(image.url)}
                                                    className={cn(
                                                        'relative aspect-square border-2 transition-all group',
                                                        isSelected
                                                            ? 'border-brand-primary'
                                                            : 'border-transparent hover:border-brand-primary/50',
                                                    )}
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={image.filename}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute top-1 right-1 p-1 bg-brand-primary text-white rounded-none">
                                                            <Check size={10} />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {formatFileSize(image.size)}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {uploadedImages.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="h-9 px-4 rounded-none text-[10px] font-black uppercase tracking-widest border-2"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleConfirmLibrarySelection}
                                        disabled={
                                            selectingFor === 'main'
                                                ? !tempSelectedUrl || tempSelectedUrl === value
                                                : false
                                        }
                                        className="h-9 px-6 rounded-none text-[10px] font-black uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/90"
                                    >
                                        <Check className="h-3 w-3 mr-2" />
                                        Xác nhận chọn{' '}
                                        {selectingFor === 'gallery' &&
                                            tempSelectedUrls.length > 0 &&
                                            `(${tempSelectedUrls.length})`}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="upload" className="flex-1 mt-4">
                            {!selectedFile ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        'h-64 border-2 border-dashed rounded-none flex flex-col items-center justify-center cursor-pointer transition-all',
                                        isDragging
                                            ? 'border-brand-primary bg-brand-primary/5'
                                            : 'border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50',
                                    )}
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <Upload className="h-16 w-16 text-slate-300" />
                                        <div className="space-y-2 text-center">
                                            <p className="text-sm font-bold text-slate-500">
                                                Kéo thả hoặc{' '}
                                                <span className="text-brand-primary">
                                                    nhấn để chọn file
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                PNG, JPG, WebP, GIF (tối đa 5MB)
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileSelect(file);
                                            e.target.value = '';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative aspect-video w-full border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                                        {previewUrl && (
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-contain"
                                            />
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-slate-400">
                                                Tên file
                                            </span>
                                            <span className="text-xs font-bold truncate max-w-[200px]">
                                                {selectedFile.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isUploading}
                                                onClick={handleCancelUpload}
                                                className="h-9 px-4 rounded-none text-[10px] font-black uppercase tracking-widest border-2"
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="button"
                                                disabled={isUploading}
                                                onClick={handleUpload}
                                                className="h-9 px-6 rounded-none text-[10px] font-black uppercase tracking-widest bg-brand-primary hover:bg-brand-primary/90"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                                ) : (
                                                    <Check className="h-3 w-3 mr-2" />
                                                )}
                                                Xác nhận tải lên
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
