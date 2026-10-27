// frontend/src/features/rentals/components/RentalDetailsModal.tsx

import {useState, useEffect} from 'react';
import {X, MapPin, FileText, Calendar, DollarSign, User, Package, Check, Edit2, History} from 'lucide-react';
import {Button} from '@/components/ui/Button';
import {Input} from '@/components/ui/Input';
import {Badge} from '@/components/ui/Badge';
import {PaymentStatus, RentalStatus, type Rental} from '@/types';
import {apiClient} from '@/api/client';
import {toast} from 'sonner';
import {useQueryClient, useQuery} from '@tanstack/react-query';
import {rentalKeys} from '../utils/rentalKeys';
import {RentalLifecycleActions} from './RentalLifecycleActions';

interface RentalDetailsModalProps {
    rental: Rental | null;
    isOpen: boolean;
    onClose: () => void;
}

interface AuditLog {
    id: string;
    action: string;
    description: string;
    created_at: string;
}

export function RentalDetailsModal({rental, isOpen, onClose}: RentalDetailsModalProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState('1');

    // Buscar logs de auditoria do contrato selecionado com atualização garantida
    const {data: logs = [], isLoading: isLoadingLogs, refetch} = useQuery<AuditLog[]>({
        queryKey: ['rental-logs', rental?.id],
        queryFn: async () => {
            if (!rental) return [];
            const res = await apiClient.get<AuditLog[]>(`/rentals/${rental.id}/logs`);
            return res.data;
        },
        enabled: !!rental && activeTab === 'history',
        refetchOnMount: 'always',
    });

    // Força atualização dos logs sempre que mudar para a aba de histórico ou alterar o contrato
    useEffect(() => {
        if (activeTab === 'history' && rental) {
            refetch();
        }
    }, [activeTab, rental, refetch]);

    useEffect(() => {
        if (rental) {
            setDeliveryAddress(rental.delivery_address || '');
            setNotes(rental.notes || '');
            setEndDate(rental.end_date ? rental.end_date.split('T')[0] : '');
            setQuantity(String(rental.quantity ?? 1));
            setIsEditing(false);
            setActiveTab('details');
        }
    }, [rental]);

    if (!isOpen || !rental) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            toast.error('A quantidade deve ser um número inteiro maior que zero.');
            return;
        }

        setIsSubmitting(true);

        try {
            await apiClient.patch(`/rentals/${rental.id}`, {
                delivery_address: deliveryAddress || null,
                notes: notes || null,
                end_date: endDate,
                quantity: parsedQuantity,
            });

            toast.success('Contrato atualizado com sucesso!');

            queryClient.invalidateQueries({queryKey: rentalKeys.lists()});
            queryClient.invalidateQueries({queryKey: ['rental-logs', rental.id]});
            queryClient.invalidateQueries({queryKey: ['rentals']});

            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erro ao atualizar contrato.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPaid = rental.payment_status === PaymentStatus.PAID;
    const currentStatus = rental.rental_status;
    const isActive = currentStatus === RentalStatus.ACTIVE;
    const isCancelled = currentStatus === RentalStatus.CANCELLED;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header com Abas */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gerenciamento de Locação</span>
                        <h2 className="text-base font-bold text-gray-900">Locação #{rental.id.slice(0, 8)}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Seletor de Abas */}
                        <div className="bg-gray-200/70 p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setActiveTab('details')}
                                className={`px-3 py-1.5 rounded-md transition-all ${
                                    activeTab === 'details' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Detalhes
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('history')}
                                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${
                                    activeTab === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <History className="w-3.5 h-3.5"/> Histórico
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* Conteúdo Rolável */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {activeTab === 'details' ? (
                        <>
                            {/* Status Badges Row */}
                            <div className="flex items-center gap-3">
                                {isActive ? (
                                    <Badge variant="success">Contrato Ativo</Badge>
                                ) : isCancelled ? (
                                    <Badge variant="danger">Contrato Cancelado</Badge>
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
                                <div
                                    className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"/>
                                    <div>
                                        <span className="text-xs font-medium text-gray-400 block">Cliente</span>
                                        <span
                                            className="text-sm font-semibold text-gray-900">{rental.client_name || 'N/D'}</span>
                                    </div>
                                </div>

                                <div
                                    className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                                    <Package className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"/>
                                    <div>
                    <span className="text-xs font-medium text-gray-400 block">
                      Equipamento
                    </span>

                                        <span className="text-sm font-semibold text-gray-900 block">
                      {rental.material_name || 'N/D'}
                    </span>

                                        <span className="text-xs text-gray-500 mt-1 block">
                      Quantidade: {rental.quantity ?? 1}{' '}
                                            {(rental.quantity ?? 1) === 1 ? 'unidade' : 'unidades'}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial & Period Summary */}
                            <div
                                className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <DollarSign className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <span
                                            className="text-xs text-gray-500 block">Valor Total ({rental.total_days} dias)</span>
                                        <span className="text-lg font-bold text-gray-900">
                      R$ {Number(rental.total_value ?? rental.total_value ?? 0).toFixed(2).replace('.', ',')}
                    </span>
                                    </div>
                                </div>
                                <div className="text-right">
                  <span className="text-xs text-gray-500 block">
                    Diária por unidade
                  </span>

                                    <span className="text-sm font-semibold text-gray-700">
                    R$ {Number(rental.daily_rate).toFixed(2).replace('.', ',')}
                  </span>

                                    <span className="text-xs text-gray-500 block mt-1">
                    {rental.quantity ?? 1} {(rental.quantity ?? 1) === 1 ? 'unidade' : 'unidades'}
                  </span>
                                </div>
                            </div>

                            {/* Formulário de Edição */}
                            <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Informações
                                        Operacionais</h3>
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                                        >
                                            <Edit2 className="w-3 h-3"/> Editar Dados
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label
                                        className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400"/> Endereço da Obra / Entrega
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Endereço específico para esta locação"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                            {rental.delivery_address || (
                                                <span className="text-gray-400 italic">
                          Nenhum endereço alternativo informado (usando padrão do cliente).
                        </span>
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400"/> Início
                                        </label>
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                            {new Date(rental.start_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400"/> Término Previsto
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
                                    <label
                                        htmlFor="edit-rental-quantity"
                                        className="block text-xs font-medium text-gray-600 mb-1"
                                    >
                                        Quantidade de Itens *
                                    </label>

                                    {isEditing ? (
                                        <>
                                            <Input
                                                id="edit-rental-quantity"
                                                type="number"
                                                min="1"
                                                step="1"
                                                required
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder="Ex.: 20"
                                            />

                                            <p className="text-xs text-gray-500 mt-1">
                                                Informe quantas unidades deste equipamento serão alugadas.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                            {rental.quantity ?? 1}{' '}
                                            {(rental.quantity ?? 1) === 1 ? 'unidade' : 'unidades'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-gray-400"/> Observações & Instruções
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

                                {/* Componente Modular de Gerenciamento de Status (Visível apenas no modo de edição) */}
                                {isEditing && (
                                    <RentalLifecycleActions
                                        rental={rental}
                                        onSuccess={() => {
                                            setIsEditing(false);
                                            onClose();
                                        }}
                                    />
                                )}

                                {isEditing && (
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setDeliveryAddress(rental.delivery_address || '');
                                                setNotes(rental.notes || '');
                                                setEndDate(
                                                    rental.end_date ? rental.end_date.split('T')[0] : ''
                                                );
                                                setQuantity(String(rental.quantity ?? 1));
                                                setIsEditing(false);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" size="sm" disabled={isSubmitting}>
                                            <Check
                                                className="w-4 h-4 mr-1"/> {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        /* Aba de Histórico de Auditoria */
                        <div className="space-y-4">
                            <div className="text-xs text-gray-500">
                                Registro cronológico de todas as modificações, pagamentos e eventos deste contrato.
                            </div>

                            {isLoadingLogs ? (
                                <div className="text-center py-8 text-gray-400 text-sm">Carregando histórico...</div>
                            ) : logs.length === 0 ? (
                                <div
                                    className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 text-sm">
                                    Nenhum registro de alteração encontrado.
                                </div>
                            ) : (
                                <div
                                    className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200">
                                    {logs.map((log) => (
                                        <div key={log.id} className="relative pl-8 flex flex-col gap-0.5">
                                            <span
                                                className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-white"/>
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-xs font-semibold text-gray-900">{log.action}</span>
                                                <span className="text-[10px] text-gray-400">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </span>
                                            </div>
                                            <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                {log.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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