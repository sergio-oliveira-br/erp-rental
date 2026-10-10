// frontend/src/features/rentals/components/RentalFormModal.tsx

import { useState } from 'react';
import { X, FilePlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useClients } from '@/features/clients/hooks/useClients';
import { useMaterials } from '@/features/materials/hooks/useMaterials';
import { useCreateRental } from '../hooks/useRentals';

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RentalFormModal({ isOpen, onClose }: RentalFormModalProps) {
  const [clientId, setClientId] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Busca clientes e materiais ativos para preencher os selects
  const { data: clientsData } = useClients({ is_active: true, limit: 100 });
  const { data: materialsData } = useMaterials({ is_active: true, limit: 100 });

  const clients = Array.isArray(clientsData) ? clientsData : clientsData?.items || [];
  const materials = Array.isArray(materialsData) ? materialsData : materialsData?.items || [];

  const createRental = useCreateRental();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createRental.mutateAsync({
      client_id: clientId,
      material_id: materialId,
      start_date: startDate,
      end_date: endDate,
      delivery_address: deliveryAddress || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Novo Contrato de Locação</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Cliente *
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Selecione um cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Material / Equipamento *
            </label>
            <select
              required
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Selecione um equipamento...</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (R$ {Number(m.daily_rate).toFixed(2)}/dia)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Data Inicial *
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Data Prevista de Término *
              </label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Endereço da Obra / Entrega (Opcional)
            </label>
            <Input
              type="text"
              placeholder="Se vazio, usa o endereço do cadastro do cliente"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRental.isPending}>
              {createRental.isPending ? 'Criando...' : 'Emitir Contrato'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}