// frontend/src/features/clients/components/ClientFormModal.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { useCreateClient, useUpdateClient } from '../hooks/useClients.ts';
import type { Client } from '@/types';

const clientSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter ao menos 10 dígitos'),
  document: z.string().min(11, 'CPF/CNPJ inválido (mínimo 11 caracteres)'),
  address: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export function ClientFormModal({ isOpen, onClose, clientToEdit }: ClientFormModalProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const isEditing = Boolean(clientToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
    },
  });

  useEffect(() => {
    if (clientToEdit) {
      reset({
        name: clientToEdit.name,
        email: clientToEdit.email,
        phone: clientToEdit.phone,
        document: clientToEdit.document,
        address: clientToEdit.address || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        document: '',
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
      } else {
        await createClient.mutateAsync(data);
      }
      onClose();
    } catch {
      // Erro é tratado e interceptado globalmente no client Axios
    }
  };

  const isLoading = createClient.isPending || updateClient.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
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
            label="E-mail *"
            type="email"
            placeholder="cliente@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Telefone *"
            placeholder="(34) 99999-8888"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Input
          label="CPF / CNPJ *"
          placeholder="000.000.000-00"
          error={errors.document?.message}
          {...register('document')}
        />

        <Input
          label="Endereço"
          placeholder="Rua, Número, Bairro - Cidade/UF"
          error={errors.address?.message}
          {...register('address')}
        />
      </form>
    </Modal>
  );
}