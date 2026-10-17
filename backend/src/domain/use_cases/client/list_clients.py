# backend/src/domain/use_cases/client/list_clients.py

import uuid
from typing import List, Optional
from src.domain.entities.client import Client
from src.domain.ports.client_repository import ClientRepositoryPort

class ListClientsUseCase:
    def __init__(self, client_repo: ClientRepositoryPort):
        self.client_repo = client_repo

    def execute(self, owner_id: uuid.UUID, is_active: Optional[bool] = True) -> List[Client]:
        return self.client_repo.list_all(owner_id=owner_id, is_active=is_active)