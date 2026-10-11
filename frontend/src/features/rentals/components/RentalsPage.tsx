// frontend/src/features/rentals/components/RentalsPage.tsx

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

  // Passando os parâmetros com cast correto para os enums esperados pelo tipo
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


  // Handlers que resetam a página para 1 ao filtrar
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

  // Tratamento seguro para array ou objeto paginado sem erro de tipo (any cast para compatibilidade)
  const rentalsData: any = data;
  const rentals: Rental[] = Array.isArray(rentalsData) ? rentalsData : rentalsData?.items || [];
  const totalItems: number = Array.isArray(rentalsData) ? rentalsData.length : rentalsData?.total || rentals.length;
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Locações</h1>
          <p className="text-sm text-gray-500">Controle de contratos, entregas e devoluções.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4" /> Nova Locação
        </Button>
      </div>

      {/* Barra de Filtros Avançados */}
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

      <RentalTable
        rentals={rentals}
        isLoading={isLoading}
        onFinishRental={handleFinishRental}
        onReactivateRental={handleReactivateRental}
        onTogglePaymentStatus={handleTogglePaymentStatus}
        onSelectRental={(rental) => setSelectedRental(rental)}
      />

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
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <RentalFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <RentalDetailsModal rental={selectedRental} isOpen={!!selectedRental} onClose={() => setSelectedRental(null)} />
    </div>
  );
}