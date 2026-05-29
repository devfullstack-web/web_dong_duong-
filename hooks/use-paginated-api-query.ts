'use client';

import * as React from 'react';
import { useQuery, type QueryKey } from '@tanstack/react-query';
import $api from '@/utils/axios';

export interface PaginatedMeta {
    total: number;
    totalPages: number;
}

export interface PaginatedApiResult<T> {
    data: T[];
    meta: PaginatedMeta;
}

interface UsePaginatedApiQueryOptions {
    endpoint: string;
    queryKey: QueryKey;
    pageSize?: number;
    params?: Record<string, unknown>;
    scrollTargetRef?: React.RefObject<HTMLElement | null>;
}

export function usePaginatedApiQuery<T>({
    endpoint,
    queryKey,
    pageSize = 12,
    params = {},
    scrollTargetRef,
}: UsePaginatedApiQueryOptions) {
    const [currentPage, setCurrentPage] = React.useState(1);

    const query = useQuery<PaginatedApiResult<T>>({
        queryKey: [...queryKey, { page: currentPage, params, pageSize }],
        queryFn: async () => {
            const response = await $api.get(endpoint, {
                params: {
                    ...params,
                    page: currentPage,
                    limit: pageSize,
                },
            });

            if (!response.data.success) {
                throw new Error(`Failed to fetch ${endpoint}`);
            }

            return {
                data: response.data.data || [],
                meta: response.data.meta || { total: 0, totalPages: 1 },
            };
        },
    });

    const items = React.useMemo(() => query.data?.data || [], [query.data]);
    const meta = query.data?.meta || { total: 0, totalPages: 1 };

    const handlePageChange = React.useCallback(
        (page: number) => {
            setCurrentPage(page);

            if (scrollTargetRef?.current) {
                scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [scrollTargetRef],
    );

    return {
        ...query,
        currentPage,
        setCurrentPage,
        handlePageChange,
        items,
        meta,
        totalPages: meta.totalPages || 1,
        total: meta.total || 0,
    };
}
