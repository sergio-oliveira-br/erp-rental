
import { useState } from 'react';
import { DollarSign, Eye, EyeOff } from 'lucide-react';

interface QuickStatsProps {
  monthlyRevenue: number;
}

export function QuickStats({ monthlyRevenue }: QuickStatsProps) {
  const [isRevenueVisible, setIsRevenueVisible] = useState(false);

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(monthlyRevenue);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <span className="text-xs font-medium text-gray-400 block">
            Faturamento (Mês)
          </span>

          <span className="text-xl font-bold text-gray-900">
            {isRevenueVisible ? formattedRevenue : '••••••••'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsRevenueVisible(!isRevenueVisible)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={
            isRevenueVisible
              ? 'Ocultar faturamento'
              : 'Mostrar faturamento'
          }
          title={
            isRevenueVisible
              ? 'Ocultar faturamento'
              : 'Mostrar faturamento'
          }
        >
          {isRevenueVisible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
