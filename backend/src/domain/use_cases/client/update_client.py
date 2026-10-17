# backend/src/domain/use_cases/client/update_client.py

import uuid
from typing import Optional
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.client_repository import ClientRepositoryPort

class UpdateClientUseCase:
    def __init__(self, client_repo: ClientRepositoryPort):
        self.client_repo = client_repo

    def execute(
        self,
        client_id: uuid.UUID,
        owner_id: uuid.UUID,
        name: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
    ):
        # 1. Busca o cliente existente pelo ID e pelo Tenant
        client = self.client_repo.get_by_id(client_id, owner_id=owner_id)
        if not client:
            raise EntityNotFoundException("Cliente não encontrado.")

        # 2. Atualiza os dados da entidade se fornecidos
        if name is not None:
            client.name = name
        if phone is not None:
            client.phone = phone
        if address is not None:
            client.address = address

        # 3. Persiste as alterações
        return self.client_repo.update(client)