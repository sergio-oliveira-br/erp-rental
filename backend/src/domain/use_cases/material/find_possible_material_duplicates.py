# backend/src/domain/use_cases/material/find_possible_material_duplicates.py


import uuid

from typing import List

from src.domain.entities.possible_material_duplicate import PossibleMaterialDuplicate
from src.domain.ports.material_repository import MaterialRepositoryPort
from src.domain.services.name_similarity import (
    calculate_name_similarity,
    are_names_similar,
)


class FindPossibleMaterialDuplicatesUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort):
        self.material_repo = material_repo

    def execute(self, name: str,owner_id: uuid.UUID, threshold: float = 0.75) -> List[PossibleMaterialDuplicate]:
        if not name or not name.strip():
            return []

        materials = self.material_repo.list_all(owner_id=owner_id, is_active=None)

        matches: List[PossibleMaterialDuplicate] = []

        for material in materials:
            similarity = calculate_name_similarity(name, material.name)

            if are_names_similar(name, material.name, threshold):
                matches.append(PossibleMaterialDuplicate(id=material.id, name=material.name, similarity=round(similarity, 2)))

        return sorted(matches, key=lambda item: item.similarity, reverse=True)