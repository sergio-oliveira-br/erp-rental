// frontend/src/features/dashboard/components/WelcomePage.tsx

import { WelcomeHeader } from './WelcomeHeader';
import { QuickStats } from './QuickStats';
import { ActionHub } from './ActionHub';
import { useRentals } from '@/features/rentals/hooks/useRentals';
import { RentalStatus, PaymentStatus, type Rental } from '@/types';

interface WelcomePageProps {
  onSelectTab: (tab: 'welcome' | 'clients' | 'materials' | 'rentals') => void;
}

export function WelcomePage({ onSelectTab }: WelcomePageProps) {
  const { data, isLoading } = useRentals({ page: 1, limit: 100 });

  const rentals: Rental[] = Array.isArray(data)
    ? data
    : (data as any)?.items
    ? (data as any).items
    : [];

  const activeRentalsCount = rentals.filter(
    (rental: Rental) => rental.rental_status === RentalStatus.ACTIVE || (rental as any).status === 'ACTIVE'
  ).length;

  const pendingPaymentsCount = rentals.filter(
    (rental: Rental) => rental.payment_status === PaymentStatus.PENDING
  ).length;

  const totalMonthlyRevenue = rentals
    .filter((rental: Rental) => rental.payment_status === PaymentStatus.PAID)
    .reduce((acc: number, rental: Rental) => acc + Number(rental.total_value || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <WelcomeHeader activeCount={activeRentalsCount} />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          <div className="bg-gray-100 h-24 rounded-2xl" />
          <div className="bg-gray-100 h-24 rounded-2xl" />
          <div className="bg-gray-100 h-24 rounded-2xl" />
        </div>
      ) : (
        <QuickStats
          activeRentals={activeRentalsCount}
          pendingPaymentsCount={pendingPaymentsCount}
          monthlyRevenue={totalMonthlyRevenue}
        />
      )}

      <ActionHub onSelectTab={onSelectTab} />
    </div>
  );
}