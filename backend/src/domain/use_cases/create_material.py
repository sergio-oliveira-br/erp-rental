# backend/src/domain/use_cases/create_material.py

from decimal import Decimal
from typing import Optional
from src.domain.entities.material import Material
from src.domain.ports.material_repository import MaterialRepositoryPort

class CreateMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort):
        self.material_repo = material_repo

    def execute(self, name: str, daily_rate: Decimal, description: Optional[str] = None) -> Material:
        material = Material(name=name, daily_rate=daily_rate, description=description)
        return self.material_repo.save(material)