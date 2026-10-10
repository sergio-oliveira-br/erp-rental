// frontend/src/features/rentals/components/RentalTable.tsx

import { CheckCircle, Clock, RotateCcw, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RentalStatus, PaymentStatus, type Rental } from '@/types';

interface RentalTableProps {
  rentals: Rental[];
  isLoading: boolean;
  onFinishRental: (id: string) => void;
  onReactivateRental: (id: string) => void;
  onTogglePaymentStatus: (id: string, currentStatus: PaymentStatus) => void;
}

export function RentalTable({
  rentals,
  isLoading,
  onFinishRental,
  onReactivateRental,
  onTogglePaymentStatus,
}: RentalTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Carregando lista de locações...
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Material</th>
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
              const isActive = (rental.rental_status || (rental as any).status) === RentalStatus.ACTIVE;

              return (
                <tr key={rental.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {rental.client_name || rental.client_id}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {rental.material_name || rental.material_id}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {new Date(rental.start_date).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(rental.end_date).toLocaleDateString('pt-BR')}
                  </td>
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
                      title="Clique para alterar o status do pagamento"
                      className="cursor-pointer"
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

                  {/* Status do Contrato */}
                  <td className="px-6 py-4">
                    {isActive ? (
                      <Badge variant="success" className="gap-1">
                        <Clock className="w-3 h-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="gray" className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Finalizado
                      </Badge>
                    )}
                  </td>

                  {/* Ações Condicionais */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                          title="Reabrir contrato finalizado"
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