"use client";

import { Table } from "@tanstack/react-table";
import { TablePagination } from "@/components/portal/table-pagination";

interface DataTablePaginationProps<TData> {
  table?: Table<TData>;
  currentPage?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemLabel?: string;
}

export function DataTablePagination<TData>({
  table,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = "mục",
}: DataTablePaginationProps<TData>) {
  // If we have explicit props, use them (server-side pagination)
  if (
    currentPage !== undefined &&
    totalItems !== undefined &&
    pageSize !== undefined &&
    onPageChange &&
    onPageSizeChange
  ) {
    return (
      <TablePagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel={itemLabel}
      />
    );
  }

  // Otherwise, fallback to client-side table pagination if table object is provided
  if (!table) return null;

  const pageIndex = table.getState().pagination.pageIndex;
  const size = table.getState().pagination.pageSize;
  const filteredRows = table.getFilteredRowModel().rows.length;

  return (
    <TablePagination
      currentPage={pageIndex + 1}
      totalItems={filteredRows}
      pageSize={size}
      onPageChange={(page) => table.setPageIndex(page - 1)}
      onPageSizeChange={(s) => table.setPageSize(s)}
      itemLabel={itemLabel}
    />
  );
}
