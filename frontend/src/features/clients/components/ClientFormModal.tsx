// frontend/src/features/clients/components/ClientFormModal.tsx

import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Modal} from '@/components/ui/Modal.tsx';
import {Input} from '@/components/ui/Input.tsx';
import {Button} from '@/components/ui/Button.tsx';
import {useCheckClientDuplicates, useCreateClient, useUpdateClient} from '../hooks/useClients.ts';
import type {Client} from '@/types';
import type {DuplicateCandidate} from "@/components/ui/PossibleDuplicatesModal.tsx";
import {PossibleDuplicatesModal} from '@/components/ui/PossibleDuplicatesModal';

const clientSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit?: Client | null;
}

export function ClientFormModal({isOpen, onClose, clientToEdit}: ClientFormModalProps) {
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const isEditing = Boolean(clientToEdit);

    const checkDuplicates = useCheckClientDuplicates();
    const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[]>([]);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const [pendingData, setPendingData] = useState<ClientFormData | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
        },
    });

    useEffect(() => {
        if (clientToEdit) {
            reset({
                name: clientToEdit.name,
                phone: clientToEdit.phone || '',
                address: clientToEdit.address || '',
            });
        } else {
            reset({
                name: '',
                phone: '',
                address: '',
            });
        }
    }, [clientToEdit, reset, isOpen]);


    const onSubmit = async (data: ClientFormData) => {
        try {
            if (isEditing && clientToEdit) {
                await updateClient.mutateAsync({
                    id: clientToEdit.id,
                    payload: data,
                });

                onClose();
                return;
            }

            const result = await checkDuplicates.mutateAsync({
                name: data.name,
            });

            if (result.has_duplicates && result.matches.length > 0) {
                setDuplicateCandidates(
                    result.matches.map((match) => ({
                        id: match.id,
                        name: match.name,
                        similarity: match.similarity,
                        details: match.phone ? `Telefone: ${match.phone}` : undefined,
                    })),
                );

                setPendingData(data);
                setShowDuplicateWarning(true);
                return;
            }

            await createClient.mutateAsync(data);
            onClose();
        } catch {
            // Os hooks já apresentam as notificações de erro.
            // Se a verificação falhar, não prosseguimos com o cadastro.
        }
    };

    const confirmCreateAnyway = async () => {
        if (!pendingData) return;

        try {
            await createClient.mutateAsync(pendingData);

            setShowDuplicateWarning(false);
            setPendingData(null);
            setDuplicateCandidates([]);
            onClose();
        } catch {
            // Mantém a confirmação aberta para permitir nova tentativa.
        }
    };

    const cancelDuplicateCreation = () => {
        setShowDuplicateWarning(false);
        setPendingData(null);
        setDuplicateCandidates([]);
    };


    const isLoading =
        createClient.isPending ||
        updateClient.isPending ||
        checkDuplicates.isPending;


    return (
        <>
            <Modal
                isOpen={isOpen && !showDuplicateWarning}
                onClose={onClose}
                title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                        >
                            {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nome Completo / Razão Social *"
                        placeholder="Ex: João da Silva"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Telefone *"
                            placeholder="(34) 99999-8888"
                            error={errors.phone?.message}
                            {...register('phone')}
                        />
                    </div>

                    <Input
                        label="Endereço"
                        placeholder="Rua, Número, Bairro - Cidade/UF"
                        error={errors.address?.message}
                        {...register('address')}
                    />
                </form>
            </Modal>

            <PossibleDuplicatesModal
                isOpen={isOpen && showDuplicateWarning}
                candidates={duplicateCandidates}
                onCancel={cancelDuplicateCreation}
                onConfirm={confirmCreateAnyway}
                isLoading={createClient.isPending}
                entityLabel="cliente"
            />
        </>
    );
}