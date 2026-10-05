// frontend/src/features/clients/components/ClientsPage.tsx

import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useClients, useDeleteClient } from '../hooks/useClients';
import { ClientTable } from '../components/ClientTable';
import { ClientFormModal } from '../components/ClientFormModal';
import type { Client } from '@/types';

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data, isLoading } = useClients({ page, limit: 10, search });
  const deleteClient = useDeleteClient();

  const handleOpenCreateModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      await deleteClient.mutateAsync(id);
    }
  };

// Tratamento seguro para TypeScript
const clients = Array.isArray(data)
? data
: data?.items || [];

const totalItems = Array.isArray(data)
  ? data.length
  : data?.total || 0;

const limit = 10;
const totalPages = Math.ceil(totalItems / limit) || 1;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="text-sm text-gray-500">Cadastre e gerencie os clientes do sistema de locação.</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="shrink-0">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Bar de Pesquisa e Filtros */}
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
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteClient}
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