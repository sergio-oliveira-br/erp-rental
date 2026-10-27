# backend/src/infrastructure/db/repositories/postgres_rental_repository.py

from datetime import date, datetime
from typing import List, Optional, Tuple, Any
import uuid
from sqlmodel import Session, select
import sqlalchemy as sa

from src.domain.entities.rental import PaymentStatus, Rental, RentalStatus
from src.domain.ports.rental_repository import RentalRepositoryPort
from src.infrastructure.db.models import RentalTable, ClientTable, MaterialTable, RentalAuditLogTable


class PostgresRentalRepository(RentalRepositoryPort):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: RentalTable) -> Rental:
        start_d = model.start_date.date() if isinstance(model.start_date, datetime) else model.start_date
        end_d = model.end_date.date() if isinstance(model.end_date, datetime) else model.end_date

        return Rental(
            id=model.id,
            owner_id=model.owner_id,  # <-- Mapeia o owner_id para o domínio
            client_id=model.client_id,
            material_id=model.material_id,
            quantity=model.quantity,
            start_date=start_d,
            end_date=end_d,
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
            owner_id=entity.owner_id, 
            client_id=entity.client_id,
            material_id=entity.material_id,
            quantity=entity.quantity,
            start_date=entity.start_date,
            end_date=entity.end_date,
            daily_rate=entity.daily_rate,
            delivery_address=entity.delivery_address,
            notes=entity.notes,
            enable_sms_notification=entity.enable_sms_notification,
            status=entity.status.value if isinstance(entity.status, RentalStatus) else str(entity.status),
            payment_status=entity.payment_status.value if isinstance(entity.payment_status, PaymentStatus) else str(
                entity.payment_status),
            created_at=entity.created_at,
        )

    def _map_rental_row(self, row: Tuple[RentalTable, str, str]) -> Rental:
        model, client_name, material_name = row
        entity = self._to_entity(model)
        entity.client_name = client_name
        entity.material_name = material_name
        return entity

    def _apply_rental_filters(
            self,
            statement: Any,
            search: Optional[str] = None,
            status: Optional[str] = None,
            payment_status: Optional[str] = None,
            start_date_from: Optional[date] = None,
            start_date_to: Optional[date] = None,
            end_date_from: Optional[date] = None,
            end_date_to: Optional[date] = None,
    ) -> Any:
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                sa.or_(ClientTable.name.ilike(search_term),MaterialTable.name.ilike(search_term)))

        if status:
            statement = statement.where(RentalTable.status == status)

        if payment_status:
            statement = statement.where(RentalTable.payment_status == payment_status)

        if start_date_from:
            statement = statement.where(RentalTable.start_date >= start_date_from)

        if start_date_to:
            statement = statement.where(RentalTable.start_date <= start_date_to)

        if end_date_from:
            statement = statement.where(RentalTable.end_date >= end_date_from)

        if end_date_to:
            statement = statement.where(RentalTable.end_date <= end_date_to)

        return statement

    def save(self, rental: Rental) -> Rental:
        model = self._to_model(rental)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, rental_id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Rental]:
        statement = (select(RentalTable, ClientTable.name, MaterialTable.name)
                     .join(ClientTable, RentalTable.client_id == ClientTable.id)
                     .join(MaterialTable, RentalTable.material_id == MaterialTable.id)
                     .where(RentalTable.id == rental_id, RentalTable.owner_id == owner_id))
        result = self.session.exec(statement).first()
        if not result:
            return None
        return self._map_rental_row(result)

    def list_all(self, owner_id: uuid.UUID, status: Optional[RentalStatus] = None) -> List[Rental]:
        statement = (
            select(RentalTable, ClientTable.name, MaterialTable.name)
            .join(ClientTable, RentalTable.client_id == ClientTable.id)
            .join(MaterialTable, RentalTable.material_id == MaterialTable.id)
            .where(RentalTable.owner_id == owner_id)
        )
        if status:
            statement = statement.where(RentalTable.status == status.value)
        results = self.session.exec(statement).all()
        return [self._map_rental_row(row) for row in results]

    def get_filtered_rentals(self,
                             owner_id: uuid.UUID, page: int = 1,
                             limit: int = 10, search: Optional[str] = None,
                             status: Optional[str] = None,
                             payment_status: Optional[str] = None,
                             start_date_from: Optional[date] = None,
                             start_date_to: Optional[date] = None,
                             end_date_from: Optional[date] = None,
                             end_date_to: Optional[date] = None,
                             order_by_end_date: bool = False) -> List[Rental]:

        statement = (select(RentalTable, ClientTable.name, MaterialTable.name)
                     .join(ClientTable, RentalTable.client_id == ClientTable.id)
                     .join(MaterialTable, RentalTable.material_id == MaterialTable.id)
                     .where(RentalTable.owner_id == owner_id))  # <-- Isolamento estrito por tenant

        statement = self._apply_rental_filters(
            statement,
            search=search,
            status=status,
            payment_status=payment_status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
            end_date_from=end_date_from,
            end_date_to=end_date_to,
        )

        if order_by_end_date:
            statement = statement.order_by(
                RentalTable.end_date.asc(),
                RentalTable.id.asc(),
            )
        else:
            statement = statement.order_by(
                RentalTable.start_date.desc(),
                RentalTable.id.desc(),
            )

        offset = (page - 1) * limit
        statement = statement.offset(offset).limit(limit)

        results = self.session.exec(statement).all()
        return [self._map_rental_row(row) for row in results]

    def list_by_client(self, client_id: uuid.UUID, owner_id: uuid.UUID) -> List[Rental]:
        statement = select(RentalTable).where(
            RentalTable.client_id == client_id,
            RentalTable.owner_id == owner_id
        )
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def list_expiring_on(self, target_date: date, owner_id: uuid.UUID) -> List[Rental]:
        statement = select(RentalTable).where(
            RentalTable.end_date == target_date,
            RentalTable.status == RentalStatus.ACTIVE.value,
            RentalTable.owner_id == owner_id
        )
        results = self.session.exec(statement).all()
        return [self._to_entity(m) for m in results]

    def update(self, rental: Rental) -> Rental:
        model = self._to_model(rental)
        merged_model = self.session.merge(model)
        self.session.commit()
        self.session.refresh(merged_model)
        return self._to_entity(merged_model)

    def add_audit_log(self, rental_id: uuid.UUID, action: str, description: str) -> None:
        log_model = RentalAuditLogTable(
            rental_id=rental_id,
            action=action,
            description=description
        )
        self.session.add(log_model)
        self.session.commit()

    def get_audit_logs(self, rental_id: uuid.UUID) -> List[dict]:
        statement = (
            select(RentalAuditLogTable)
            .where(RentalAuditLogTable.rental_id == rental_id)
            .order_by(RentalAuditLogTable.created_at.desc())
        )
        results = self.session.exec(statement).all()
        return [
            {
                "id": log.id,
                "action": log.action,
                "description": log.description,
                "created_at": log.created_at
            }
            for log in results
        ]

    def count_filtered_rentals(
            self,
            owner_id: uuid.UUID,
            search: Optional[str] = None,
            status: Optional[str] = None,
            payment_status: Optional[str] = None,
            start_date_from: Optional[date] = None,
            start_date_to: Optional[date] = None,
            end_date_from: Optional[date] = None,
            end_date_to: Optional[date] = None,
    ) -> int:
        statement = (
            select(sa.func.count(RentalTable.id))
            .select_from(RentalTable)
            .join(ClientTable, RentalTable.client_id == ClientTable.id)
            .join(MaterialTable, RentalTable.material_id == MaterialTable.id)
            .where(RentalTable.owner_id == owner_id)
        )

        statement = self._apply_rental_filters(
            statement, search, status, payment_status, start_date_from, start_date_to, end_date_from, end_date_to
        )

        return self.session.exec(statement).one()