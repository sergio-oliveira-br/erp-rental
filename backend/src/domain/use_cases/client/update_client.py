# backend/src/domain/use_cases/update_client.py

import uuid
from typing import Optional

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository

class UpdateClientUseCase:
    def __init__(self, client_repo: PostgresClientRepository):
        self.client_repo = client_repo

    def execute(
        self,
        client_id: uuid.UUID,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
    ):

        # 1. Busca o cliente existente pelo ID
        client = self.client_repo.get_by_id(client_id)
        if not client:
            raise EntityNotFoundException("Cliente não encontrado.")

        # 2. Atualiza os dados da entidade
        if name is not None:
            client.name = name
        if phone is not None:
            client.phone = phone
        if address is not None:
            client.address = address

        # 3. Passa a entidade completa para o metodo update do repositório
        return self.client_repo.update(client)