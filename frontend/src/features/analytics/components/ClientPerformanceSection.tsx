// frontend/src/features/analytics/components/ClientPerformanceSection.tsx

import { Users, DollarSign, FileText, AlertCircle } from 'lucide-react';
import type { Rental } from '@/types';
import { PaymentStatus } from '@/types';

interface ClientPerformanceSectionProps {
  rentals: Rental[];
}

interface ClientMetric {
  clientId: string;
  clientName: string;
  totalContracts: number;
  totalSpent: number;
  pendingBalance: number;
}

export function ClientPerformanceSection({ rentals }: ClientPerformanceSectionProps) {
  // 1. Agrupar e somar os valores por cliente
  const clientMap: { [key: string]: { name: string; count: number; spent: number; pending: number } } = {};

  rentals
    .filter((r) => r.rental_status !== 'CANCELLED')
    .forEach((rental) => {
      const id = rental.client_id || 'unassigned';
      const name = rental.client_name || 'Cliente Indefinido';
      const totalVal = Number(rental.total_value || 0);

      if (!clientMap[id]) {
        clientMap[id] = { name, count: 0, spent: 0, pending: 0 };
      }

      clientMap[id].count += 1;
      clientMap[id].spent += totalVal;

      if (rental.payment_status === PaymentStatus.PENDING) {
        clientMap[id].pending += totalVal;
      }
    });

  // 2. Ordenar clientes pelo maior valor total investido
  const sortedClients: ClientMetric[] = Object.keys(clientMap)
    .map((id) => ({
      clientId: id,
      clientName: clientMap[id].name,
      totalContracts: clientMap[id].count,
      totalSpent: clientMap[id].spent,
      pendingBalance: clientMap[id].pending,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 px-1">
          3. Top Clientes & Saúde da Base
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Ranking por Volume Faturado</h3>
            <p className="text-xs text-gray-500">Principais parceiros e seus saldos pendentes de pagamento</p>
          </div>
        </div>

        {sortedClients.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm p-6">
            Nenhum dado de cliente encontrado para o período selecionado.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedClients.map((client, idx) => (
              <div
                key={client.clientId || idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 font-bold text-xs text-gray-600 flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{client.clientName}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        {client.totalContracts} {client.totalContracts === 1 ? 'contrato' : 'contratos'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                  {client.pendingBalance > 0 && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pendente: R$ {client.pendingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-gray-400 uppercase font-semibold block">Total Investido</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center justify-end gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}