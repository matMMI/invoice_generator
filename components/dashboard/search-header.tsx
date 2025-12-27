"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import { FormEvent } from "react";

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (e: FormEvent) => void;
  onClear: () => void;
  placeholder?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function SearchHeader({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Rechercher...",
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: SearchHeaderProps) {
  if (loading && totalPages === 0) {
    // Initial loading or reset state skeleton
    return (
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <Skeleton className="h-10 w-64 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
      <form onSubmit={onSearch} className="flex-1 w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-10"
            />
            {value && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary">
            Rechercher
          </Button>
        </div>
      </form>

      {totalPages > 0 && (
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
