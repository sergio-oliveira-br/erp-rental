// frontend/src/components/layouts/EntityPageLayout.tsx

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';

interface EntityPageLayoutProps {
  title: string;
  description: string;
  actions?: ReactNode;
  banner?: ReactNode;
  // Suporte opcional a busca simples integrada
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Ou filtro customizado (como a barra avançada de Rentals)
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

      {/* Renderiza a busca simples ou um filtro customizado se fornecido */}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200 text-sm">
          <span className="text-gray-600">
            Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}