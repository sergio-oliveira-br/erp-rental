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
    owner_id: uuid.UUID = field(default_factory=uuid.uuid4) 
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        # Garante que se o owner_id não for fornecido na criação, ele assume o ID do próprio usuário (Tenant Owner)
        if not self.owner_id and self.id:
            self.owner_id = self.id

    def activate(self) -> None:
        self.is_active = True

    def inactivate(self) -> None:
        self.is_active = False