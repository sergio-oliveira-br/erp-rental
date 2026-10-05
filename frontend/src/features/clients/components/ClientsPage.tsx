// frontend/src/features/clients/components/ClientsPage.tsx

import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Archive, UserCheck, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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

  // Passa is_active invertido: se showInactives for true, busca is_active: false
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

  // Tratamento seguro para TypeScript
  const clients = Array.isArray(data) ? data : data?.items || [];
  const totalItems = Array.isArray(data) ? data.length : data?.total || 0;
  const limit = 10;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Banner Informativo no modo Inativos */}
      {showInactives && (
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
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showInactives ? 'Clientes Inativados' : 'Gestão de Clientes'}
          </h1>
          <p className="text-sm text-gray-500">
            {showInactives
              ? 'Consulte e reative clientes arquivados do sistema.'
              : 'Cadastre e gerencie os clientes do sistema de locação.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão para alternar visualização de inativos */}
          <Button
            variant={showInactives ? 'default' : 'outline'}
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
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, e-mail ou documento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <ClientTable
        clients={clients}
        isLoading={isLoading}
        showInactivesMode={showInactives}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteClient}
        onActivate={handleActivateClient}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-gray-200 text-sm">
          <span className="text-gray-600">
            Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={selectedClient}
      />
    </div>
  );
}