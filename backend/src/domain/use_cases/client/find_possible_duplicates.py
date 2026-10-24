
import uuid
from typing import List

from src.domain.entities.possible_duplicate import PossibleDuplicate
from src.domain.ports.client_repository import ClientRepositoryPort
from src.domain.services.name_similarity import (
    calculate_name_similarity,
    are_names_similar,
)


class FindPossibleDuplicatesUseCase:
    def __init__(self, client_repo: ClientRepositoryPort):
        self.client_repo = client_repo

    def execute(self, name: str, owner_id: uuid.UUID, threshold: float = 0.75) -> List[PossibleDuplicate]:
        if not name or not name.strip():
            return []

        clients = self.client_repo.list_all(owner_id=owner_id, is_active=None)

        matches: List[PossibleDuplicate] = []

        for client in clients:
            similarity = calculate_name_similarity(name, client.name)

            if are_names_similar(name, client.name, threshold):
                matches.append(
                    PossibleDuplicate(id=client.id, name=client.name, phone=client.phone, similarity=round(similarity, 2)))

        return sorted(
            matches,
            key=lambda item: item.similarity,
            reverse=True,
        )
