"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "@/components/shared/Loading";
import { DataTableToolbar } from "./toolbar";
import { DataTablePagination } from "./pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  
  // Controlled States
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  // Row callbacks
  onRowClick?: (row: TData) => void;

  // Custom Toolbar Props
  toolbarProps?: {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    filters?: React.ReactNode;
  };

  // Custom Pagination Props (For Server-Side Pagination)
  paginationProps?: {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    itemLabel?: string;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  loadingText = "Đang tải dữ liệu...",
  emptyText = "Không tìm thấy dữ liệu nào phù hợp.",
  emptyIcon,
  rowSelection = {},
  onRowSelectionChange,
  onRowClick,
  toolbarProps,
  paginationProps,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="relative flex items-center justify-center h-[400px]">
          <Loading variant="section" size="md" text={loadingText} />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="p-24 text-center h-[400px] flex items-center justify-center flex-col">
          {emptyIcon || <FileText size={64} className="text-slate-100 mb-6" />}
          <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">
            {emptyText}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-slate-50/30">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="px-4 md:px-5 py-3 md:py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-50">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={cn(
                  "hover:bg-slate-50/30 transition-colors group",
                  onRowClick && "cursor-pointer"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 md:px-5 py-3 md:py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="relative bg-white rounded-none border border-slate-100 overflow-hidden min-h-[500px]">
      {/* Search / Filters Toolbar */}
      {toolbarProps && (
        <DataTableToolbar
          table={table}
          searchValue={toolbarProps.searchValue}
          onSearchChange={toolbarProps.onSearchChange}
          searchPlaceholder={toolbarProps.searchPlaceholder}
        >
          {toolbarProps.filters}
        </DataTableToolbar>
      )}

      {/* Main Table Content */}
      {renderContent()}

      {/* Pagination Footer */}
      {!isLoading && data.length > 0 && (
        <DataTablePagination
          table={table}
          currentPage={paginationProps?.currentPage}
          totalItems={paginationProps?.totalItems}
          pageSize={paginationProps?.pageSize}
          onPageChange={paginationProps?.onPageChange}
          onPageSizeChange={paginationProps?.onPageSizeChange}
          itemLabel={paginationProps?.itemLabel}
        />
      )}
    </div>
  );
}
