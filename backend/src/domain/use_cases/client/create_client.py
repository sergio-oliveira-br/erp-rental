# backend/src/domain/use_cases/client/create_client.py

import uuid
from typing import Optional

from src.domain.entities.client import Client
from src.domain.ports.client_repository import ClientRepositoryPort

class CreateClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort):
        self.client_repo = client_repo

    def execute(self, name: str, phone: Optional[str], address: Optional[str], owner_id: uuid.UUID) -> Client:
        client = Client(name=name, phone=phone, address=address, owner_id=owner_id)
        return self.client_repo.save(client)