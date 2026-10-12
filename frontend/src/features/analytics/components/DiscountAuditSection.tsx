// frontend/src/features/analytics/components/DiscountAuditSection.tsx

import { ShieldCheck, Tag, AlertTriangle, Activity } from 'lucide-react';
import type { Rental } from '@/types';
import { useMaterials } from '@/features/materials/hooks/useMaterials';

interface DiscountAuditSectionProps {
  rentals: Rental[];
}

export function DiscountAuditSection({ rentals }: DiscountAuditSectionProps) {
  // Buscamos os materiais para comparar as diárias dos contratos com as diárias base da tabela
  const { data: materialsData } = useMaterials({ is_active: true, limit: 200 });
  const materials = Array.isArray(materialsData) ? materialsData : materialsData?.items || [];

  // Mapeamento dos preços base por ID de material
  const materialRatesMap = materials.reduce((acc, m) => {
    acc[m.id] = Number(m.daily_rate);
    return acc;
  }, {} as Record<string, number>);

  let discountedContractsCount = 0;
  let totalDiscountValue = 0;
  let sumDiscountPercentages = 0;

  // Calculamos a variação de desconto concedida em relação à tabela
  rentals
    .filter((r) => r.rental_status !== 'CANCELLED')
    .forEach((rental) => {
      const baseRate = materialRatesMap[rental.material_id];
      const appliedRate = Number(rental.daily_rate);

      if (baseRate && appliedRate < baseRate) {
        const totalDays = rental.total_days || 1;
        const discountPerDay = baseRate - appliedRate;
        const contractTotalDiscount = discountPerDay * totalDays;

        discountedContractsCount += 1;
        totalDiscountValue += contractTotalDiscount;
        sumDiscountPercentages += ((baseRate - appliedRate) / baseRate) * 100;
      }
    });

  const averageDiscountPercent =
    discountedContractsCount > 0
      ? Math.round(sumDiscountPercentages / discountedContractsCount)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          4. Governança & Impacto de Descontos
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Impacto Financeiro de Descontos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Métricas de Concessão</h3>
                <p className="text-xs text-gray-500">Impacto das diárias negociadas abaixo da tabela</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-xs text-amber-800 font-medium block">Total de Abatimentos</span>
                <span className="text-2xl font-bold text-amber-900">
                  R$ {totalDiscountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Contratos c/ Desconto</span>
                  <span className="text-base font-bold text-gray-900">{discountedContractsCount}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block">Desconto Médio</span>
                  <span className="text-base font-bold text-gray-900">{averageDiscountPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Valores calculados em comparação ao preço base de cadastro dos materiais.</span>
          </div>
        </div>

        {/* Trilha Rápida de Governança e Auditoria */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Auditoria & Rastreabilidade</h3>
                <p className="text-xs text-gray-500">Monitoramento de integridade dos contratos e concessões</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" /> Ativo
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-gray-900 block">Politica de Preço Flexível Ativa</span>
                <p className="text-gray-500 mt-0.5">
                  Todas as edições de diárias são registradas com o snapshot financeiro congelado no contrato.
                </p>
              </div>
              <span className="text-gray-400 shrink-0 font-mono">Snapshot v1</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-gray-900 block">Garantia do Histórico de Contratos</span>
                <p className="text-gray-500 mt-0.5">
                  Alterações futuras nas tabelas de preços dos materiais não retroagem nos contratos emitidos.
                </p>
              </div>
              <span className="text-gray-400 shrink-0 font-mono">Imutável</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}