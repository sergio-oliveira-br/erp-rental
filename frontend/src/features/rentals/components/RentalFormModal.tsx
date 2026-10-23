// frontend/src/features/rentals/components/RentalFormModal.tsx

import {useEffect, useMemo, useState} from 'react';
import {AlertCircle, FilePlus, X} from 'lucide-react';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {useClients} from '@/features/clients/hooks/useClients';
import {useMaterials} from '@/features/materials/hooks/useMaterials';
import {useCreateRental} from '../hooks/useRentals';

interface RentalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RentalFormModal({isOpen, onClose}: RentalFormModalProps) {
    const [clientId, setClientId] = useState('');
    const [materialId, setMaterialId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [notes] = useState('');
    const [customDailyRate, setCustomDailyRate] = useState<string>('');
    const [quantity, setQuantity] = useState('1');
    const [clientSearch, setClientSearch] = useState('');
    const [materialSearch, setMaterialSearch] = useState('');

    // Limpa o formulário sempre que o modal for fechado ou reaberto
    useEffect(() => {
        if (isOpen) {
            setClientId('');
            setMaterialId('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate('');
            setDeliveryAddress('');
            setCustomDailyRate('');
            setQuantity('1');
            setClientSearch('');
            setMaterialSearch('');
        }
    }, [isOpen]);

    // Busca clientes e materiais ativos para preencher os selects
    const {data: clientsData} = useClients({
        is_active: true,
        limit: 500,
    });

    const {
        data: materialsData,
        isFetching: isSearchingMaterials,
    } = useMaterials({
        is_active: true,
        limit: 100,
        search: materialSearch.trim(),
    });

    const materials = useMemo(() => {
        const list = Array.isArray(materialsData)
            ? materialsData
            : materialsData?.items ?? [];

        return [...list].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', {
                sensitivity: 'base',
            })
        );
    }, [materialsData]);

    const selectedMaterial = materials.find(
        (material) => material.id === materialId
    );

    const baseDailyRate = selectedMaterial
        ? Number(selectedMaterial.daily_rate)
        : 0;

    const clients = useMemo(() => {
        const list = Array.isArray(clientsData)
            ? clientsData
            : clientsData?.items ?? [];

        return [...list].sort((a, b) =>
            a.name.localeCompare(b.name, 'pt-BR', {
                sensitivity: 'base',
            })
        );
    }, [clientsData]);

    const filteredClients = useMemo(() => {
        const search = clientSearch.trim();

        if (!search) {
            return [];
        }

        return clients.filter((client) =>
            client.name
                .toLocaleLowerCase('pt-BR')
                .includes(search.toLocaleLowerCase('pt-BR'))
        );
    }, [clients, clientSearch]);


    // Quando o material muda, inicializamos o campo com o valor padrão de tabela
    useEffect(() => {
        if (selectedMaterial) {
            setCustomDailyRate(String(selectedMaterial.daily_rate));
        } else {
            setCustomDailyRate('');
        }
    }, [materialId, selectedMaterial]);

    // Verificamos se há desconto (se o valor digitado for menor que a tabela)
    const numericCustomRate = parseFloat(customDailyRate) || 0;
    const isDiscounted = numericCustomRate > 0 && numericCustomRate < baseDailyRate;
    const discountPercentage = isDiscounted
        ? Math.round(((baseDailyRate - numericCustomRate) / baseDailyRate) * 100)
        : 0;

    const createRental = useCreateRental();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const parsedQuantity = Number(quantity);

        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return;
        }

        if (!clientId || !materialId || !startDate || !endDate) {
            return;
        }

        if (endDate < startDate) {
            return;
        }

        await createRental.mutateAsync({
            client_id: clientId,
            material_id: materialId,
            start_date: startDate,
            end_date: endDate,
            quantity: parsedQuantity,
            delivery_address: deliveryAddress || undefined,
            notes: notes || undefined,
            daily_rate: numericCustomRate > 0 ? numericCustomRate : undefined,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FilePlus className="w-5 h-5 text-gray-700"/>
                        <h2 className="text-lg font-bold text-gray-900">Novo Contrato de Locação</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <div>
                            <label
                                htmlFor="rental-client-search"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Cliente *
                            </label>

                            <Input
                                id="rental-client-search"
                                type="text"
                                autoComplete="off"
                                placeholder="Digite o nome do cliente..."
                                value={
                                    clientId
                                        ? clients.find((c) => c.id === clientId)?.name ?? clientSearch
                                        : clientSearch
                                }
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setClientId('');
                                }}
                                required={!clientId}
                            />

                            {clientSearch.trim() && !clientId && (
                                <div
                                    className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                    {filteredClients.length > 0 ? (
                                        filteredClients.map((client) => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50"
                                                onClick={() => {
                                                    setClientId(client.id);
                                                    setClientSearch(client.name);
                                                }}
                                            >
                                                {client.name}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-3 py-3 text-sm text-gray-500">
                                            Nenhum cliente encontrado.
                                        </p>
                                    )}
                                </div>
                            )}

                            {clientId && (
                                <button
                                    type="button"
                                    className="mt-1 text-xs text-blue-600 hover:underline"
                                    onClick={() => {
                                        setClientId('');
                                        setClientSearch('');
                                    }}
                                >
                                    Alterar cliente
                                </button>
                            )}
                        </div>

                    </div>

                    <div>
                        <label
                            htmlFor="rental-material-search"
                            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                        >
                            Material / Equipamento *
                        </label>

                        <Input
                            id="rental-material-search"
                            type="text"
                            autoComplete="off"
                            placeholder="Digite o nome do equipamento..."
                            value={
                                materialId
                                    ? selectedMaterial?.name ?? materialSearch
                                    : materialSearch
                            }
                            onChange={(e) => {
                                setMaterialSearch(e.target.value);
                                setMaterialId('');
                            }}
                            required={!materialId}
                        />

                        {materialSearch.trim() && !materialId && (
                            <div
                                className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                                {isSearchingMaterials ? (
                                    <p className="px-3 py-3 text-sm text-gray-500">
                                        Pesquisando materiais...
                                    </p>
                                ) : materials.length > 0 ? (
                                    materials.map((material) => (
                                        <button
                                            key={material.id}
                                            type="button"
                                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50"
                                            onClick={() => {
                                                setMaterialId(material.id);
                                                setMaterialSearch(material.name);
                                            }}
                                        >
            <span className="block font-medium">
              {material.name}
            </span>
                                            <span className="text-xs text-gray-500">
              Diária: R$ {Number(material.daily_rate).toFixed(2)}
            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-3 py-3 text-sm text-gray-500">
                                        Nenhum material encontrado.
                                    </p>
                                )}
                            </div>
                        )}

                        {materialId && (
                            <button
                                type="button"
                                className="mt-1 text-xs text-blue-600 hover:underline"
                                onClick={() => {
                                    setMaterialId('');
                                    setMaterialSearch('');
                                    setCustomDailyRate('');
                                }}
                            >
                                Alterar material
                            </button>
                        )}
                    </div>


                    <div>
                        <label
                            htmlFor="rental-quantity"
                            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Quantidade de Itens *
                        </label>

                        <Input
                            id="rental-quantity"
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
                    </div>


                    {/* Campo de Valor da Diária Editável com Alerta Visual de Desconto */}
                    {materialId && (
                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Valor da Diária (R$) *
                                </label>
                                <span className="text-xs text-gray-500">
                  Preço de tabela: R$ {baseDailyRate.toFixed(2)}
                </span>
                            </div>

                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={customDailyRate}
                                onChange={(e) => setCustomDailyRate(e.target.value)}
                            />

                            {/* Alerta Visual Condicional de Desconto */}
                            {isDiscounted && (
                                <div
                                    className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200/60 animate-fade-in">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600"/>
                                    <span>
                    Desconto aplicado: <strong className="font-bold">{discountPercentage}%</strong> abaixo do valor de tabela padrão.
                  </span>
                                </div>
                            )}
                        </div>
                    )}

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