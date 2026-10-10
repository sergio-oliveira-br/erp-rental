// frontend/src/features/materials/services/materialService.ts

import { apiClient } from '@/api/client';
import type {
  Material,
  MaterialCreatePayload,
  MaterialUpdatePayload,
  GetMaterialsParams,
  PaginatedResponse,
} from '@/types';

export const materialService = {
  // Listagem paginada e com filtro por status
  getMaterials: async (params?: GetMaterialsParams): Promise<PaginatedResponse<Material>> => {
    const response = await apiClient.get<PaginatedResponse<Material>>('/materials/', { params });
    return response.data;
  },

  // Busca material por ID
  getMaterialById: async (id: string): Promise<Material> => {
    const response = await apiClient.get<Material>(`/materials/${id}`);
    return response.data;
  },

  // Criação de novo material
  createMaterial: async (payload: MaterialCreatePayload): Promise<Material> => {
    const response = await apiClient.post<Material>('/materials/', payload);
    return response.data;
  },

  // Atualização de material existente
  updateMaterial: async (id: string, payload: MaterialUpdatePayload): Promise<Material> => {
    const response = await apiClient.put<Material>(`/materials/${id}`, payload);
    return response.data;
  },

  // Desativação (Soft Delete)
  deleteMaterial: async (id: string): Promise<void> => {
    await apiClient.delete(`/materials/${id}`);
  },

  // Reativação do material
  activateMaterial: async (id: string): Promise<Material> => {
    const response = await apiClient.patch<Material>(`/materials/${id}/activate`);
    return response.data;
  },
};