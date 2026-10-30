// frontend/src/features/rentals/components/RentalActionConfirmationModal.tsx

import { Wallet, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { type Rental } from '@/types';

export type RentalAction = 'finish' | 'payment';

interface RentalActionConfirmationModalProps {
  rental: Rental | null;
  action: RentalAction | null;
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function RentalActionConfirmationModal({
  rental,
  action,
  isOpen,
  isPending,
  onClose,
  onConfirm,
}: RentalActionConfirmationModalProps) {
  if (!rental || !action) return null;

  const isFinish = action === 'finish';

  const title = isFinish
    ? 'Confirmar encerramento'
    : 'Confirmar recebimento';

  const description = isFinish
    ? 'Confirma que o material foi efetivamente devolvido e deseja encerrar este contrato?'
    : 'Confirma que recebeu integralmente o pagamento deste contrato e deseja atualizar sua situação financeira para Pago?';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={isFinish
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          >
            {isPending
              ? 'Processando...'
              : isFinish
                ? 'Confirmar encerramento'
                : 'Confirmar pagamento'
            }
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className={`flex items-start gap-3 rounded-lg p-3 ${
          isFinish
            ? 'bg-amber-50 text-amber-800'
            : 'bg-blue-50 text-blue-800'
        }`}>
          {isFinish ? (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <Wallet className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <p className="text-sm">{description}</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <div>
            <p className="text-xs text-gray-500">Cliente</p>
            <p className="text-sm font-medium text-gray-900">
              {rental.client_name || 'Cliente não identificado'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Material</p>
            <p className="text-sm font-medium text-gray-900">
              {rental.material_name || 'Material não identificado'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Contrato</p>
            <p className="text-sm font-medium text-gray-900">
              #{rental.id.slice(0, 8)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Valor total</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(Number(rental.total_value || 0))}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {isFinish
            ? 'Esta operação atualizará o contrato para Finalizado.'
            : 'Esta operação atualizará o pagamento para Pago.'
          }
        </p>
      </div>
    </Modal>
  );
}