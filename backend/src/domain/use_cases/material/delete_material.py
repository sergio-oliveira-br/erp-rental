# backend/src/domain/use_cases/material/delete_material.py

import uuid
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.material_repository import MaterialRepositoryPort

class DeleteMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort) -> None:
        self.material_repo = material_repo

    def execute(self, material_id: uuid.UUID) -> None:
        material = self.material_repo.get_by_id(material_id)
        if not material:
            raise EntityNotFoundException("Material não encontrado.")

        material.inactivate()
        self.material_repo.update(material)