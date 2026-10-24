# backend/src/domain/entities/possible_client_duplicate.py

from dataclasses import dataclass
from typing import Optional
import uuid


@dataclass(frozen=True)
class PossibleDuplicate:
    id: uuid.UUID
    name: str
    similarity: float
    phone: Optional[str] = None
