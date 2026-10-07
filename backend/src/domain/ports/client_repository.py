# backend/src/domain/ports/client_repository.py

from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from src.domain.entities.client import Client

class ClientRepositoryPort(ABC):
    @abstractmethod
    def save(self, client: Client) -> Client:
        pass

    @abstractmethod
    def get_by_id(self, client_id: uuid.UUID) -> Optional[Client]:
        pass

    @abstractmethod
    def list_all(self, is_active: bool = True) -> List[Client]:
        pass

    @abstractmethod
    def update(self, client: Client) -> Client:
        pass