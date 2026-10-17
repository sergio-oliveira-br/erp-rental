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
            owner_id=model.owner_id,
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
            owner_id=entity.owner_id,
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

    def get_by_id(self, material_id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Material]:
        # Consulta segura: valida o ID e o Tenant simultaneamente
        statement = select(MaterialTable).where(
            MaterialTable.id == material_id,
            MaterialTable.owner_id == owner_id
        )
        model = self.session.exec(statement).first()
        return self._to_entity(model) if model else None

    def list_all(self, owner_id: uuid.UUID, is_active: Optional[bool] = None) -> List[Material]:
        # Consulta isolada: o WHERE owner_id é obrigatório para garantir a privacidade dos dados
        statement = select(MaterialTable).where(MaterialTable.owner_id == owner_id)

        if is_active is not None:
            statement = statement.where(MaterialTable.is_active == is_active)

        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def update(self, material: Material) -> Material:
        model = self._to_model(material)
        merged_model = self.session.merge(model)
        self.session.commit()
        self.session.refresh(merged_model)
        return self._to_entity(merged_model)