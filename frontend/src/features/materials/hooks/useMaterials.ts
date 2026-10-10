// frontend/src/features/materials/hooks/useMaterials.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { materialService } from '../services/materialService';
import { materialKeys } from '../utils/materialKeys';
import type { GetMaterialsParams, MaterialCreatePayload, MaterialUpdatePayload } from '@/types';

// Hook para listagem de materiais
export function useMaterials(params: GetMaterialsParams) {
  return useQuery({
    queryKey: materialKeys.list(params),
    queryFn: () => materialService.getMaterials(params),
  });
}

// Hook para buscar um único material
export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => materialService.getMaterialById(id),
    enabled: !!id,
  });
}

// Hook para criação de material
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MaterialCreatePayload) => materialService.createMaterial(payload),
    onSuccess: () => {
      toast.success('Material cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
    onError: () => {
      toast.error('Erro ao cadastrar material. Tente novamente.');
    },
  });
}

// Hook para edição de material
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MaterialUpdatePayload }) =>
      materialService.updateMaterial(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Material atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(id) });
    },
    onError: () => {
      toast.error('Erro ao atualizar dados do material.');
    },
  });
}

// Hook para exclusão/desativação de material
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialService.deleteMaterial(id),
    onSuccess: () => {
      toast.success('Material desativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
    onError: () => {
      toast.error('Erro ao desativar o material.');
    },
  });
}

// Hook para reativação de material
export function useActivateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialService.activateMaterial(id),
    onSuccess: () => {
      toast.success('Material reativado com sucesso!', {
        description: 'O equipamento voltou para a lista de materiais disponíveis.',
      });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
    onError: () => {
      toast.error('Erro ao reativar o material.');
    },
  });
}