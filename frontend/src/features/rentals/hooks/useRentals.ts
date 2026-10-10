// frontend/src/features/rentals/hooks/useRentals.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rentalService } from '../services/rentalService';
import { rentalKeys } from '../utils/rentalKeys';
import { materialKeys } from '@/features/materials/utils/materialKeys';
import type {GetRentalsParams, PaymentStatus, RentalCreatePayload} from '@/types';

// Hook de busca/listagem
export function useRentals(params: GetRentalsParams) {
  return useQuery({
    queryKey: rentalKeys.list(params),
    queryFn: () => rentalService.getRentals(params),
  });
}

// Hook de busca por ID
export function useRental(id: string) {
  return useQuery({
    queryKey: rentalKeys.detail(id),
    queryFn: () => rentalService.getRentalById(id),
    enabled: !!id,
  });
}

// Hook de criação de locação
export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RentalCreatePayload) => rentalService.createRental(payload),
    onSuccess: () => {
      toast.success('Contrato de locação criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao emitir contrato de locação.';
      toast.error(message);
    },
  });
}

// Hook para finalizar/devolver locação
export function useFinishRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalService.finishRental(id),
    onSuccess: (_, id) => {
      toast.success('Locação finalizada e equipamento devolvido!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rentalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao finalizar a locação.';
      toast.error(message);
    },
  });
}

// Hook para reativar locação
export function useReactivateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rentalService.reactivateRental(id),
    onSuccess: () => {
      toast.success('Locação reaberta com sucesso!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao reabrir a locação.';
      toast.error(message);
    },
  });
}

// Hook para atualizar o status de pagamento
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      rentalService.updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      toast.success('Status de pagamento atualizado!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar pagamento.';
      toast.error(message);
    },
  });
}