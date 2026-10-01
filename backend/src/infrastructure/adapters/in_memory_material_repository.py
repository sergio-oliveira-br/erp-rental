#

from typing import Dict, List, Optional
import uuid
from src.domain.entities.material import Material
from src.domain.ports.material_repository import MaterialRepositoryPort

class InMemoryMaterialRepository(MaterialRepositoryPort):
    def __init__(self) -> None:
        self._materials: Dict[uuid.UUID, Material] = {}

    def save(self, material: Material) -> Material:
        self._materials[material.id] = material
        return material

    def get_by_id(self, material_id: uuid.UUID) -> Optional[Material]:
        return self._materials.get(material_id)

    def list_all(self, active_only: bool = True) -> List[Material]:
        if active_only:
            return [material for material in self._materials.values() if material.is_active]
        return list(self._materials.values())

    def update(self, material: Material) -> Material:
        self._materials[material.id] = material
        return material