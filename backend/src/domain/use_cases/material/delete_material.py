# backend/src/domain/use_cases/material/delete_material.py

import uuid
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.material_repository import MaterialRepositoryPort

class DeleteMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort) -> None:
        self.material_repo = material_repo

    def execute(self, material_id: uuid.UUID, owner_id: uuid.UUID) -> None:
        # 1. Busca o material validando o ID e o Tenant simultaneamente
        material = self.material_repo.get_by_id(material_id, owner_id=owner_id)
        if not material:
            raise EntityNotFoundException("Material não encontrado.")

        # 2. Inativa o material (Soft Delete)
        material.inactivate()

        # 3. Persiste o estado inativo
        self.material_repo.update(material)