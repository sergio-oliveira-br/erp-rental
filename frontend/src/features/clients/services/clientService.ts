// frontend/src/features/clients/services/clientService.ts

import { apiClient } from '@/api/client';
import type { Client, ClientCreatePayload, ClientUpdatePayload, PaginatedResponse } from '@/types';

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export const clientService = {
  // Listagem paginada e com filtro
  getClients: async (params?: GetClientsParams): Promise<PaginatedResponse<Client>>  => {
    const response = await apiClient.get<PaginatedResponse<Client>>('/clients/', { params });
    return response.data;
  },

  // Busca cliente por ID
  getClientById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Criação de cliente
  createClient: async (payload: ClientCreatePayload): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients/', payload);
    return response.data;
  },

  // Atualização parcial/total de cliente
  updateClient: async (id: string, payload: ClientUpdatePayload): Promise<Client> => {
    const response = await apiClient.put<Client>(`/v1/clients/${id}`, payload);
    return response.data;
  },

  // Remoção (soft delete ou exclusão)
  deleteClient: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/clients/${id}`);
  },
};