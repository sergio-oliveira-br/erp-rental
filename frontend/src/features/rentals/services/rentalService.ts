// frontend/src/features/rentals/services/rentalService.ts

import { apiClient } from '@/api/client';
import type {
  Rental,
  RentalCreatePayload,
  GetRentalsParams,
  PaginatedResponse, PaymentStatus,
} from '@/types';

export const rentalService = {
  getRentals: async (params?: GetRentalsParams): Promise<PaginatedResponse<Rental>> => {
    const response = await apiClient.get<PaginatedResponse<Rental>>('/rentals/', { params });
    return response.data;
  },

  getRentalById: async (id: string): Promise<Rental> => {
    const response = await apiClient.get<Rental>(`/rentals/${id}`);
    return response.data;
  },

  createRental: async (payload: RentalCreatePayload): Promise<Rental> => {
    const response = await apiClient.post<Rental>('/rentals/', payload);
    return response.data;
  },

  finishRental: async (id: string): Promise<Rental> => {
    const response = await apiClient.patch<Rental>(`/rentals/${id}/finish`);
    return response.data;
  },

  reactivateRental: async (id: string): Promise<Rental> => {
    const response = await apiClient.patch<Rental>(`/rentals/${id}/reactivate`);
    return response.data;
  },

  updatePaymentStatus: async (id: string, payment_status: PaymentStatus): Promise<Rental> => {
    const response = await apiClient.patch<Rental>(`/rentals/${id}/payment`, { payment_status });
    return response.data;
  }
};