// frontend/src/features/materials/components/MaterialsPage.tsx

import { useState } from 'react';
import { Plus, Archive, PackageCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
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

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <EntityPageLayout
      title={showInactives ? 'Materiais Inativados' : 'Gestão de Materiais'}
      description={
        showInactives
          ? 'Consulte e reative materiais desativados do acervo.'
          : 'Cadastre e gerencie equipamentos disponíveis para locação.'
      }
      searchValue={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar por nome ou descrição do material..."
      banner={
        showInactives ? (
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
        </>
      }
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      <MaterialTable
        materials={materials}
        isLoading={isLoading}
        showInactivesMode={showInactives}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteMaterial}
        onActivate={handleActivateMaterial}
      />

      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        materialToEdit={selectedMaterial}
      />
    </EntityPageLayout>
  );
}