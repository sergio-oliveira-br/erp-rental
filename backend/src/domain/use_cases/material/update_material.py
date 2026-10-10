# backend/src/domain/use_cases/material/update_material.py

from decimal import Decimal
from typing import Optional
import uuid
from src.domain.entities.material import Material
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.material_repository import MaterialRepositoryPort

class UpdateMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort) -> None:
        self.material_repo = material_repo

    def execute(
        self,
        material_id: uuid.UUID,
        name: str,
        daily_rate: Decimal,
        description: Optional[str] = None,
        is_available: bool = True,
    ) -> Material:
        material = self.material_repo.get_by_id(material_id)
        if not material:
            raise EntityNotFoundException("Material não encontrado.")

        material.name = name
        material.daily_rate = daily_rate
        material.description = description
        material.is_available = is_available

        return self.material_repo.update(material)