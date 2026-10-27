
import { DollarSign } from 'lucide-react';

interface QuickStatsProps {
  monthlyRevenue: number;
}

export function QuickStats({ monthlyRevenue }: QuickStatsProps) {
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

        <div>
          <span className="text-xs font-medium text-gray-400 block">
            Faturamento (Mês)
          </span>
          <span className="text-xl font-bold text-gray-900">
            {formattedRevenue}
          </span>
        </div>
      </div>
    </div>
  );
}
