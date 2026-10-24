
import { useEffect, useState, type FormEvent } from 'react';
import { X, Package } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PossibleDuplicatesModal } from '@/components/ui/PossibleDuplicatesModal';

import type { Material, PossibleMaterialDuplicate } from '@/types';
import type { DuplicateCandidate } from '@/components/ui/PossibleDuplicatesModal';

import {
  useCreateMaterial,
  useUpdateMaterial,
  useCheckMaterialDuplicates,
} from '../hooks/useMaterials';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: Material | null;
}

interface MaterialFormData {
  name: string;
  daily_rate: number;
  description?: string;
  is_available?: boolean;
}

export function MaterialFormModal({
  isOpen,
  onClose,
  materialToEdit,
}: MaterialFormModalProps) {
  const [name, setName] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [duplicateCandidates, setDuplicateCandidates] =
    useState<DuplicateCandidate[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingData, setPendingData] =
    useState<MaterialFormData | null>(null);

  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const checkDuplicates = useCheckMaterialDuplicates();

  const isEditing = Boolean(materialToEdit);

  useEffect(() => {
    if (materialToEdit) {
      setName(materialToEdit.name);
      setDailyRate(String(materialToEdit.daily_rate));
      setDescription(materialToEdit.description || '');
      setIsAvailable(materialToEdit.is_available);
    } else {
      setName('');
      setDailyRate('');
      setDescription('');
      setIsAvailable(true);
    }

    setShowDuplicateWarning(false);
    setDuplicateCandidates([]);
    setPendingData(null);
  }, [materialToEdit, isOpen]);

  const resetDuplicateState = () => {
    setShowDuplicateWarning(false);
    setDuplicateCandidates([]);
    setPendingData(null);
  };

  const handleClose = () => {
    resetDuplicateState();
    onClose();
  };

  const createMaterialRecord = async (data: MaterialFormData) => {
    await createMaterial.mutateAsync({
      name: data.name,
      daily_rate: data.daily_rate,
      description: data.description || undefined,
      category: '',
    });

    resetDuplicateState();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim().replace(/\s+/g, ' ');

    if (normalizedName.length < 3) {
      alert('O nome do material deve ter pelo menos 3 caracteres.');
      return;
    }

    const numericRate = Number(dailyRate.replace(',', '.'));

    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      alert('Por favor, informe uma taxa diária válida.');
      return;
    }

    const data: MaterialFormData = {
      name: normalizedName,
      daily_rate: numericRate,
      description: description.trim() || undefined,
      is_available: isAvailable,
    };

    try {
      if (isEditing && materialToEdit) {
        await updateMaterial.mutateAsync({
          id: materialToEdit.id,
          payload: {
            name: data.name,
            daily_rate: data.daily_rate,
            description: data.description,
            is_available: isAvailable,
          },
        });

        onClose();
        return;
      }

      const result = await checkDuplicates.mutateAsync({
        name: data.name,
      });

      if (result.has_duplicates && result.matches.length > 0) {
        setDuplicateCandidates(
          result.matches.map((match: PossibleMaterialDuplicate) => ({
            id: match.id,
            name: match.name,
            similarity: match.similarity,
            details: 'Material existente',
          })),
        );

        setPendingData(data);
        setShowDuplicateWarning(true);
        return;
      }

      await createMaterialRecord(data);
    } catch {
      // Os hooks devem apresentar as notificações de erro.
      // Se a verificação falhar, o material não será criado.
    }
  };

  const confirmCreateAnyway = async () => {
    if (!pendingData) return;

    try {
      await createMaterialRecord(pendingData);
    } catch {
      // Mantém o aviso aberto para permitir nova tentativa.
    }
  };

  const isSubmitting =
    createMaterial.isPending ||
    updateMaterial.isPending ||
    checkDuplicates.isPending;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        role="presentation"
      >
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="material-modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-700" />

              <h2
                id="material-modal-title"
                className="text-lg font-bold text-gray-900"
              >
                {isEditing ? 'Editar Material' : 'Novo Material'}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Fechar formulário"
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="material-name"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Nome do Material / Equipamento *
              </label>

              <Input
                id="material-name"
                type="text"
                required
                minLength={3}
                maxLength={100}
                placeholder="Ex.: Betoneira 400L"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="material-daily-rate"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Taxa Diária (R$) *
              </label>

              <Input
                id="material-daily-rate"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Ex.: 85.00"
                value={dailyRate}
                onChange={(event) => setDailyRate(event.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="material-description"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
              >
                Descrição / Observações
              </label>

              <textarea
                id="material-description"
                rows={3}
                placeholder="Ex.: Voltagem 220V, inclui cabo extensor de 10m"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="material-is-available"
                  checked={isAvailable}
                  onChange={(event) => setIsAvailable(event.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-gray-300"
                />

                <label
                  htmlFor="material-is-available"
                  className="text-sm font-medium text-gray-700 select-none"
                >
                  Disponível para nova locação
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? checkDuplicates.isPending
                    ? 'Verificando duplicidades...'
                    : 'Salvando...'
                  : isEditing
                    ? 'Atualizar'
                    : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <PossibleDuplicatesModal
        isOpen={isOpen && showDuplicateWarning}
        candidates={duplicateCandidates}
        onCancel={resetDuplicateState}
        onConfirm={confirmCreateAnyway}
        isLoading={createMaterial.isPending}
        entityLabel="material"
      />
    </>
  );
}
