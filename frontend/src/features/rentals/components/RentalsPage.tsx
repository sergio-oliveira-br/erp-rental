// frontend/src/features/rentals/components/RentalsPage.tsx

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import {
  useRentals,
  useFinishRental,
  useReactivateRental,
  useUpdatePaymentStatus,
} from '../hooks/useRentals';
import { RentalTable } from './RentalTable';
import { RentalFormModal } from './RentalFormModal';
import { RentalDetailsModal } from './RentalDetailsModal';
import { RentalsFilterBar } from './RentalsFilterBar';
import { RentalStatus, PaymentStatus, type Rental } from '@/types';

export function RentalsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const { data, isLoading } = useRentals({
    page,
    limit: 10,
    search: search || undefined,
    status: status ? (status as RentalStatus) : undefined,
    payment_status: paymentStatus ? (paymentStatus as PaymentStatus) : undefined,
    start_date_from: dateFrom || undefined,
    start_date_to: dateTo || undefined,
  });

  const finishRental = useFinishRental();
  const reactivateRental = useReactivateRental();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handlePaymentStatusChange = (val: string) => {
    setPaymentStatus(val);
    setPage(1);
  };

  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    setPage(1);
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleFinishRental = async (id: string) => {
    if (window.confirm('Confirma o encerramento da locação e devolução do equipamento?')) {
      await finishRental.mutateAsync(id);
    }
  };

  const handleReactivateRental = async (id: string) => {
    if (window.confirm('Deseja reabrir esta locação finalizada?')) {
      await reactivateRental.mutateAsync(id);
    }
  };

  const handleTogglePaymentStatus = async (id: string, newStatus: PaymentStatus) => {
    await updatePaymentStatus.mutateAsync({ id, paymentStatus: newStatus });
  };

  const rentalsData: any = data;
  const rentals: Rental[] = Array.isArray(rentalsData) ? rentalsData : rentalsData?.items || [];
  const totalItems: number = Array.isArray(rentalsData) ? rentalsData.length : rentalsData?.total || rentals.length;
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <EntityPageLayout
      title="Gestão de Locações"
      description="Controle de contratos, entregas e devoluções."
      customFilterBar={
        <RentalsFilterBar
          search={search}
          setSearch={handleSearchChange}
          status={status}
          setStatus={handleStatusChange}
          paymentStatus={paymentStatus}
          setPaymentStatus={handlePaymentStatusChange}
          dateFrom={dateFrom}
          setDateFrom={handleDateFromChange}
          dateTo={dateTo}
          setDateTo={handleDateToChange}
          onReset={handleResetFilters}
        />
      }
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4" /> Nova Locação
        </Button>
      }
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      <RentalTable
        rentals={rentals}
        isLoading={isLoading}
        onFinishRental={handleFinishRental}
        onReactivateRental={handleReactivateRental}
        onTogglePaymentStatus={handleTogglePaymentStatus}
        onSelectRental={(rental) => setSelectedRental(rental)}
      />

      <RentalFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <RentalDetailsModal
        rental={selectedRental}
        isOpen={!!selectedRental}
        onClose={() => setSelectedRental(null)}
      />
    </EntityPageLayout>
  );
}