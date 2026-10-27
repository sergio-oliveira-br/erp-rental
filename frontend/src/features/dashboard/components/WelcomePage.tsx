// frontend/src/features/dashboard/components/WelcomePage.tsx

import { WelcomeHeader } from './WelcomeHeader';
import { QuickStats } from './QuickStats';
import { ActionHub } from './ActionHub';
import { useRentals } from '@/features/rentals/hooks/useRentals';
import { RentalAlerts } from './RentalAlerts';
import { RentalStatus, PaymentStatus, type Rental } from '@/types';

interface WelcomePageProps {
  onSelectTab: (tab: 'welcome' | 'clients' | 'materials' | 'rentals') => void;
}

export function WelcomePage({ onSelectTab }: WelcomePageProps) {
  const { data, isLoading } = useRentals({ page: 1, limit: 10000 });

  const rentals: Rental[] = Array.isArray(data)
    ? data
    : (data as any)?.items
    ? (data as any).items
    : [];

  const activeRentalsCount = rentals.filter(
    (rental: Rental) => rental.rental_status === RentalStatus.ACTIVE || (rental as any).status === 'ACTIVE'
  ).length;

  // const pendingPaymentsCount = rentals.filter(
  //   (rental: Rental) => rental.payment_status === PaymentStatus.PENDING
  // ).length;

  const totalMonthlyRevenue = rentals
    .filter((rental: Rental) => rental.payment_status === PaymentStatus.PAID)
    .reduce((acc: number, rental: Rental) => acc + Number(rental.total_value || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <WelcomeHeader activeCount={activeRentalsCount} />

      {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        ) : (
          <>
            <QuickStats monthlyRevenue={totalMonthlyRevenue} />

            <RentalAlerts
              rentals={rentals}
              onSelectRental={() => onSelectTab('rentals')}
            />
          </>
        )}
      <ActionHub onSelectTab={onSelectTab} />
    </div>
  );
}