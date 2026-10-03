# backend/src/domain/use_cases/create_client.py

from typing import Optional
from src.domain.entities.client import Client
from src.domain.ports.client_repository import ClientRepositoryPort

class CreateClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort):
        self.client_repo = client_repo

    def execute(self, name: str, phone: str, address: str, email: Optional[str] = None) -> Client:
        client = Client(name=name, phone=phone, address=address)
        return self.client_repo.save(client)