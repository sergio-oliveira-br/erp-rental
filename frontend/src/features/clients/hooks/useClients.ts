// frontend/src/features/clients/hooks/useClients.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClientCreatePayload, ClientUpdatePayload } from '@/types';
import { clientService } from '../services/clientService';
import type { GetClientsParams } from '../services/clientService';
import { toast } from "sonner";

// Query Keys Factory para gerenciamento seguro de cache
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: GetClientsParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Hook para buscar a lista de clientes
export function useClients(params?: GetClientsParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientService.getClients(params),
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante a paginação
  });
}

// Hook para buscar um único cliente por ID
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.getClientById(id),
    enabled: Boolean(id),
  });
}

// Hook para criação de cliente
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientCreatePayload) => clientService.createClient(payload),
    onSuccess: (newClient) => {
      // Invalida a lista para forçar o refetch e atualizar a tabela
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });

      // Notificação global disparada automaticamente!
      toast.success('Cliente cadastrado com sucesso!', {
        description: `${newClient.name} foi adicionado à base.`,
      });
    },
    onError: () => {
      toast.error('Erro ao cadastrar cliente. Verifique os dados enviados.');
    },
  });
}

// Hook para atualização de cliente
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientUpdatePayload }) =>
      clientService.updateClient(id, payload),
    onSuccess: (_, variables) => {
      toast.success(`Cliente ${_.name} atualizado com sucesso!`)
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
    onError: () => {
      toast.error(`Não foi possível atualizar o cadastro do cliente.`)
    }
  });
}

// Hook para deleção de cliente
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}