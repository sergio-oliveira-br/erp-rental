// frontend/src/features/materials/components/MaterialFormModal.tsx

import { useEffect, useState } from 'react';
import { X, Package } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateMaterial, useUpdateMaterial } from '../hooks/useMaterials';
import type { Material } from '@/types';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: Material | null;
}

export function MaterialFormModal({ isOpen, onClose, materialToEdit }: MaterialFormModalProps) {
  const [name, setName] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();

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
  }, [materialToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericRate = parseFloat(dailyRate.replace(',', '.'));
    if (isNaN(numericRate) || numericRate <= 0) {
      alert('Por favor, informe uma taxa diária válida.');
      return;
    }

    if (isEditing && materialToEdit) {
      await updateMaterial.mutateAsync({
        id: materialToEdit.id,
        payload: {
          name,
          daily_rate: numericRate,
          description: description || undefined,
          is_available: isAvailable,
        },
      });
    } else {
      await createMaterial.mutateAsync({
        name,
        daily_rate: numericRate,
        description: description || undefined,
      });
    }

    onClose();
  };

  const isSubmitting = createMaterial.isPending || updateMaterial.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Editar Material' : 'Novo Material'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nome do Material / Equipamento *
            </label>
            <Input
              type="text"
              required
              placeholder="Ex: Betoneira 400L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Taxa Diária (R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="Ex: 85.00"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Descrição / Observações
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Voltagem 220V, inclui cabo extensor de 10m"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-gray-300"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 select-none">
                Disponível para nova locação
              </label>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}