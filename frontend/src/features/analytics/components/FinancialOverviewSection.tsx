// frontend/src/features/analytics/components/FinancialOverviewSection.tsx

import { TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import type { Rental } from '@/types';
import { PaymentStatus } from '@/types';

interface FinancialOverviewSectionProps {
  rentals: Rental[];
  timeFilter: string;
}

export function FinancialOverviewSection({ rentals }: FinancialOverviewSectionProps) {
  // 1. Filtrar locações com base no período (exemplo simplificado de agregação)
  // Total Previsto (Soma de todos os contratos válidos no filtro)
  const totalProjected = rentals
    .filter(r => r.rental_status !== 'CANCELLED')
    .reduce((acc, r) => acc + Number(r.total_value || 0), 0);

  // Total Realizado / Pago (Contratos com payment_status === PAID)
  const totalRealized = rentals
    .filter(r => r.payment_status === PaymentStatus.PAID && r.rental_status !== 'CANCELLED')
    .reduce((acc, r) => acc + Number(r.total_value || 0), 0);

  // Total Pendente
  const totalPending = rentals
    .filter(r => r.payment_status === PaymentStatus.PENDING && r.rental_status !== 'CANCELLED')
    .reduce((acc, r) => acc + Number(r.total_value || 0), 0);

  // Ticket Médio
  const activeRentalsCount = rentals.filter(r => r.rental_status !== 'CANCELLED').length;
  const averageTicket = activeRentalsCount > 0 ? totalProjected / activeRentalsCount : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          1. Visão Financeira & Fluxo
        </h2>
      </div>

      {/* Grid de KPIs Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento Previsto */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Prevista</span>
            <div className="p-2 bg-gray-100 rounded-xl text-gray-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              R$ {totalProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Soma de contratos no período</p>
          </div>
        </div>

        {/* Receita Realizada (Paga) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Realizada</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              R$ {totalRealized.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {totalProjected > 0 ? Math.round((totalRealized / totalProjected) * 100) : 0}% do total previsto
            </p>
          </div>
        </div>

        {/* Valores Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendente de Recebimento</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">Aguardando quitação</p>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1">Por contrato emitido</p>
          </div>
        </div>
      </div>
    </div>
  );
}