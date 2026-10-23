// frontend/src/features/rentals/components/RentalTable.tsx

import { CheckCircle, Clock, RotateCcw, DollarSign, MapPin, FileText, Eye, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RentalStatus, PaymentStatus, type Rental } from '@/types';

interface RentalTableProps {
  rentals: Rental[];
  isLoading: boolean;
  onFinishRental: (id: string) => void;
  onReactivateRental: (id: string) => void;
  onTogglePaymentStatus: (id: string, currentStatus: PaymentStatus) => void;
  onSelectRental: (rental: Rental) => void; // Abre o Modal de Detalhes
}

export function RentalTable({
  rentals,
  isLoading,
  onFinishRental,
  onReactivateRental,
  onTogglePaymentStatus,
  onSelectRental,
}: RentalTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Carregando lista de locações...
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-600 font-medium text-sm">Nenhum contrato de locação encontrado.</p>
        <p className="text-xs text-gray-400 mt-1">Clique em "Nova Locação" para registrar um contrato.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Cliente / Equipamento</th>
              <th className="px-6 py-3 text-center">QTD</th>
              <th className="px-6 py-3">Período</th>
              <th className="px-6 py-3">Valor Total</th>
              <th className="px-6 py-3">Pagamento</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {rentals.map((rental) => {
              const isPaid = rental.payment_status === PaymentStatus.PAID;
              const currentStatus = rental.rental_status;
              const isActive = currentStatus === RentalStatus.ACTIVE;
              const isCancelled = currentStatus === RentalStatus.CANCELLED;
              const hasAddress = Boolean(rental.delivery_address);
              const hasNotes = Boolean(rental.notes);

              return (
                <tr
                  key={rental.id}
                  className={`hover:bg-gray-50/80 transition-colors group ${
                    isCancelled ? 'bg-gray-50/60 opacity-75' : ''
                  }`}
                >

                  {/* Prioridade 1: Cliente, Material + Prioridade 2: Indicadores de Endereço/Notas */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <span className={isCancelled ? 'line-through text-gray-500' : ''}>
                        {rental.client_name || rental.client_id}
                      </span>

                      {/* Indicadores Visuais Prioridade 2 */}
                      <div className="flex items-center gap-1">
                        {hasAddress && (
                          <span title={`Obra/Entrega: ${rental.delivery_address}`} className="text-amber-600 bg-amber-50 p-1 rounded-md cursor-help inline-flex">
                            <MapPin className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {hasNotes && (
                          <span title={`Observação: ${rental.notes}`} className="text-blue-600 bg-blue-50 p-1 rounded-md cursor-help inline-flex">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{rental.material_name || rental.material_id}</div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-md bg-gray-100 px-2.5 py-1 font-semibold text-gray-800">
                      {rental.quantity ?? 1}
                    </span>
                  </td>

                  {/* Período + Quantidade de Dias */}
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-700">
                      {new Date(rental.start_date).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(rental.end_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium">
                      {rental.total_days} {rental.total_days === 1 ? 'dia' : 'dias'}
                    </div>
                  </td>

                  {/* Valor Total */}
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    R$ {Number(rental.total_value ?? rental.total_value ?? 0).toFixed(2).replace('.', ',')}
                  </td>

                  {/* Badge Interativo de Pagamento */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        onTogglePaymentStatus(
                          rental.id,
                          isPaid ? PaymentStatus.PENDING : PaymentStatus.PAID
                        )
                      }
                      title="Clique para alternar status do pagamento"
                      className="cursor-pointer transition-transform active:scale-95"
                    >
                      {isPaid ? (
                        <Badge variant="success" className="gap-1">
                          <DollarSign className="w-3 h-3" /> Pago
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" /> Pendente
                        </Badge>
                      )}
                    </button>
                  </td>

                  {/* Status do Contrato (Ativo, Finalizado ou Cancelado) */}
                  <td className="px-6 py-4">
                    {isActive ? (
                      <Badge variant="success" className="gap-1">
                        <Clock className="w-3 h-3" /> Ativo
                      </Badge>
                    ) : isCancelled ? (
                      <Badge variant="danger" className="gap-1">
                        <Ban className="w-3 h-3" /> Cancelado
                      </Badge>
                    ) : (
                      <Badge variant="gray" className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Finalizado
                      </Badge>
                    )}
                  </td>

                  {/* Prioridade 3: Ações e Detalhes */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectRental(rental)}
                        title="Ver detalhes e editar"
                        className="text-gray-700 hover:bg-gray-100 border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onFinishRental(rental.id)}
                          className="text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Encerrar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReactivateRental(rental.id)}
                          className="text-amber-700 hover:bg-amber-50 border-amber-200 gap-1"
                          title="Reabrir contrato"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}