// frontend/src/features/dashboard/components/RentalAlerts.tsx

import {useMemo, useState} from 'react';
import {
    CalendarClock,
    Wallet,
    AlertTriangle,
} from 'lucide-react';

import {
    RentalStatus,
    PaymentStatus,
    type Rental,
} from '@/types';

import {
    RentalActionConfirmationModal,
    type RentalAction,
} from '@/features/rentals/components/RentalActionConfirmationModal';

import {RentalAlertCard} from './RentalAlertCard';
import {RentalList} from './RentalList';

type ExpiringFilter = 'next3days' | 'all';

interface RentalAlertsProps {
    rentals: Rental[];
    onSelectRental?: (rental: Rental) => void;

    onFinishRental: (id: string) => Promise<unknown>;
    onMarkPaymentPaid: (id: string) => Promise<unknown>;

    isFinishing: boolean;
    isUpdatingPayment: boolean;
}

function parseDate(date: string): Date {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function RentalAlerts({
                                 rentals,
                                 onSelectRental,
                                 onFinishRental,
                                 onMarkPaymentPaid,
                                 isFinishing,
                                 isUpdatingPayment,
                             }: RentalAlertsProps) {
    const [expiringFilter, setExpiringFilter] =
        useState<ExpiringFilter>('next3days');

    const [overduePage, setOverduePage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [expiringPage, setExpiringPage] = useState(1);

    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [selectedAction, setSelectedAction] = useState<RentalAction | null>(null);

    const PAGE_SIZE = 5;

    const today = startOfDay(new Date());

    const inThreeDays = new Date(today);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const {
        overdue,
        nextThreeDays,
        allUpcoming,
        pendingPayments,
    } = useMemo(() => {
        // Contratos ativos cuja data de devolução já passou.
        const overdue = rentals
            .filter(
                (rental) =>
                    rental.rental_status === RentalStatus.ACTIVE &&
                    parseDate(rental.end_date) < today,
            )
            .sort(
                (a, b) =>
                    parseDate(a.end_date).getTime() -
                    parseDate(b.end_date).getTime(),
            );

        // Contratos ativos com vencimento hoje ou futuramente.
        const active = rentals.filter(
            (rental) => rental.rental_status === RentalStatus.ACTIVE,
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

        // Pagamentos pendentes, excluindo contratos cancelados.
        const pendingPayments = rentals
            .filter(
                (rental) =>
                    rental.rental_status !== RentalStatus.CANCELLED &&
                    rental.payment_status === PaymentStatus.PENDING,
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
        expiringFilter === 'next3days'
            ? nextThreeDays
            : allUpcoming;

    const isPending = isFinishing || isUpdatingPayment;

    function openConfirmation(
        rental: Rental,
        action: RentalAction,
    ) {
        setSelectedRental(rental);
        setSelectedAction(action);
    }

    function closeConfirmation() {
        if (isPending) return;

        setSelectedRental(null);
        setSelectedAction(null);
    }

    async function handleConfirmAction() {
        if (!selectedRental || !selectedAction || isPending) return;

        try {
            if (selectedAction === 'finish') {
                await onFinishRental(selectedRental.id);
            } else {
                await onMarkPaymentPaid(selectedRental.id);
            }

            // Fecha somente após a operação ser concluída.
            setSelectedRental(null);
            setSelectedAction(null);

        } catch {
            // Os hooks já apresentam o Toast de erro.
            // Mantemos o modal aberto para permitir nova tentativa.
        }
    }

    return (
        <section className="space-y-4">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    Atenção necessária
                </h2>
            </div>

            {/* Cartões de alertas */}
            <div className="flex flex-col gap-4">

                {/* 1. Contratos em atraso */}
                <RentalAlertCard
                    icon={<AlertTriangle size={24}/>}
                    title="Contratos em atraso"
                    description="Contratos com devolução pendente"
                    count={overdue.length}
                    color="red"
                    defaultOpen
                >
                    <RentalList
                        items={overdue}
                        emptyMessage="Nenhum contrato em atraso."
                        page={overduePage}
                        pageSize={PAGE_SIZE}
                        onPageChange={setOverduePage}
                        onSelectRental={onSelectRental}
                        actionLabel="Encerrar contrato"
                        actionVariant="danger"
                        onAction={(rental) =>
                            openConfirmation(rental, 'finish')
                        }
                        actionDisabled={isFinishing}
                    />
                </RentalAlertCard>

                {/* 2. Pagamentos pendentes */}
                <RentalAlertCard
                    icon={<Wallet size={24}/>}
                    title="Pagamentos pendentes"
                    description="Pagamentos aguardando recebimento"
                    count={pendingPayments.length}
                    color="red"
                >
                    <RentalList
                        items={pendingPayments}
                        emptyMessage="Nenhum pagamento pendente."
                        page={paymentsPage}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPaymentsPage}
                        onSelectRental={onSelectRental}
                        actionLabel="Registrar pagamento"
                        actionVariant="success"
                        onAction={(rental) =>
                            openConfirmation(rental, 'payment')
                        }
                        actionDisabled={isUpdatingPayment}
                    />
                </RentalAlertCard>

                {/* 3. Contratos a vencer */}
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
                        pageSize={PAGE_SIZE}
                        onPageChange={setExpiringPage}
                        onSelectRental={onSelectRental}
                    />
                </RentalAlertCard>

            </div>

            {/* Modal compartilhado de confirmação */}
            <RentalActionConfirmationModal
                rental={selectedRental}
                action={selectedAction}
                isOpen={!!selectedRental && !!selectedAction}
                isPending={
                    selectedAction === 'finish'
                        ? isFinishing
                        : selectedAction === 'payment'
                            ? isUpdatingPayment
                            : false
                }
                onClose={closeConfirmation}
                onConfirm={handleConfirmAction}
            />

        </section>
    );
}