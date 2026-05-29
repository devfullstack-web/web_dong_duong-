"use client";

import { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import * as React from "react";

interface ToolbarProps<TData> {
  table?: Table<TData>;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "TÌM KIẾM...",
  children,
}: ToolbarProps<TData>) {
  // If using internal table global filtering
  const internalSearchValue = (table?.getState().globalFilter as string) ?? "";
  const handleInternalSearchChange = (val: string) => {
    table?.setGlobalFilter(val || undefined);
  };

  const isControlled = searchValue !== undefined && onSearchChange !== undefined;
  const currentSearchValue = isControlled ? searchValue : internalSearchValue;
  const handleSearch = isControlled ? onSearchChange : handleInternalSearchChange;

  return (
    <div className="py-2.5 px-4 md:px-5 border-b border-slate-50 flex flex-col xl:flex-row gap-4 items-center justify-between bg-white">
      <div className="relative w-full xl:w-1/2 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
        <input
          placeholder={searchPlaceholder.toUpperCase()}
          className="w-full pl-12 bg-slate-50 border-none text-[9px] font-bold uppercase tracking-widest placeholder:text-slate-300 focus:ring-1 focus:ring-brand-primary/20 h-8 rounded-none outline-none"
          value={currentSearchValue}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {(children || table) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
