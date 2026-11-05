# backend/src/infrastructure/db/repositories/postgres_client_repository.py

import uuid
from typing import Optional

from sqlmodel import Session, select

from src.domain.entities.client import Client
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.client_repository import ClientRepositoryPort
from src.infrastructure.db.models import ClientTable


class PostgresClientRepository(ClientRepositoryPort):
    """
    Implementação PostgreSQL do repositório de clientes.

    Responsável por converter entidades de domínio em modelos
    de persistência e executar operações no banco de dados.
    """

    def __init__(self, session: Session):
        # Recebe a sessão por injeção de dependência.
        # O gerenciamento do ciclo de vida da sessão fica fora do repositório.
        self.session = session

    def _to_entity(self, model: ClientTable) -> Client:
        """
        Converte um modelo de persistência em entidade de domínio.
        """

        return Client(
            id=model.id,
            owner_id=model.owner_id,
            name=model.name,
            phone=model.phone,
            address=model.address,
            is_active=model.is_active,
            created_at=model.created_at,
        )

    def _to_model(self, entity: Client) -> ClientTable:
        """
        Converte uma entidade de domínio em modelo de persistência.
        """

        return ClientTable(
            id=entity.id,
            owner_id=entity.owner_id,
            name=entity.name,
            phone=entity.phone,
            address=entity.address,
            is_active=entity.is_active,
            created_at=entity.created_at,
        )

    def save(self, client: Client) -> Client:
        """
        Persiste um novo cliente.

        Este metodo é destinado exclusivamente à criação.
        """

        model = self._to_model(client)

        self.session.add(model)

        try:
            self.session.commit()
            self.session.refresh(model)

        except Exception:
            # Desfaz a transação caso a gravação falhe,
            # evitando deixar a sessão em estado inválido.
            self.session.rollback()
            raise

        return self._to_entity(model)

    def get_by_id(
            self,
            client_id: uuid.UUID,
            owner_id: uuid.UUID,
    ) -> Optional[Client]:
        """
        Busca um cliente pelo ID e pelo proprietário.

        A consulta exige os dois identificadores para impedir
        acesso a registros pertencentes a outros usuários.
        """

        statement = select(ClientTable).where(
            ClientTable.id == client_id,
            ClientTable.owner_id == owner_id,
        )

        model = self.session.exec(statement).first()

        return self._to_entity(model) if model else None

    def list_all(
            self,
            owner_id: uuid.UUID,
            is_active: Optional[bool] = None,
    ) -> list[Client]:
        """
        Lista os clientes pertencentes ao proprietário.

        Permite filtrar os registros pelo estado de atividade.
        O filtro por proprietário é obrigatório.
        """

        statement = select(ClientTable).where(
            ClientTable.owner_id == owner_id
        )

        if is_active is not None:
            statement = statement.where(
                ClientTable.is_active == is_active
            )

        statement = statement.order_by(ClientTable.name)

        results = self.session.exec(statement).all()

        return [
            self._to_entity(model)
            for model in results
        ]

    def update(self, client: Client) -> Client:
        """
        Atualiza um cliente existente.

        Antes da alteração, verifica se o registro existe
        e pertence ao proprietário informado.
        """

        statement = select(ClientTable).where(
            ClientTable.id == client.id,
            ClientTable.owner_id == client.owner_id,
        )

        model = self.session.exec(statement).first()

        if model is None:
            raise EntityNotFoundException("Cliente não encontrado.")

        # Atualiza os campos do registro já associado à sessão.
        model.name = client.name
        model.phone = client.phone
        model.address = client.address
        model.is_active = client.is_active

        try:
            self.session.commit()
            self.session.refresh(model)

        except Exception:
            # Desfaz a transação caso a atualização falhe.
            self.session.rollback()
            raise

        return self._to_entity(model)