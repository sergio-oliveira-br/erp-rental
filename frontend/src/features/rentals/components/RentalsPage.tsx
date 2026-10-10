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
import type { PaymentStatus } from '@/types';

export function RentalsPage() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useRentals({ page, limit: 10 });
  const finishRental = useFinishRental();
  const reactivateRental = useReactivateRental();
  const updatePaymentStatus = useUpdatePaymentStatus();

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

  const rentals = Array.isArray(data) ? data : data?.items || [];
  const totalItems = Array.isArray(data) ? data.length : data?.total || 0;
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

      <RentalTable
        rentals={rentals}
        isLoading={isLoading}
        onFinishRental={handleFinishRental}
        onReactivateRental={handleReactivateRental}
        onTogglePaymentStatus={handleTogglePaymentStatus}
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
    </div>
  );
}