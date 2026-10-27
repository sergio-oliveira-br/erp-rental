// frontend/src/features/dashboard/components/RentalAlerts.tsx


import {useMemo, useState} from 'react';
import {Pagination} from '@/components/ui/Pagination';
import {
    CalendarClock,
    Wallet,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
} from 'lucide-react';
import {
    RentalStatus,
    PaymentStatus,
    type Rental,
} from '@/types';

type ExpiringFilter = 'next3days' | 'all';

interface RentalAlertsProps {
    rentals: Rental[];
    onSelectRental?: (rental: Rental) => void;
}

function parseDate(date: string): Date {
    // Evita diferenças de fuso horário em datas no formato YYYY-MM-DD.
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

export function RentalAlerts({
                                 rentals,
                                 onSelectRental,
                             }: RentalAlertsProps) {
    const [expiringOpen, setExpiringOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [expiringFilter, setExpiringFilter] =
        useState<ExpiringFilter>('next3days');

    const today = startOfDay(new Date());

    const [expiringPage, setExpiringPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);

    const PAGE_SIZE = 5;

    const inThreeDays = new Date(today);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const {overdue, nextThreeDays, allUpcoming, pendingPayments} =
        useMemo(() => {
            const active = rentals.filter(
                (rental) => rental.rental_status === RentalStatus.ACTIVE,
            );

            const overdue = rentals.filter(
                (rental) => rental.rental_status === RentalStatus.OVERDUE,
            );

            const upcoming = active
                .filter((rental) => {
                    const endDate = parseDate(rental.end_date);
                    return endDate >= today;
                })
                .sort(
                    (a, b) =>
                        parseDate(a.end_date).getTime() -
                        parseDate(b.end_date).getTime(),
                );

            const nextThreeDays = upcoming.filter((rental) => {
                const endDate = parseDate(rental.end_date);
                return endDate <= inThreeDays;
            });

            const pendingPayments = rentals
                .filter(
                    (rental) =>
                        rental.rental_status !== RentalStatus.CANCELLED &&
                        (
                            rental.payment_status === PaymentStatus.PENDING ||
                            rental.payment_status === PaymentStatus.PARTIAL
                        ),
                )
                .sort(
                    (a, b) =>
                        parseDate(a.end_date).getTime() -
                        parseDate(b.end_date).getTime(),
                );

            return {
                overdue,
                nextThreeDays,
                allUpcoming: upcoming,
                pendingPayments,
            };
        }, [rentals, today.getTime(), inThreeDays.getTime()]);

    const visibleExpiring =
        expiringFilter === 'next3days' ? nextThreeDays : allUpcoming;


    function renderRentalList(
        items: Rental[],
        emptyMessage: string,
        page: number,
        onPageChange: (page: number) => void,
    ) {
        const totalPages = Math.ceil(items.length / PAGE_SIZE);
        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedItems = items.slice(
            startIndex,
            startIndex + PAGE_SIZE,
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
                    Exibindo {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, items.length)}
                    {' de '}
                    {items.length} contratos
                </p>
            </div>
        );
    }


    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    Atenção necessária
                </h2>
                {overdue.length > 0 && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            {overdue.length} contrato(s) em atraso
          </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Vencimentos */}
                <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setExpiringOpen((open) => !open)}
                        aria-expanded={expiringOpen}
                        className="flex w-full items-center gap-3 p-5 text-left hover:bg-amber-50/50"
                    >
            <span className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <CalendarClock size={24}/>
            </span>

                        <span className="min-w-0 flex-1">
              <span className="block font-medium text-gray-900">
                Contratos a vencer
              </span>
              <span className="block text-sm text-gray-500">
                Próximos 3 dias
              </span>
            </span>

                        <span className="text-2xl font-bold text-amber-700">
              {nextThreeDays.length}
            </span>

                        {expiringOpen
                            ? <ChevronUp size={20}/>
                            : <ChevronDown size={20}/>}
                    </button>

                    {expiringOpen && (
                        <div className="border-t border-amber-100 px-5 pb-4">
                            <div className="flex flex-wrap gap-2 py-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExpiringFilter('next3days');
                                        setExpiringPage(1);
                                    }}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                        expiringFilter === 'next3days'
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Próximos 3 dias ({nextThreeDays.length})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setExpiringFilter('all');
                                        setExpiringPage(1);
                                    }}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                                        expiringFilter === 'all'
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Todos a vencer ({allUpcoming.length})
                                </button>
                            </div>

                            {renderRentalList(
                                visibleExpiring,
                                'Nenhum contrato neste período.',
                                expiringPage,
                                setExpiringPage,
                            )}
                        </div>
                    )}
                </div>

                {/* Pagamentos */}
                <div className="overflow-hidden rounded-2xl border border-red-200 bg-white">
                    <button
                        type="button"
                        onClick={() => setPaymentsOpen((open) => !open)}
                        aria-expanded={paymentsOpen}
                        className="flex w-full items-center gap-3 p-5 text-left hover:bg-red-50/50"
                    >
            <span className="rounded-xl bg-red-50 p-3 text-red-700">
              <Wallet size={24}/>
            </span>

                        <span className="min-w-0 flex-1">
              <span className="block font-medium text-gray-900">
                Pagamentos pendentes
              </span>
              <span className="block text-sm text-gray-500">
                Pendentes ou parciais
              </span>
            </span>

                        <span className="text-2xl font-bold text-red-700">
              {pendingPayments.length}
            </span>

                        {paymentsOpen
                            ? <ChevronUp size={20}/>
                            : <ChevronDown size={20}/>}
                    </button>

                    {paymentsOpen && (
                        <div className="border-t border-red-100 px-5 pb-4">
                            {renderRentalList(
                                pendingPayments,
                                'Nenhum pagamento pendente.',
                                paymentsPage,
                                setPaymentsPage,
                            )}
                        </div>
                    )}
                </div>
            </div>

            {overdue.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle className="mt-0.5 shrink-0 text-red-700" size={20}/>
                    <div>
                        <p className="text-sm font-semibold text-red-900">
                            Existem contratos em atraso
                        </p>
                        <p className="mt-1 text-sm text-red-800">
                            {overdue.length} contrato(s) estão marcados como atrasados.
                            Verifique a devolução dos materiais.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}