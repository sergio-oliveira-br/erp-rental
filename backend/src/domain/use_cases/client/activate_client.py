# backend/src/domain/use_cases/client/activate_client.py

import uuid
from src.domain.entities.client import Client
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.client_repository import ClientRepositoryPort

class ActivateClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort) -> None:
        self.client_repo = client_repo

    def execute(self, client_id: uuid.UUID, owner_id: uuid.UUID) -> Client:
        # Busca o cliente validando o ID e o Tenant simultaneamente
        client = self.client_repo.get_by_id(client_id, owner_id=owner_id)
        if not client:
            raise EntityNotFoundException("Cliente não encontrado.")

        client.activate()
        return self.client_repo.update(client)