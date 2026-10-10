// frontend/src/features/rentals/utils/rentalKeys.ts

import type { GetRentalsParams } from '@/types';

export const rentalKeys = {
  all: ['rentals'] as const,
  lists: () => [...rentalKeys.all, 'list'] as const,
  list: (params: GetRentalsParams) => [...rentalKeys.lists(), params] as const,
  details: () => [...rentalKeys.all, 'detail'] as const,
  detail: (id: string) => [...rentalKeys.details(), id] as const,
};