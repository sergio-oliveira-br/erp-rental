# backend/src/domain/entities/client.py

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid

@dataclass
class Client:
    name: str
    phone: str
    address: str
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def inactivate(self) -> None:
        """Aplica a regra de Soft Delete para proteção de integridade."""
        self.is_active = False