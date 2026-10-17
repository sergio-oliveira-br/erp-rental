# backend/src/domain/use_cases/client/delete_client.py

import uuid
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.client_repository import ClientRepositoryPort

class DeleteClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort) -> None:
        self.client_repo = client_repo

    def execute(self, client_id: uuid.UUID, owner_id: uuid.UUID) -> None:
        # 1. Busca o cliente pelo ID validando o tenant simultaneamente
        client = self.client_repo.get_by_id(client_id, owner_id=owner_id)
        if not client:
            raise EntityNotFoundException("Cliente não encontrado.")

        # 2. Inativa o cliente (Soft Delete)
        client.inactivate()

        # 3. Salva o estado atualizado
        self.client_repo.update(client)