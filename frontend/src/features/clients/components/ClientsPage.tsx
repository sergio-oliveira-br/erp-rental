// frontend/src/features/clients/components/ClientsPage.tsx

import { useState } from 'react';
import { Plus, Archive, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { useClients, useDeleteClient, useActivateClient } from '../hooks/useClients';
import { ClientTable } from '../components/ClientTable';
import { ClientFormModal } from '../components/ClientFormModal';
import type { Client } from '@/types';

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showInactives, setShowInactives] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data, isLoading } = useClients({
    page,
    limit: 10,
    search,
    is_active: !showInactives,
  });

  const deleteClient = useDeleteClient();
  const activateClient = useActivateClient();

  const handleOpenCreateModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este cliente?')) {
      await deleteClient.mutateAsync(id);
    }
  };

  const handleActivateClient = async (id: string) => {
    if (window.confirm('Deseja reativar o cadastro deste cliente?')) {
      await activateClient.mutateAsync(id);
    }
  };

  const clients = Array.isArray(data) ? data : data?.items || [];
  const totalItems = Array.isArray(data) ? data.length : data?.total || 0;
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <EntityPageLayout
      title={showInactives ? 'Clientes Inativados' : 'Gestão de Clientes'}
      description={
        showInactives
          ? 'Consulte e reative clientes arquivados do sistema.'
          : 'Cadastre e gerencie os clientes do sistema de locação.'
      }
      searchValue={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar por nome..."
      banner={
        showInactives ? (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold">Modo de Visualização: Clientes Inativados</span>
                <p className="text-xs text-amber-700">
                  Exibindo apenas cadastros desativados. Clique em "Reativar" na tabela para restaurá-los.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowInactives(false);
                setPage(1);
              }}
              className="border-amber-300 bg-white hover:bg-amber-100 text-amber-900 shrink-0"
            >
              Voltar para Ativos
            </Button>
          </div>
        ) : undefined
      }
      actions={
        <>
          <Button
            variant={showInactives ? 'primary' : 'outline'}
            onClick={() => {
              setShowInactives(!showInactives);
              setPage(1);
            }}
            className={showInactives ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
          >
            {showInactives ? (
              <>
                <UserCheck className="w-4 h-4 mr-1" /> Ver Ativos
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-1" /> Ver Inativos
              </>
            )}
          </Button>

          {!showInactives && (
            <Button onClick={handleOpenCreateModal} className="shrink-0">
              <Plus className="w-4 h-4" /> Novo Cliente
            </Button>
          )}
        </>
      }
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      <ClientTable
        clients={clients}
        isLoading={isLoading}
        showInactivesMode={showInactives}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteClient}
        onActivate={handleActivateClient}
      />

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={selectedClient}
      />
    </EntityPageLayout>
  );
}