// frontend/src/features/rentals/components/RentalsFilterBar.tsx

import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface RentalsFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  dateTo: string;
  setDateTo: (val: string) => void;
  onReset: () => void;
}

export function RentalsFilterBar({
  search,
  setSearch,
  status,
  setStatus,
  paymentStatus,
  setPaymentStatus,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onReset,
}: RentalsFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-3 justify-between">

        {/* Busca por texto */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou material..."
            className="pl-9 text-sm"
          />
        </div>

        {/* Filtros rápidos e Seletadores */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

          {/* Status do Contrato */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="FINISHED">Finalizados</option>
          </select>

          {/* Status de Pagamento */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos Pagamentos</option>
            <option value="PAID">Pago</option>
            <option value="PENDING">Pendente</option>
          </select>

          {/* Botão de Limpar Filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            title="Limpar filtros"
            className="gap-1 text-gray-600"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpar
          </Button>
        </div>
      </div>

      {/* Linha Inferior: Filtro Temporal (Essencial para base histórica grande) */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <span className="font-medium flex items-center gap-1 text-gray-500">
          <Filter className="w-3.5 h-3.5" /> Período de Início:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span>até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}