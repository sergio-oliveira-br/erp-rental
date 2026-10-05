# backend/src/infrastructure/db/repositories/postgres_client_repository.py
import uuid
from typing import Optional, List

from sqlmodel import Session, select

from src.domain.entities.client import Client
from src.domain.ports.client_repository import ClientRepositoryPort
from src.infrastructure.db.models import ClientTable


class PostgresClientRepository(ClientRepositoryPort):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: ClientTable) -> Client:
        return Client(
            id=model.id,
            name=model.name,
            phone=model.phone,
            address=model.address,
            is_active=model.is_active,
            created_at=model.created_at,
        )

    def _to_model(self, entity:Client) -> ClientTable:
        return ClientTable(
            id=entity.id,
            name=entity.name,
            phone=entity.phone,
            address=entity.address,
            is_active=entity.is_active,
            created_at=entity.created_at,
        )

    def save(self, client: Client) -> Client:
        model = self._to_model(client)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, client_id: uuid.UUID) -> Optional[Client]:
        model = self.session.get(ClientTable, client_id)
        return self._to_entity(model) if model else None

    def list_all(self, is_active: bool = True) -> List[Client]:
        statement = select(ClientTable)
        if is_active:
            statement = statement.where(ClientTable.is_active == True)
        results = self.session.exec(statement).all()
        return [self._to_entity(model) for model in results]

    def update(self, client: Client) -> Client:
        model = self._to_model(client)
        self.session.merge(model)
        self.session.commit()
        return client