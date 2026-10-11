// frontend/src/features/rentals/components/RentalDetailsModal.tsx

import { useState, useEffect } from 'react';
import { X, MapPin, FileText, Calendar, DollarSign, User, Package, Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PaymentStatus, RentalStatus, type Rental } from '@/types';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { rentalKeys } from '../utils/rentalKeys';

interface RentalDetailsModalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RentalDetailsModal({ rental, isOpen, onClose }: RentalDetailsModalProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rental) {
      setDeliveryAddress(rental.delivery_address || '');
      setNotes(rental.notes || '');
      setEndDate(rental.end_date ? rental.end_date.split('T')[0] : '');
      setIsEditing(false);
    }
  }, [rental]);

  if (!isOpen || !rental) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/rentals/${rental.id}`, {
        delivery_address: deliveryAddress || null,
        notes: notes || null,
        end_date: endDate,
      });
      toast.success('Contrato atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: rentalKeys.lists() });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar contrato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaid = rental.payment_status === PaymentStatus.PAID;
  const isActive = (rental.rental_status || (rental as any).status) === RentalStatus.ACTIVE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Detalhes do Contrato</span>
            <h2 className="text-base font-bold text-gray-900">Locação #{rental.id.slice(0, 8)}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Status Badges Row */}
          <div className="flex items-center gap-3">
            {isActive ? (
              <Badge variant="success">Contrato Ativo</Badge>
            ) : (
              <Badge variant="gray">Contrato Finalizado</Badge>
            )}
            {isPaid ? (
              <Badge variant="success">Pagamento Confirmado</Badge>
            ) : (
              <Badge variant="warning">Pagamento Pendente</Badge>
            )}
          </div>

          {/* Core Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-400 block">Cliente</span>
                <span className="text-sm font-semibold text-gray-900">{rental.client_name || 'N/D'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-400 block">Equipamento</span>
                <span className="text-sm font-semibold text-gray-900">{rental.material_name || 'N/D'}</span>
              </div>
            </div>
          </div>

          {/* Financial & Period Summary */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Valor Total ({rental.total_days} dias)</span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {Number(rental.total_value ?? rental.total_value ?? 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Diária</span>
              <span className="text-sm font-semibold text-gray-700">R$ {Number(rental.daily_rate).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Formulário de Edição / Visualização Dinâmica */}
          <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Informações Operacionais</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                >
                  <Edit2 className="w-3 h-3" /> Editar Dados
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Endereço da Obra / Entrega
              </label>
              {isEditing ? (
                <Input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Endereço específico para esta locação"
                />
              ) : (
                <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {rental.delivery_address || <span className="text-gray-400 italic">Nenhum endereço alternativo informado (usando padrão do cliente).</span>}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Início
                </label>
                <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {new Date(rental.start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" /> Término Previsto
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {new Date(rental.end_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Observações & Instruções
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Instruções de entrega, portaria, etc."
                />
              ) : (
                <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100 whitespace-pre-wrap">
                  {rental.notes || <span className="text-gray-400 italic">Sem observações registradas.</span>}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  <Check className="w-4 h-4 mr-1" /> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </form>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

      </div>
    </div>
  );
}