import type * as React from 'react';
import { useLocale } from 'next-intl';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface SitePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    linkClassName?: string;
    numbered?: boolean;
}

export function SitePagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
    linkClassName,
    numbered = false,
}: SitePaginationProps) {
    const locale = useLocale();
    const prevLabel = locale === 'zh' ? '上一页' : locale === 'en' ? 'Previous' : 'Trang trước';
    const nextLabel = locale === 'zh' ? '下一页' : locale === 'en' ? 'Next' : 'Trang sau';

    if (totalPages <= 1) return null;

    const goToPage = (event: React.MouseEvent<HTMLAnchorElement>, page: number) => {
        event.preventDefault();
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    return (
        <div className={cn('flex justify-center', className)}>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(event) => goToPage(event, currentPage - 1)}
                            className={cn(
                                'font-bold uppercase tracking-wider',
                                linkClassName || 'text-xs',
                                currentPage === 1 && 'opacity-30 pointer-events-none',
                            )}
                        >
                            <span className="hidden sm:block">{prevLabel}</span>
                        </PaginationPrevious>
                    </PaginationItem>

                    {numbered ? (
                        Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    onClick={(event) => goToPage(event, page)}
                                    isActive={currentPage === page}
                                    className="text-xs sm:text-sm font-black"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))
                    ) : (
                        <PaginationItem>
                            <span className="text-xs sm:text-sm font-black px-4">
                                {currentPage} / {totalPages}
                            </span>
                        </PaginationItem>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(event) => goToPage(event, currentPage + 1)}
                            className={cn(
                                'font-bold uppercase tracking-wider',
                                linkClassName || 'text-xs',
                                currentPage === totalPages && 'opacity-30 pointer-events-none',
                            )}
                        >
                            <span className="hidden sm:block">{nextLabel}</span>
                        </PaginationNext>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
