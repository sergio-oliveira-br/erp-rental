# backend/src/domain/ports/client_repository.py

from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from src.domain.entities.client import Client

class ClientRepositoryPort(ABC):
    @abstractmethod
    def save(self, client: Client) -> Client:
        """Salva um novo cliente vinculado ao seu owner_id."""
        pass

    @abstractmethod
    def get_by_id(self, client_id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Client]:
        """Busca um cliente garantindo que ele pertence ao tenant (owner_id) especificado."""
        pass

    @abstractmethod
    def list_all(self, owner_id: uuid.UUID, is_active: Optional[bool] = None) -> List[Client]:
        """Lista todos os clientes filtrando estritamente pelo owner_id e opcionalmente pelo status."""
        pass

    @abstractmethod
    def update(self, client: Client) -> Client:
        """Atualiza os dados de um cliente existente."""
        pass