import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
    /**
     * Chế độ hiển thị:
     * - 'full': Phủ toàn bộ màn hình (fixed overlay) với nền mờ glassmorphic sang trọng
     * - 'section': Phủ một vùng container (relative overlay), hữu ích cho tables/cards
     * - 'inline': Chỉ hiển thị spinner nhỏ gọn để dùng trong button hay văn bản
     */
    variant?: 'full' | 'section' | 'inline';
    
    /** Kích thước của spinner: 'sm' | 'md' | 'lg' */
    size?: 'sm' | 'md' | 'lg';
    
    /** Văn bản hiển thị kèm theo (chỉ áp dụng cho 'full' và 'section') */
    text?: string;
    
    /** Tự định nghĩa thêm className cho container */
    className?: string;
}

export default function Loading({
    variant = 'section',
    size = 'md',
    text = 'Đang tải dữ liệu...',
    className,
}: LoadingProps) {
    
    // Text size mapping
    const textSizes = {
        sm: 'text-xs',
        md: 'text-xs sm:text-sm',
        lg: 'text-xs sm:text-sm',
    };

    // Dynamic stroke width mapping based on size for elegant proportions
    const bgStrokeWidths = {
        sm: 4,
        md: 3.5,
        lg: 2.2, // Giảm độ dày mỏng mịn sang trọng cho size lớn
    };

    const fgStrokeWidths = {
        sm: 4.5,
        md: 4,
        lg: 2.5, // Giảm độ dày mỏng mịn sang trọng cho size lớn
    };

    // Custom SVG Spinner component
    const Spinner = ({ customClass }: { customClass?: string }) => (
        <svg
            className={cn(
                'animate-spin text-brand-primary shrink-0',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-10 w-10',
                size === 'lg' && 'h-16 w-16',
                customClass
            )}
            viewBox="0 0 50 50"
        >
            {/* Vòng mờ nền */}
            <circle
                className="opacity-20"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth={bgStrokeWidths[size]}
            />
            {/* Khúc loading đậm xoay xung quanh */}
            <circle
                className="opacity-100"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth={fgStrokeWidths[size]}
                strokeDasharray="125"
                strokeDashoffset="80"
                strokeLinecap="round"
            />
        </svg>
    );

    if (variant === 'inline') {
        return <Spinner customClass={className} />;
    }

    const containerStyles = {
        full: 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-300',
        section: 'absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent min-h-[200px] transition-all duration-300',
    };

    return (
        <div className={cn(containerStyles[variant], className)}>
            <div className="flex flex-col items-center justify-center gap-3.5">
                {/* Premium Spinner */}
                <Spinner />
                
                {text && (
                    <p
                        className={cn(
                            'font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse text-center select-none',
                            textSizes[size]
                        )}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
