# backend/src/domain/ports/material_repository.py

from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from src.domain.entities.material import Material

class MaterialRepositoryPort(ABC):
    @abstractmethod
    def save(self, material: Material) -> Material:
        pass

    @abstractmethod
    def get_by_id(self, material_id: uuid.UUID) -> Optional[Material]:
        pass

    @abstractmethod
    def list_all(self, active_only: bool = True) -> List[Material]:
        pass

    @abstractmethod
    def update(self, material: Material) -> Material:
        pass