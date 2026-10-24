// frontend/src/components/ui/PossibleDuplicatesModal.tsx


import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface DuplicateCandidate {
  id: string;
  name: string;
  similarity: number;
  details?: string;
}

interface PossibleDuplicatesModalProps {
  isOpen: boolean;
  candidates: DuplicateCandidate[];
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  entityLabel: string;
}

export function PossibleDuplicatesModal({
  isOpen,
  candidates,
  onCancel,
  onConfirm,
  isLoading = false,
  entityLabel,
}: PossibleDuplicatesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Possíveis cadastros duplicados"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar cadastro
          </Button>

          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Cadastrar mesmo assim
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="text-sm">
            Encontramos {candidates.length === 1
              ? 'um cadastro possivelmente semelhante'
              : `${candidates.length} cadastros possivelmente semelhantes`}.
            Verifique se o {entityLabel} que você deseja cadastrar
            já existe antes de continuar.
          </p>
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-lg border border-gray-200 p-3"
            >
              <p className="font-medium">{candidate.name}</p>

              {candidate.details && (
                <p className="mt-1 text-sm text-gray-500">
                  {candidate.details}
                </p>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Similaridade textual: {Math.round(candidate.similarity * 100)}%
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600">
          A semelhança entre os nomes não confirma que se trata
          da mesma pessoa ou do mesmo item.
        </p>
      </div>
    </Modal>
  );
}
