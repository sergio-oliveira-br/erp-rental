# backend/src/domain/use_cases/list_clients.py

from typing import List, Optional

from src.domain.entities.client import Client
from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository

class ListClientsUseCase:
    def __init__(self, client_repo: PostgresClientRepository):
        self.client_repo = client_repo

    def execute(self, is_active:Optional[bool] = True) -> List[Client]:
        return self.client_repo.list_all(is_active=is_active)