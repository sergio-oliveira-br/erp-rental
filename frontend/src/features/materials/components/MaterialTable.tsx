// frontend/src/features/materials/components/MaterialTable.tsx

import {Edit2, Trash2, RotateCcw, Package, CheckCircle2, XCircle, CheckCircle} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Material } from '@/types';

interface MaterialTableProps {
  materials: Material[];
  isLoading: boolean;
  showInactivesMode?: boolean;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
  onActivate?: (id: string) => void;
}

export function MaterialTable({
  materials,
  isLoading,
  showInactivesMode = false,
  onEdit,
  onDelete,
  onActivate,
}: MaterialTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Carregando lista de materiais...
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Package className="w-5 h-5" />
        </div>
        <p className="text-gray-600 font-medium text-sm">Nenhum material encontrado.</p>
        <p className="text-xs text-gray-400 mt-1">
          {showInactivesMode
            ? 'Não há materiais inativados no momento.'
            : 'Cadastre um novo material para começar.'}
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
              <th className="px-6 py-3">Material / Equipamento</th>
              <th className="px-6 py-3">Diária (R$)</th>
              <th className="px-6 py-3">Disponibilidade</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{material.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {material.description || 'Sem descrição cadastrada'}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  R$ {Number(material.daily_rate).toFixed(2).replace('.', ',')}
                </td>
                <td className="px-6 py-4">
                  {material.is_available ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disponível
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="gap-1">
                      <XCircle className="w-3 h-3" /> Em Uso / Locado
                    </Badge>
                  )}
                </td>
               <td className="px-6 py-4">
                  {material.is_active ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="danger" className="gap-1">
                      <XCircle className="w-3 h-3" /> Inativo
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {showInactivesMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActivate?.(material.id)}
                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 gap-1"
                        title="Reativar material"
                      >
                        <RotateCcw className="w-4 h-4" /> Reativar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(material)}
                          title="Editar material"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(material.id)}
                          title="Desativar material"
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