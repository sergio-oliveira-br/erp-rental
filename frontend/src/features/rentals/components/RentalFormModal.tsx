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
    const [step, setStep] = useState<'form' | 'review'>('form');

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
            setStep('form');
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

    const selectedClient = clients.find(
        (client) => client.id === clientId
    );

    const formatDate = (date: string) => {
        if (!date) return 'Não informada';

        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    const rentalDays = startDate && endDate
        ? Math.max(
            0,
            Math.round(
                (
                    new Date(`${endDate}T00:00:00Z`).getTime() -
                    new Date(`${startDate}T00:00:00Z`).getTime()
                ) / 86_400_000
            )
        )
        : 0;

    const estimatedTotal =
        rentalDays * Number(quantity) * numericCustomRate;

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
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

        if (!Number.isFinite(numericCustomRate) || numericCustomRate <= 0) {
            return;
        }

        setStep('review');
    };

    const handleConfirmCreate = async () => {
        if (createRental.isPending) {
            return;
        }

        await createRental.mutateAsync({
            client_id: clientId,
            material_id: materialId,
            start_date: startDate,
            end_date: endDate,
            quantity: Number(quantity),
            delivery_address: deliveryAddress || undefined,
            notes: notes || undefined,
            daily_rate: numericCustomRate,
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
                    {step === 'form' ? (
                        <>
                            {/* Cliente */}
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

                            {/* Material / Equipamento */}
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

                            {/* Quantidade */}
                            <div>
                                <label
                                    htmlFor="rental-quantity"
                                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                                >
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

                                <p className="mt-1 text-xs text-gray-500">
                                    Informe quantas unidades deste equipamento serão alugadas.
                                </p>
                            </div>

                            {/* Valor da diária */}
                            {materialId && (
                                <div className="space-y-2 rounded-xl border border-gray-200/60 bg-gray-50/80 p-4">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="rental-daily-rate"
                                            className="text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                        >
                                            Valor da Diária (R$) *
                                        </label>

                                        <span className="text-xs text-gray-500">
                            Preço de tabela: R$ {baseDailyRate.toFixed(2)}
                        </span>
                                    </div>

                                    <Input
                                        id="rental-daily-rate"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={customDailyRate}
                                        onChange={(e) => setCustomDailyRate(e.target.value)}
                                    />

                                    {isDiscounted && (
                                        <div
                                            className="flex items-center gap-2 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600"/>
                                            <span>
                                Desconto aplicado:{' '}
                                                <strong className="font-bold">
                                    {discountPercentage}%
                                </strong>{' '}
                                                abaixo do valor de tabela padrão.
                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Período */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
                                    <label
                                        className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Data Prevista de Término *
                                    </label>

                                    <Input
                                        type="date"
                                        required
                                        value={endDate}
                                        min={startDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Endereço */}
                            <div>
                                <label
                                    className="mb-1 block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Endereço da Obra / Entrega (Opcional)
                                </label>

                                <Input
                                    type="text"
                                    placeholder="Se vazio, usa o endereço do cadastro do cliente"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                />
                            </div>

                            {/* Rodapé do formulário */}
                            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={createRental.isPending}
                                >
                                    Revisar contrato
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Aviso de revisão */}
                            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"/>

                                <div>
                                    <h3 className="font-semibold text-blue-900">
                                        Revise os dados antes de emitir
                                    </h3>

                                    <p className="mt-1 text-sm text-blue-800">
                                        Confira as informações e os valores.
                                        Nenhum contrato foi criado ou gravado no banco de dados.
                                    </p>
                                </div>
                            </div>

                            {/* Resumo do contrato */}
                            <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900">
                                    Dados do contrato
                                </h3>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Cliente</span>
                                    <span className="text-right font-medium text-gray-900">
                        {selectedClient?.name ?? 'Não informado'}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Equipamento</span>
                                    <span className="text-right font-medium text-gray-900">
                        {selectedMaterial?.name ?? 'Não informado'}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Quantidade</span>
                                    <span className="font-medium text-gray-900">
                        {quantity} unidade(s)
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Data inicial</span>
                                    <span className="font-medium text-gray-900">
                        {formatDate(startDate)}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Término previsto</span>
                                    <span className="font-medium text-gray-900">
                        {formatDate(endDate)}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Endereço de entrega</span>
                                    <span className="max-w-[60%] text-right font-medium text-gray-900">
                        {deliveryAddress.trim() ||
                            'Endereço do cadastro do cliente'}
                    </span>
                                </div>
                            </div>

                            {/* Resumo financeiro */}
                            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <h3 className="font-semibold text-gray-900">
                                    Resumo financeiro
                                </h3>

                                <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                        Valor da diária por unidade
                    </span>

                                    <span className="font-medium text-gray-900">
                        {numericCustomRate.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                                    <span className="text-gray-500">Quantidade</span>
                                    <span className="font-medium text-gray-900">
                        {quantity}
                    </span>
                                </div>

                                <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                        Diferença entre as datas
                    </span>
                                    <span className="font-medium text-gray-900">
                        {rentalDays} dia(s)
                    </span>
                                </div>

                                {isDiscounted && (
                                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                                        Desconto de {discountPercentage}% em relação
                                        ao preço de tabela.
                                    </div>
                                )}

                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-gray-700">
                            Total estimado
                        </span>

                                        <span className="text-xl font-bold text-gray-900">
                            {estimatedTotal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Valor estimado com base na quantidade, no valor
                                        da diária e na diferença entre as datas.
                                        O total final depende das regras de cobrança
                                        aplicadas pelo sistema.
                                    </p>
                                </div>
                            </div>

                            {/* Rodapé da revisão */}
                            <div
                                className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={createRental.isPending}
                                    onClick={() => setStep('form')}
                                >
                                    Voltar e editar
                                </Button>

                                <Button
                                    type="button"
                                    disabled={createRental.isPending}
                                    onClick={handleConfirmCreate}
                                >
                                    {createRental.isPending
                                        ? 'Criando...'
                                        : 'Confirmar e emitir contrato'}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}