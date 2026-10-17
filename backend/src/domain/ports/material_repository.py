# backend/src/domain/ports/material_repository.py

from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from src.domain.entities.material import Material

class MaterialRepositoryPort(ABC):
    @abstractmethod
    def save(self, material: Material) -> Material:
        """Salva um novo material vinculado ao seu owner_id."""
        pass

    @abstractmethod
    def get_by_id(self, material_id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Material]:
        """Busca um material garantindo que ele pertence ao tenant (owner_id) especificado."""
        pass

    @abstractmethod
    def list_all(self, owner_id: uuid.UUID, is_active: Optional[bool] = True) -> List[Material]:
        """Lista todos os materiais filtrando estritamente pelo owner_id e opcionalmente pelo status."""
        pass

    @abstractmethod
    def update(self, material: Material) -> Material:
        """Atualiza os dados de um material existente."""
        pass