# backend/src/entrypoints/schemas/schemas.py

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Generic, TypeVar, List
import uuid
from pydantic import BaseModel, ConfigDict, Field

from src.domain.entities.rental import PaymentStatus, RentalStatus


T = TypeVar("T")

# --- CLIENT SCHEMAS ---
class ClientCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="João Silva")
    phone: str = Field(..., min_length=8, max_length=20, example="11999998888")
    address: str = Field(..., min_length=5, max_length=255, example="Rua A, 123 - São Paulo/SP")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int


class ClientResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    phone: str
    address: str
    is_active: bool
    created_at: datetime


class ClientUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    address: Optional[str] = Field(None, min_length=5, max_length=255)


# --- MATERIAL SCHEMAS ---
class MaterialCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="Betoneira 400L")
    daily_rate: Decimal = Field(..., gt=0, example=80.00)
    description: Optional[str] = Field(None, example="Betoneira monofásica 220V")


class MaterialResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    daily_rate: Decimal
    description: Optional[str]
    is_available: bool
    is_active: bool
    created_at: datetime


# --- RENTAL SCHEMAS ---
class RentalCreateSchema(BaseModel):
    client_id: uuid.UUID
    material_id: uuid.UUID
    start_date: date
    end_date: date
    delivery_address: Optional[str] = Field(
        None,
        description="Endereço específico da obra. Se não informado, usará o do cadastro do cliente.",
        example="Obra B - Av. Paulista, 1000"
    )
    notes: Optional[str] = Field(None, example="Entregar na portaria técnica")
    enable_sms_notification: bool = False


class RentalResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    material_id: uuid.UUID
    start_date: date
    end_date: date
    daily_rate: Decimal
    total_days: int
    total_amount: Decimal
    delivery_address: Optional[str]
    notes: Optional[str]
    enable_sms_notification: bool
    status: RentalStatus
    payment_status: PaymentStatus
    created_at: datetime