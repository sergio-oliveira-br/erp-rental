// frontend/src/features/analytics/components/DiscountAuditSection.tsx

import {Tag, AlertTriangle} from 'lucide-react';
import type {Rental} from '@/types';
import {useMaterials} from '@/features/materials/hooks/useMaterials';
import {MonthlyRevenueSection} from './MonthlyRevenueSection';

interface DiscountAuditSectionProps {
    rentals: Rental[];
    allRentals: Rental[];
}

export function DiscountAuditSection({rentals, allRentals}: DiscountAuditSectionProps) {
    // Buscamos os materiais para comparar as diárias dos contratos com as diárias base da tabela
    const {data: materialsData} = useMaterials({is_active: true, limit: 200000});
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
                const quantity = rental.quantity
                const discountPerDay = baseRate - appliedRate;
                const contractTotalDiscount = discountPerDay * totalDays * quantity;

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
                    4. Impacto de Descontos e Faturamento Mensal
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Painel de Impacto Financeiro de Descontos */}
                <div
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                <Tag className="w-5 h-5"/>
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
                  R$ {totalDiscountValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 block">Contratos c/ Desconto</span>
                                    <span
                                        className="text-base font-bold text-gray-900">{discountedContractsCount}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-gray-500 block">Desconto Médio</span>
                                    <span className="text-base font-bold text-gray-900">{averageDiscountPercent}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0"/>
                        <span>Valores calculados em comparação ao preço base de cadastro dos materiais.</span>
                    </div>
                </div>

                {/* 2/3 - Faturamento Mensal */}
                <div className="lg:col-span-2 min-w-0">
                    <MonthlyRevenueSection
                        rentals={allRentals}
                        year={2026}
                        compact
                    />
                </div>
            </div>
        </div>
    );
}