// frontend/src/features/dashboard/hooks/useDashboard.ts


import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  currentUser: () => [...dashboardKeys.all, 'currentUser'] as const,
};

export function useDashboardUser() {
  return useQuery({
    queryKey: dashboardKeys.currentUser(),
    queryFn: () => dashboardService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}