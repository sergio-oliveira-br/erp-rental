# backend/src/infrastructure/adapters/in_memory_client_repository.py

from typing import Dict, List, Optional
import uuid
from src.domain.entities.client import Client
from src.domain.ports.client_repository import ClientRepositoryPort

class InMemoryClientRepository(ClientRepositoryPort):
    def __init__(self) -> None:
        self._clients: Dict[uuid.UUID, Client] = {}

    def save(self, client: Client) -> Client:
        self._clients[client.id] = client
        return client

    def get_by_id(self, client_id: uuid.UUID) -> Optional[Client]:
        return self._clients.get(client_id)

    def list_all(self, active_only: bool = True) -> List[Client]:
        if active_only:
            return [client for client in self._clients.values() if client.is_active]
        return list(self._clients.values())

    def update(self, client: Client) -> Client:
        self._clients[client.id] = client
        return client