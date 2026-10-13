# backend/src/domain/entities/user.py

from dataclasses import dataclass, field
from datetime import datetime, timezone
import uuid

@dataclass
class User:
    username: str
    hashed_password: str
    phone_number: str
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def activate(self) -> None:
        self.is_active = True

    def inactivate(self) -> None:
        self.is_active = False