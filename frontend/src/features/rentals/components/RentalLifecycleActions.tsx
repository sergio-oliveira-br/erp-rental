// frontend/src/features/rentals/components/RentalLifecycleActions.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { rentalKeys } from '../utils/rentalKeys';
import { RentalStatus, type Rental } from '@/types';

interface RentalLifecycleActionsProps {
  rental: Rental;
  onSuccess: () => void;
}

export function RentalLifecycleActions({ rental, onSuccess }: RentalLifecycleActionsProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatus = rental.rental_status;
  const isActive = currentStatus === RentalStatus.ACTIVE;

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza absoluta que deseja cancelar este contrato? Esta ação é irreversível.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/rentals/${rental.id}/cancel`);
      toast.success('Contrato cancelado com sucesso!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['rental-logs', rental.id] });
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar contrato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async () => {
    if (!window.confirm('Deseja reativar este contrato de locação?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/rentals/${rental.id}/reactivate`);
      toast.success('Contrato reativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['rental-logs', rental.id] });
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao reativar contrato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-dashed border-gray-200 space-y-3 bg-gray-50/50 p-4 rounded-xl">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Gerenciamento de Ciclo de Vida</h4>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          {isActive ? (
            <span>Contrato ativo. Deseja cancelar este contrato por desistência ou erro?</span>
          ) : (
            <span>Este contrato está encerrado/cancelado. Deseja reativá-lo?</span>
          )}
        </div>

        {isActive ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={handleCancel}
            className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs shrink-0"
          >
            {isSubmitting ? 'Processando...' : 'Cancelar Contrato'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={handleReactivate}
            className="text-amber-700 hover:bg-amber-50 border-amber-200 text-xs shrink-0"
          >
            {isSubmitting ? 'Processando...' : 'Reativar Contrato'}
          </Button>
        )}
      </div>
    </div>
  );
}