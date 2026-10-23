
import { useState } from 'react';
import { Package, DollarSign, BarChart2 } from 'lucide-react';
import type { Rental } from '@/types';
import { Pagination } from '@/components/ui/Pagination';

interface MaterialRevenueSectionProps {
  rentals: Rental[];
}

interface MaterialMetric {
  materialName: string;
  totalRentals: number;
  totalRevenue: number;
}

export function MaterialRevenueSection({
  rentals,
}: MaterialRevenueSectionProps) {
  const [page, setPage] = useState(1);
  const limit = 5; // Exibe 5 materiais por página

  // 1. Agrupar e somar os valores por material
  const materialMap: {
    [key: string]: { count: number; revenue: number };
  } = {};

  rentals
    .filter((r) => r.rental_status !== 'CANCELLED')
    .forEach((rental) => {
      const name = rental.material_name || 'Equipamento Indefinido';
      const value = Number(rental.total_value || 0);

      if (!materialMap[name]) {
        materialMap[name] = { count: 0, revenue: 0 };
      }

      materialMap[name].count += 1;
      materialMap[name].revenue += value;
    });

  // 2. Ordenar materiais pelo maior faturamento
  const sortedMaterials: MaterialMetric[] = Object.keys(materialMap)
    .map((name) => ({
      materialName: name,
      totalRentals: materialMap[name].count,
      totalRevenue: materialMap[name].revenue,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // 3. Calcular o faturamento total de todos os materiais
  const totalRevenue = sortedMaterials.reduce(
    (total, item) => total + item.totalRevenue,
    0
  );

  // 4. Paginação local
  const totalItems = sortedMaterials.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const paginatedMaterials = sortedMaterials.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          2. Receita Gerada por Material
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <BarChart2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Desempenho por Equipamento
              </h3>
              <p className="text-xs text-gray-500">
                Ranking de materiais por volume de faturamento no período
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-gray-400">
            Total: {totalItems} materiais
          </span>
        </div>

        {paginatedMaterials.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm p-6">
            Nenhum dado de locação registrado para compilar o ranking de materiais.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedMaterials.map((item, idx) => {
              const globalIndex = (page - 1) * limit + idx + 1;

              // Percentual do faturamento total representado pelo material
              const percentage =
                totalRevenue > 0
                  ? (item.totalRevenue / totalRevenue) * 100
                  : 0;

              return (
                <div
                  key={item.materialName}
                  className="p-4 sm:p-5 space-y-3 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 font-bold text-xs text-gray-600 flex items-center justify-center shrink-0">
                        #{globalIndex}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 break-words">
                          <Package className="w-4 h-4 text-gray-400 inline mr-1.5" />
                          {item.materialName}
                        </h4>

                        <span className="text-xs text-gray-500">
                          {item.totalRentals}{' '}
                          {item.totalRentals === 1 ? 'locação' : 'locações'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-gray-400 uppercase font-semibold block">
                        Receita Total
                      </span>

                      <span className="text-sm font-bold text-gray-900 flex items-center justify-end gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        {item.totalRevenue.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>

                      <span className="text-xs font-semibold text-indigo-600">
                        {percentage.toLocaleString('pt-BR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}
                        % da receita
                      </span>
                    </div>
                  </div>

                  {/* Barra proporcional à participação na receita total */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação oficial: 5 materiais por página */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
