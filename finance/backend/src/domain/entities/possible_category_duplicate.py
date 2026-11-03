# finance/backend/src/domain/entities/possible_category_duplicate.py


from dataclasses import dataclass
import uuid


@dataclass(frozen=True)
class PossibleCategoryDuplicate:
    """
    Representa uma categoria que pode ser semelhante
    à categoria que o utilizador pretende criar.
    """

    id: uuid.UUID
    name: str
    similarity: float
