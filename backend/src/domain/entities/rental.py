from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional
import uuid

class RentalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    FINISHED = "FINISHED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"

@dataclass
class Rental:
    client_id: uuid.UUID
    material_id: uuid.UUID
    start_date: date
    end_date: date
    daily_rate: Decimal
    delivery_address: Optional[str] = None  # Endereço específico desta locação/obra
    notes: Optional[str] = None             # Observações pontuais (ex: instruções de entrega)
    enable_sms_notification: bool = False
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    status: RentalStatus = RentalStatus.ACTIVE
    payment_status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    client_name: Optional[str] = None
    material_name: Optional[str] = None

    @property
    def total_days(self) -> int:
        """Calcula a quantidade de dias do contrato de aluguel."""
        delta = (self.end_date - self.start_date).days
        return max(delta, 1)

    @property
    def total_amount(self) -> Decimal:
        """Calcula o valor total projetado do aluguel."""
        return Decimal(self.total_days) * self.daily_rate

    def is_expiring_on(self, target_date: date) -> bool:
        """Verifica se o aluguel encerra em uma data específica."""
        return self.status == RentalStatus.ACTIVE and self.end_date == target_date

    def finish(self, return_date: date) -> None:
        self.end_date = return_date
        self.status = RentalStatus.FINISHED

    def cancel(self) -> None:
        self.status = RentalStatus.CANCELLED