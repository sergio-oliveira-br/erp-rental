
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import type { Rental } from '@/types';

interface RentalListProps {
    items: Rental[];
    emptyMessage: string;
    page: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onSelectRental?: (rental: Rental) => void;

    actionLabel?: string;
    actionVariant?: 'danger' | 'success';
    onAction?: (rental: Rental) => void;
    actionDisabled?: boolean;
}

function parseDate(date: string): Date {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatDate(date: string): string {
    return parseDate(date).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function RentalList({
    items,
    emptyMessage,
    page,
    pageSize = 5,
    onPageChange,
    onSelectRental,
    actionLabel,
    actionVariant = 'success',
    onAction,
    actionDisabled = false,
}: RentalListProps) {
    const totalPages = Math.ceil(items.length / pageSize);

    const currentPage = Math.min(page, Math.max(totalPages, 1));

    const startIndex = (currentPage - 1) * pageSize;

    const paginatedItems = items.slice(
        startIndex,
        startIndex + pageSize,
    );

    if (items.length === 0) {
        return (
            <p className="py-4 text-sm text-gray-500">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div>
            <div className="divide-y divide-gray-100">
                {paginatedItems.map((rental) => (
                    <div
                        key={rental.id}
                        className="flex items-center gap-3 py-3"
                    >
                        {/* Informações do contrato */}
                        <button
                            type="button"
                            onClick={() => onSelectRental?.(rental)}
                            className="min-w-0 flex-1 text-left hover:bg-gray-50"
                        >
                            <p className="truncate text-sm font-medium text-gray-900">
                                {rental.client_name || 'Cliente não identificado'}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                {rental.material_name || 'Material não identificado'}
                                {' · '}
                                Contrato #{rental.id.slice(0, 8)}
                            </p>
                        </button>

                        {/* Data e valor */}
                        <div className="shrink-0 text-right">
                            <p className="text-sm font-medium text-gray-800">
                                {formatDate(rental.end_date)}
                            </p>

                            <p className="text-xs text-gray-500">
                                {formatCurrency(Number(rental.total_value || 0))}
                            </p>
                        </div>

                        {/* Único botão de ação */}
                        {actionLabel && onAction && (
                            <div className="shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={actionDisabled}
                                    onClick={() => onAction(rental)}
                                    className={`whitespace-nowrap transition-colors ${
                                        actionVariant === 'danger'
                                            ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300'
                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                                    }`}
                                >
                                    {actionLabel}
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-3">
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>

            <p className="mt-2 text-xs text-gray-500">
                Exibindo {startIndex + 1}–
                {Math.min(startIndex + pageSize, items.length)}
                {' de '}
                {items.length} contratos
            </p>
        </div>
    );
}