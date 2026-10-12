// frontend/src/features/analytics/components/MaterialRevenueSection.tsx

import { Package, DollarSign, BarChart2 } from 'lucide-react';
import type { Rental } from '@/types';

interface MaterialRevenueSectionProps {
  rentals: Rental[];
}

interface MaterialMetric {
  materialName: string;
  totalRentals: number;
  totalRevenue: number;
}

export function MaterialRevenueSection({ rentals }: MaterialRevenueSectionProps) {
  // 1. Agrupar e somar os valores por material
  const materialMap: { [key: string]: { count: number; revenue: number } } = {};

  rentals
    .filter((r) => r.rental_status !== 'CANCELLED')
    .forEach((rental) => {
      // Usa o material_name populado ou uma chave padrão se não houver
      const name = rental.material_name || 'Equipamento Indefinido';
      const value = Number(rental.total_value || 0);

      if (!materialMap[name]) {
        materialMap[name] = { count: 0, revenue: 0 };
      }
      materialMap[name].count += 1;
      materialMap[name].revenue += value;
    });

  // 2. Converter o mapa em array ordenado do maior faturamento para o menor
  const sortedMaterials: MaterialMetric[] = Object.keys(materialMap)
    .map((name) => ({
      materialName: name,
      totalRentals: materialMap[name].count,
      totalRevenue: materialMap[name].revenue,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Encontra o faturamento máximo para calcular a largura relativa das barras de progresso
  const maxRevenue = sortedMaterials.length > 0 ? sortedMaterials[0].totalRevenue : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          2. Receita Gerada por Material
        </h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Desempenho por Equipamento</h3>
              <p className="text-xs text-gray-500">Ranking de materiais por volume de faturamento no período</p>
            </div>
          </div>
        </div>

        {sortedMaterials.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum dado de locação registrado para compilar o ranking de materiais.
          </div>
        ) : (
          <div className="space-y-5">
            {sortedMaterials.map((item, idx) => {
              const percentage = Math.round((item.totalRevenue / maxRevenue) * 100);

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{item.materialName}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-normal">
                        {item.totalRentals} {item.totalRentals === 1 ? 'locação' : 'locações'}
                      </span>
                    </div>
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {item.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Barra de Progresso Relativa ao Faturamento */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}