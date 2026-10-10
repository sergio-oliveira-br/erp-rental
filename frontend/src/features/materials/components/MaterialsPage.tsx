// frontend/src/features/materials/components/MaterialsPage.tsx

import { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Archive, PackageCheck, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMaterials, useDeleteMaterial, useActivateMaterial } from '../hooks/useMaterials';
import { MaterialTable } from './MaterialTable';
import { MaterialFormModal } from './MaterialFormModal';
import type { Material } from '@/types';

export function MaterialsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showInactives, setShowInactives] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { data, isLoading } = useMaterials({
    page,
    limit: 10,
    search,
    is_active: !showInactives,
  });

  const deleteMaterial = useDeleteMaterial();
  const activateMaterial = useActivateMaterial();

  const handleOpenCreateModal = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este material?')) {
      await deleteMaterial.mutateAsync(id);
    }
  };

  const handleActivateMaterial = async (id: string) => {
    if (window.confirm('Deseja reativar o cadastro deste material?')) {
      await activateMaterial.mutateAsync(id);
    }
  };

  const materials = Array.isArray(data) ? data : data?.items || [];
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
              <span className="font-semibold">Modo de Visualização: Materiais Inativados</span>
              <p className="text-xs text-amber-700">
                Exibindo equipamentos arquivados. Clique em "Reativar" para torná-los novamente ativos no sistema.
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
            {showInactives ? 'Materiais Inativados' : 'Gestão de Materiais'}
          </h1>
          <p className="text-sm text-gray-500">
            {showInactives
              ? 'Consulte e reative materiais desativados do acervo.'
              : 'Cadastre e gerencie equipamentos disponíveis para locação.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
                <PackageCheck className="w-4 h-4 mr-1" /> Ver Ativos
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 mr-1" /> Ver Inativos
              </>
            )}
          </Button>

          {!showInactives && (
            <Button onClick={handleOpenCreateModal} className="shrink-0">
              <Plus className="w-4 h-4" /> Novo Material
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
            placeholder="Buscar por nome ou descrição do material..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Tabela */}
      <MaterialTable
        materials={materials}
        isLoading={isLoading}
        showInactivesMode={showInactives}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteMaterial}
        onActivate={handleActivateMaterial}
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

      {/* Modal */}
      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        materialToEdit={selectedMaterial}
      />
    </div>
  );
}