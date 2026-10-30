// frontend/src/features/dashboard/components/RentalAlerts.tsx

import {useMemo, useState} from 'react';
import {CalendarClock, Wallet, AlertTriangle} from 'lucide-react';
import {RentalStatus, PaymentStatus, type Rental} from '@/types';
import {RentalAlertCard} from './RentalAlertCard';
import {RentalList} from './RentalList';

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

export function RentalAlerts({
    rentals,
    onSelectRental,
}: RentalAlertsProps) {
    const [expiringFilter, setExpiringFilter] =
        useState<ExpiringFilter>('next3days');

    const [expiringPage, setExpiringPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);

    const today = useMemo(
        () => startOfDay(new Date()),
        [],
    );

    const inThreeDays = useMemo(() => {
        const date = new Date(today);
        date.setDate(date.getDate() + 3);
        return date;
    }, [today]);

    const {
        overdue,
        nextThreeDays,
        allUpcoming,
        pendingPayments,
    } = useMemo(() => {
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
    }, [rentals, today, inThreeDays]);

    const visibleExpiring =
        expiringFilter === 'next3days'
            ? nextThreeDays
            : allUpcoming;

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

                {/* Contratos a vencer */}
                <RentalAlertCard
                    icon={<CalendarClock size={24}/>}
                    title="Contratos a vencer"
                    description="Próximos 3 dias"
                    count={nextThreeDays.length}
                    color="amber"
                >
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

                    <RentalList
                        items={visibleExpiring}
                        emptyMessage="Nenhum contrato neste período."
                        page={expiringPage}
                        onPageChange={setExpiringPage}
                        onSelectRental={onSelectRental}
                    />
                </RentalAlertCard>

                {/* Pagamentos pendentes */}
                <RentalAlertCard
                    icon={<Wallet size={24}/>}
                    title="Pagamentos pendentes"
                    description="Pendentes ou parciais"
                    count={pendingPayments.length}
                    color="red"
                >
                    <RentalList
                        items={pendingPayments}
                        emptyMessage="Nenhum pagamento pendente."
                        page={paymentsPage}
                        onPageChange={setPaymentsPage}
                        onSelectRental={onSelectRental}
                    />
                </RentalAlertCard>

            </div>

            {/* Alerta de contratos em atraso */}
            {overdue.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertTriangle
                        className="mt-0.5 shrink-0 text-red-700"
                        size={20}
                    />

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