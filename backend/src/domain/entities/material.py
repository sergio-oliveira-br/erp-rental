# backend/src/domain/entities/material.py

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
import uuid

@dataclass
class Material:
    name: str
    daily_rate: Decimal
    description: Optional[str] = None
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    is_available: bool = True
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def set_availability(self, status: bool) -> None:
        self.is_available = status

    def inactivate(self) -> None:
        self.is_active = False