# backend/src/domain/use_cases/material/list_materials.py

from typing import List, Optional
from src.domain.entities.material import Material
from src.domain.ports.material_repository import MaterialRepositoryPort

class ListMaterialsUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort) -> None:
        self.material_repo = material_repo

    def execute(self, is_active: Optional[bool] = True) -> List[Material]:
        return self.material_repo.list_all(is_active=is_active)