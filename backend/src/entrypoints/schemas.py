# backend/src/entrypoints/schemas/schemas.py
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Generic, TypeVar, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.domain.entities.rental import PaymentStatus, RentalStatus


T = TypeVar("T")

# --- CLIENT SCHEMAS ---
class ClientCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="João Silva")
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    address: Optional[str]

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int


class ClientResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    address: Optional[str]
    is_active: bool
    created_at: datetime

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class ClientUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    address: Optional[str]

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class ClientDuplicateCheckSchema(BaseModel):
    name: str = Field(min_length=3, description="Nome completo para verificar")


class PossibleDuplicateResponseSchema(BaseModel):
    id: UUID
    name: str
    phone: Optional[str] = None
    similarity: float


class ClientDuplicateCheckResponseSchema(BaseModel):
    has_duplicates: bool
    matches: list[PossibleDuplicateResponseSchema]


# --- MATERIAL SCHEMAS ---
class MaterialCreateSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nome do material/equipamento")
    daily_rate: Decimal = Field(..., gt=0, description="Valor da taxa diária de locação")
    description: Optional[str] = None

class MaterialUpdateSchema(BaseModel):
    name: str
    daily_rate: Decimal = Field(..., gt=0)
    description: Optional[str] = None
    is_available: bool = True

class MaterialResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    daily_rate: Decimal
    description: Optional[str]
    is_available: bool
    is_active: bool
    created_at: datetime

class MaterialDuplicateCheckSchema(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=100,
        description="Nome do material para verificar possíveis duplicidades",
    )


class PossibleMaterialDuplicateResponseSchema(BaseModel):
    id: UUID
    name: str
    similarity: float


class MaterialDuplicateCheckResponseSchema(BaseModel):
    has_duplicates: bool
    matches: List[PossibleMaterialDuplicateResponseSchema]


# --- RENTAL SCHEMAS ---
class RentalCreateSchema(BaseModel):
    client_id: uuid.UUID
    material_id: uuid.UUID
    quantity: int = Field(
        default=1,
        ge=1,
        description="Quantidade de unidades alugadas",
        examples=[20],
    )
    start_date: date
    end_date: date
    delivery_address: Optional[str] = Field(
        None,
        description="Endereço específico da obra. Se não informado, usará o do cadastro do cliente.",
        example="Obra B - Av. Paulista, 1000"
    )
    notes: Optional[str] = Field(None, example="Entregar na portaria técnica")
    enable_sms_notification: bool = False
    daily_rate: Optional[Decimal] = Field(
        None,
        description="Valor da diária negociada. Se não informado, usará o valor padrão do material."
    )


class RentalResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_id: uuid.UUID
    client_name: Optional[str] = None
    material_id: uuid.UUID
    quantity: int
    material_name: Optional[str] = None
    start_date: date
    end_date: date
    daily_rate: Decimal

    # Propriedades calculadas pela Entidade de Domínio
    total_days: int
    total_amount: Decimal = Field(..., serialization_alias="total_value")

    delivery_address: Optional[str]
    notes: Optional[str]
    enable_sms_notification: bool
    status: RentalStatus = Field(..., validation_alias="status", serialization_alias="rental_status")
    payment_status: PaymentStatus
    created_at: datetime


class RentalPaymentUpdateSchema(BaseModel):
    payment_status: PaymentStatus


class RentalUpdateSchema(BaseModel):
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    end_date: Optional[date] = None

class RentalAuditLogResponse(BaseModel):
    id: uuid.UUID
    action: str
    description: str
    created_at: datetime



# --- AUTH / USER SCHEMAS ---
class LoginRequest(BaseModel):
    username: str
    password: str

class Verify2FARequest(BaseModel):
    username: str
    code: str

class CreateUserRequest(BaseModel):
    username: str
    password: str
    phone_number: str
    is_admin: bool = False

class UserResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    phone_number: str
    is_admin: bool
    is_active: bool
    created_at: datetime