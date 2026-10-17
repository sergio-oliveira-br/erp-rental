// frontend/src/components/layouts/EntityPageLayout.tsx

import type { ReactNode } from 'react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';

interface EntityPageLayoutProps {
  title: string;
  description: string;
  actions?: ReactNode;
  banner?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  customFilterBar?: ReactNode;
  children: ReactNode;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function EntityPageLayout({
  title,
  description,
  actions,
  banner,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  customFilterBar,
  children,
  page,
  totalPages,
  onPageChange,
}: EntityPageLayoutProps) {
  return (
    <div className="space-y-6">
      {banner}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {customFilterBar ? (
        customFilterBar
      ) : onSearchChange !== undefined && searchValue !== undefined ? (
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      ) : null}

      {children}

      {/* Paginação isolada e reaproveitável */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}