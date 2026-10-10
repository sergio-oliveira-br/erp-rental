# backend/src/domain/use_cases/delete_client.py

import uuid

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.client_repository import ClientRepositoryPort


class DeleteClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort) -> None:
        self.client_repo = client_repo

    def execute(self, client_id: uuid.UUID) -> None:
        # 1. Busca o cliente existente pelo ID
        client = self.client_repo.get_by_id(client_id)
        if not client:
            raise EntityNotFoundException("Cliente não encontrado.")

        # 2. Atualiza os dados da entidade ajustando o status do is_active para false
        client.inactivate()

        # 3. Salva o estado inativo
        self.client_repo.update(client)