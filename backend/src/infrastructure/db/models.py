# backend/src/infrastructure/db/models.py

from datetime import datetime, timezone, date
from decimal import Decimal
from typing import Optional
import uuid
from sqlmodel import Field, SQLModel


class MaterialTable(SQLModel, table=True):
    __tablename__ = "materials"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    daily_rate: Decimal = Field(max_digits=10, decimal_places=2)
    description: Optional[str] = Field(default=None)
    is_available: bool = Field(default=True)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ClientTable(SQLModel, table=True):
    __tablename__ = "clients"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    phone: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RentalTable(SQLModel, table=True):
    __tablename__ = "rentals"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="clients.id", index=True)
    material_id: uuid.UUID = Field(foreign_key="materials.id", index=True)
    start_date: date = Field()
    end_date: date = Field()
    daily_rate: Decimal = Field(max_digits=10, decimal_places=2)
    delivery_address: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    enable_sms_notification: bool = Field(default=False)
    status: str = Field(default="ACTIVE")
    payment_status: str = Field(default="PENDING")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))