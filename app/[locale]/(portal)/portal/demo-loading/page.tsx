'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loading from '@/components/shared/Loading';

export default function DemoLoadingPage() {
    const [isSectionLoading, setIsSectionLoading] = useState(true);
    const [isFullLoading, setIsFullLoading] = useState(false);

    const triggerFullLoading = () => {
        setIsFullLoading(true);
        setTimeout(() => {
            setIsFullLoading(false);
        }, 3000); // Tự động tắt sau 3 giây
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Link href="/en/portal/cms/products">
                    <Button
                        variant="outline"
                        className="h-10 w-10 p-0 border-slate-100 rounded-none hover:bg-slate-50 hover:cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Trang Trải Nghiệm Loading Component
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-2 text-sm">
                        Demo thực tế các chế độ loading cao cấp dùng chung của Sài Gòn Valve.
                    </p>
                </div>
            </div>

            {/* Main Demo Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Inline Loading Demo */}
                <div className="bg-white rounded-none border border-slate-100 p-5 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                        1. Inline Spinner (Trong Button & Văn bản)
                    </h3>
                    <p className="text-xs text-slate-500 italic">
                        Thường dùng để thay thế icon trong Button khi đang xử lý sự kiện hoặc chèn trực tiếp vào dòng chữ.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button disabled className="bg-brand-primary text-[10px] font-black uppercase tracking-widest px-4 h-10 rounded-none">
                                <Loading variant="inline" size="sm" className="mr-2" /> Đang tải...
                            </Button>
                            <Button disabled variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 h-10 rounded-none border-slate-200">
                                <Loading variant="inline" size="sm" className="mr-2 text-slate-500" /> Đang lưu dữ liệu
                            </Button>
                            <Button disabled className="bg-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 h-10 rounded-none">
                                <Loading variant="inline" size="sm" className="mr-2" /> Thành công
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-slate-50 space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Các kích thước Inline Spinner:</h4>
                            <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100/50">
                                <div className="flex items-center gap-2">
                                    <Loading variant="inline" size="sm" />
                                    <span className="text-[10px] font-bold text-slate-600">Size SM (16px)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Loading variant="inline" size="md" />
                                    <span className="text-[10px] font-bold text-slate-600">Size MD (40px)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Loading variant="inline" size="lg" />
                                    <span className="text-[10px] font-bold text-slate-600">Size LG (64px)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Fullscreen Loading Trigger */}
                <div className="bg-white rounded-none border border-slate-100 p-5 space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                        2. Full-Page Loading Overlay
                    </h3>
                    <p className="text-xs text-slate-500 italic">
                        Phủ toàn bộ màn hình (fixed) với hiệu ứng làm mờ kính sang trọng (glassmorphic backdrop blur). Hãy bấm nút dưới để trải nghiệm.
                    </p>
                    
                    <div className="flex items-center justify-center p-8 bg-slate-50 border border-slate-100/50">
                        <Button 
                            onClick={triggerFullLoading}
                            className="bg-[#002d6b] hover:bg-[#002d6b]/90 hover:cursor-pointer text-[10px] font-black uppercase tracking-widest px-6 h-12 rounded-none transition-all flex items-center gap-3 shadow-md"
                        >
                            <Play size={14} className="fill-current" /> Trải nghiệm Fullscreen (3 Giây)
                        </Button>
                    </div>
                </div>

                {/* 3. Section Loading Demo */}
                <div className="lg:col-span-2 bg-white rounded-none border border-slate-100 p-5 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-brand-primary pl-4">
                            3. Section Loading (Phủ phân vùng)
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest h-8 border-slate-200 hover:cursor-pointer hover:bg-slate-50 rounded-none flex items-center gap-2"
                            onClick={() => setIsSectionLoading(!isSectionLoading)}
                        >
                            <RefreshCw size={12} className={isSectionLoading ? 'animate-spin' : ''} />
                            {isSectionLoading ? 'Tắt Loading' : 'Bật Loading'}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 italic">
                        Phủ mờ tương đối (`absolute`) trên vùng nội dung (như Table hay Card) để báo hiệu dữ liệu đang được tải mà không làm gián đoạn toàn bộ màn hình.
                    </p>
                    
                    <div className="relative border border-slate-100 min-h-[220px]">
                        {/* Component Loading phủ lên trên khi isLoading = true */}
                        {isSectionLoading && (
                            <Loading 
                                variant="section" 
                                size="md" 
                                text="Đang đồng bộ dữ liệu kho Sài Gòn Valve..." 
                            />
                        )}
                        
                        {/* Bảng dữ liệu giả lập */}
                        <div className="p-4 overflow-x-auto select-none opacity-40">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Thiết bị</th>
                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">SKU</th>
                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Tình trạng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-slate-900">Van Bi Mặt Bích Inox SGV</td>
                                        <td className="px-4 py-3 font-mono text-slate-500">SGV-BV-SS316-50</td>
                                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold">ĐANG BÁN</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-slate-900">Thiết Bị Giám Sát IoT Valve-Sense</td>
                                        <td className="px-4 py-3 font-mono text-slate-500">SGV-IOT-VS-01</td>
                                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold">ĐANG BÁN</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Full Page Loading khi kích hoạt */}
            {isFullLoading && (
                <Loading 
                    variant="full" 
                    size="lg" 
                    text="Đang tải dữ liệu hệ thống..." 
                />
            )}
        </div>
    );
}
