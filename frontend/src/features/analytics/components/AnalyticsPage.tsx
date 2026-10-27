// frontend/src/features/analytics/components/AnalyticsPage.tsx

import { useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { useRentals } from '@/features/rentals/hooks/useRentals';
import { FinancialOverviewSection } from './FinancialOverviewSection';
import { MaterialRevenueSection } from './MaterialRevenueSection';
import { ClientPerformanceSection } from './ClientPerformanceSection';
import { DiscountAuditSection } from './DiscountAuditSection';

export function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<'current_month' | 'last_3_months' | 'year_2026' | 'all'>('current_month');

  const { data: rentalsData } = useRentals({ page: 1, limit: 10000 });
  const rawRentals = Array.isArray(rentalsData) ? rentalsData : (rentalsData as any)?.items || [];


  // Filtra as locações conforme o período selecionado
  const filteredRentals = rawRentals.filter((rental: any) => {
    if (timeFilter === 'all') return true;

    if (!rental.start_date) return false;

    const rentalDate = new Date(rental.start_date);

    // Ignora datas inválidas
    if (Number.isNaN(rentalDate.getTime())) return false;

    const now = new Date();

    // Início do mês atual, incluindo o primeiro dia
    const startOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Início do próximo mês, exclusivo
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    if (timeFilter === 'current_month') {
      return (
        rentalDate >= startOfCurrentMonth &&
        rentalDate < startOfNextMonth
      );
    }

    if (timeFilter === 'last_3_months') {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      );

      return rentalDate >= startDate && rentalDate < startOfNextMonth;
    }

    if (timeFilter === 'year_2026') {
      return (
        rentalDate >= new Date(2026, 0, 1) &&
        rentalDate < new Date(2027, 0, 1)
      );
    }

    return true;
  });


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" /> Central Analítica & Governança
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Gerencial</h1>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200/80">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-800 focus:outline-none"
          >
            <option value="current_month">Mês Atual</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="year_2026">Ano de 2026</option>
            <option value="all">Todo o Período</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* BLOCO 1: Visão Financeira (Recebe o timeFilter e os dados filtrados) */}
        <FinancialOverviewSection rentals={filteredRentals} timeFilter={timeFilter} />

        {/* BLOCO 2: Receita por Material */}
        <MaterialRevenueSection rentals={filteredRentals} />

        {/* BLOCO 3: Top Clientes */}
        <ClientPerformanceSection rentals={filteredRentals} />

        {/* Bloco 4: Governança & Descontos */}
        <DiscountAuditSection rentals={filteredRentals} />
      </div>
    </div>
  );
}