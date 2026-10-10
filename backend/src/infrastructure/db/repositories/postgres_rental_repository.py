# backend/src/infrastructure/db/repositories/postgres_rental_repository.py

from datetime import date
from typing import List, Optional
import uuid
from sqlmodel import Session, select

from src.domain.entities.rental import PaymentStatus, Rental, RentalStatus
from src.domain.ports.rental_repository import RentalRepositoryPort
from src.infrastructure.db.models import RentalTable


class PostgresRentalRepository(RentalRepositoryPort):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: RentalTable) -> Rental:
        return Rental(
            id=model.id,
            client_id=model.client_id,
            material_id=model.material_id,
            start_date=model.start_date,
            end_date=model.end_date,
            daily_rate=model.daily_rate,
            delivery_address=model.delivery_address,
            notes=model.notes,
            enable_sms_notification=model.enable_sms_notification,
            status=RentalStatus(model.status),
            payment_status=PaymentStatus(model.payment_status),
            created_at=model.created_at,
        )

    def _to_model(self, entity: Rental) -> RentalTable:
        return RentalTable(
            id=entity.id,
            client_id=entity.client_id,
            material_id=entity.material_id,
            start_date=entity.start_date,
            end_date=entity.end_date,
            daily_rate=entity.daily_rate,
            delivery_address=entity.delivery_address,
            notes=entity.notes,
            enable_sms_notification=entity.enable_sms_notification,
            status=entity.status.value if isinstance(entity.status, RentalStatus) else str(entity.status),
            payment_status=entity.payment_status.value if isinstance(entity.payment_status, PaymentStatus) else str(entity.payment_status),
            created_at=entity.created_at,
        )

    def save(self, rental: Rental) -> Rental:
        model = self._to_model(rental)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, rental_id: uuid.UUID) -> Optional[Rental]:
        model = self.session.get(RentalTable, rental_id)
        return self._to_entity(model) if model else None

    def list_all(self, status: Optional[RentalStatus] = None) -> List[Rental]:
        statement = select(RentalTable)
        if status:
            statement = statement.where(RentalTable.status == status.value)
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def list_by_client(self, client_id: uuid.UUID) -> List[Rental]:
        statement = select(RentalTable).where(RentalTable.client_id == client_id)
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def list_expiring_on(self, target_date: date) -> List[Rental]:
        statement = select(RentalTable).where(
            RentalTable.end_date == target_date,
            RentalTable.status == RentalStatus.ACTIVE.value
        )
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def update(self, rental: Rental) -> Rental:
        model = self._to_model(rental)
        self.session.merge(model)
        self.session.commit()
        return rental