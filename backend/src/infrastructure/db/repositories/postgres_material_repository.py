# backend/src/infrastructure/db/repositories/postgres_material_repository.py

from typing import List, Optional
import uuid
from sqlmodel import Session, select

from src.domain.entities.material import Material
from src.domain.ports.material_repository import MaterialRepositoryPort
from src.infrastructure.db.models import MaterialTable


class PostgresMaterialRepository(MaterialRepositoryPort):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: MaterialTable) -> Material:
        return Material(
            id=model.id,
            name=model.name,
            daily_rate=model.daily_rate,
            description=model.description,
            is_available=model.is_available,
            is_active=model.is_active,
            created_at=model.created_at,
        )

    def _to_model(self, entity: Material) -> MaterialTable:
        return MaterialTable(
            id=entity.id,
            name=entity.name,
            daily_rate=entity.daily_rate,
            description=entity.description,
            is_available=entity.is_available,
            is_active=entity.is_active,
            created_at=entity.created_at,
        )

    def save(self, material: Material) -> Material:
        model = self._to_model(material)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, material_id: uuid.UUID) -> Optional[Material]:
        model = self.session.get(MaterialTable, material_id)
        return self._to_entity(model) if model else None

    def list_all(self, active_only: bool = True) -> List[Material]:
        statement = select(MaterialTable)
        if active_only:
            statement = statement.where(MaterialTable.is_active == True)
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def update(self, material: Material) -> Material:
        model = self._to_model(material)
        self.session.merge(model)
        self.session.commit()
        return material