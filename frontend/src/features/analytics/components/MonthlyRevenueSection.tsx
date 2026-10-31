// frontend/src/features/analytics/components/MonthlyRevenueSection.tsx


import { TrendingUp, CalendarDays } from 'lucide-react';
import type { Rental } from '@/types';
import { PaymentStatus } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface MonthlyRevenueSectionProps {
  rentals: Rental[];
  year: number;
  compact?: boolean;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr',
  'Mai', 'Jun', 'Jul', 'Ago',
  'Set', 'Out', 'Nov', 'Dez',
];

const currency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

export function MonthlyRevenueSection({
  rentals,
  year,
}: MonthlyRevenueSectionProps) {

  // Inicializa os 12 meses, inclusive os meses sem faturamento.
  const monthlyRevenue = MONTHS.map((month, index) => ({
    month,
    value: 0,
    monthIndex: index,
  }));

  // Considera somente contratos pagos e não cancelados.
  rentals
    .filter(
      (rental) =>
        rental.payment_status === PaymentStatus.PAID &&
        rental.rental_status !== 'CANCELLED'
    )
    .forEach((rental) => {
      if (!rental.start_date) return;

      const date = new Date(rental.start_date);

      if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== year
      ) {
        return;
      }

      const monthIndex = date.getMonth();

      monthlyRevenue[monthIndex].value += Number(
        rental.total_value || 0
      );
    });

  const totalRevenue = monthlyRevenue.reduce(
    (total, month) => total + month.value,
    0
  );

  const monthsWithRevenue = monthlyRevenue.filter(
    (month) => month.value > 0
  ).length;

  return (
    <div className="space-y-4">
      {/*<div className="flex items-center justify-between">*/}
      {/*  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">*/}
      {/*    5. Faturamento Mensal*/}
      {/*  </h2>*/}
      {/*</div>*/}

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs h-full flex flex-col space-y-5">

        {/* Cabeçalho do gráfico */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Receita Realizada
              </h3>
              <p className="text-xs text-gray-500">
                Valores de contratos integralmente pagos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarDays className="w-4 h-4" />
            Ano de {year}
          </div>
        </div>

        {/* Indicadores */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-5">

          <div>
            <span className="text-xs text-gray-500 font-medium block mb-1">
              Faturamento acumulado
            </span>

            <span className="text-2xl font-bold text-gray-900">
              {currency(totalRevenue)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 block mb-1">
              Meses com faturamento
            </span>

            <span className="text-lg font-bold text-emerald-600">
              {monthsWithRevenue}/12
            </span>
          </div>
        </div>

        {/* Gráfico */}
        <div className="w-full h-[150px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyRevenue}
              margin={{
                top: 30,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />

              <YAxis
                hide
                domain={[0, 'auto']}
              />

              <Tooltip
                formatter={(value) => [
                  currency(Number(value)),
                  'Faturamento',
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />

              <Bar
                dataKey="value"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value) =>
                    Number(value) > 0
                      ? currency(Number(value))
                      : ''
                  }
                  style={{
                    fill: '#6B7280',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}