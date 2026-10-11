// frontend/src/features/dashboard/components/QuickStats.tsx

import { FileText, DollarSign, AlertCircle } from 'lucide-react';

interface QuickStatsProps {
  activeRentals: number;
  pendingPaymentsCount: number;
  monthlyRevenue: number;
}

export function QuickStats({ activeRentals, pendingPaymentsCount, monthlyRevenue }: QuickStatsProps) {
  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(monthlyRevenue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: Contratos Ativos */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block">Contratos Ativos</span>
          <span className="text-xl font-bold text-gray-900">{activeRentals}</span>
        </div>
      </div>

      {/* Card 2: Faturamento Previsto / Mês */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block">Faturamento (Mês)</span>
          <span className="text-xl font-bold text-gray-900">{formattedRevenue}</span>
        </div>
      </div>

      {/* Card 3: Pendências de Pagamento */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-medium text-gray-400 block">Pagamentos Pendentes</span>
          <span className="text-xl font-bold text-gray-900">{pendingPaymentsCount}</span>
        </div>
      </div>
    </div>
  );
}