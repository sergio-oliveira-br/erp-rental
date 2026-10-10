// frontend/src/features/materials/utils/materialKeys.ts

import type { GetMaterialsParams } from '@/types';

export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (params: GetMaterialsParams) => [...materialKeys.lists(), params] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
};