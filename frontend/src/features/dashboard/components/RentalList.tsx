// frontend/src/features/dashboard/components/RentalList.tsx


import {Pagination} from '@/components/ui/Pagination';
import type {Rental} from '@/types';

interface RentalListProps {
    items: Rental[];
    emptyMessage: string;
    page: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
    onSelectRental?: (rental: Rental) => void;
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
}: RentalListProps) {
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (page - 1) * pageSize;

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
                    <button
                        key={rental.id}
                        type="button"
                        onClick={() => onSelectRental?.(rental)}
                        className="flex w-full items-center gap-3 py-3 text-left hover:bg-gray-50"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {rental.client_name || 'Cliente não identificado'}
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                {rental.material_name || 'Material não identificado'}
                                {' · '}
                                Contrato #{rental.id.slice(0, 8)}
                            </p>
                        </div>

                        <div className="shrink-0 text-right">
                            <p className="text-sm font-medium text-gray-800">
                                {formatDate(rental.end_date)}
                            </p>

                            <p className="text-xs text-gray-500">
                                {formatCurrency(Number(rental.total_value || 0))}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-3">
                <Pagination
                    page={page}
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