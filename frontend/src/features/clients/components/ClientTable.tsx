// frontend/src/features/clients/components/ClientTable.tsx

import { Edit2, Trash2, UserCheck, UserX, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Client } from '@/types';

// 1. Atualizado as props para receber showInactivesMode e onActivate
interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
  showInactivesMode?: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onActivate?: (id: string) => void;
}

export function ClientTable({
  clients,
  isLoading,
  showInactivesMode = false,
  onEdit,
  onDelete,
  onActivate,
}: ClientTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Carregando lista de clientes...
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 font-medium">Nenhum cliente encontrado.</p>
        <p className="text-sm text-gray-400 mt-1">
          {showInactivesMode
            ? 'Não há clientes inativados no momento.'
            : 'Cadastre um novo cliente para começar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Contato</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {client.address || 'Sem endereço cadastrado'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{client.phone}</div>
                </td>
                <td className="px-6 py-4">
                  {client.is_active ? (
                    <Badge variant="success" className="gap-1">
                      <UserCheck className="w-3 h-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="gap-1">
                      <UserX className="w-3 h-3" /> Inativo
                    </Badge>
                  )}
                </td>
                {/* 2. Ações condicionais de acordo com o modo da tabela */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {showInactivesMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActivate?.(client.id)}
                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 gap-1"
                        title="Reativar cliente"
                      >
                        <RotateCcw className="w-4 h-4" /> Reativar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(client)}
                          title="Editar cliente"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(client.id)}
                          title="Desativar cliente"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}