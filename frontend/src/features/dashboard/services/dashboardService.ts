// frontend/src/features/dashboard/services/dashboardService.ts

import { apiClient } from '@/api/client';

export interface CurrentUser {
  id: string;
  username: string;
  is_admin: boolean;
  is_active: boolean;
}

export const dashboardService = {
  async getCurrentUser(): Promise<CurrentUser> {
    const response = await apiClient.get<CurrentUser>('/auth/me');
    return response.data;
  },
};

