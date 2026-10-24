# backend/src/domain/entities/possible_material_duplicate.py

from dataclasses import dataclass
import uuid


@dataclass
class PossibleMaterialDuplicate:
    id: uuid.UUID
    name: str
    similarity: float
