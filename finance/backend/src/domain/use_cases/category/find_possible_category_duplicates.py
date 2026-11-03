# finance/backend/src/domain/use_cases/find_possible_category_duplicates.py

import uuid

from src.domain.entities.possible_category_duplicate import (
    PossibleCategoryDuplicate,
)
from src.domain.ports.category_repository import CategoryRepository
from src.domain.services.name_similarity import (
    calculate_name_similarity,
)


class FindPossibleCategoryDuplicatesUseCase:
    """
    Procura categorias que possam ser semelhantes
    ao nome introduzido pelo utilizador.

    A pesquisa é exclusivamente informativa:
    não impede a criação de categorias.
    """

    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    def execute(
        self,
        name: str,
        owner_id: uuid.UUID,
        threshold: float = 0.85,
    ) -> list[PossibleCategoryDuplicate]:

        if not name or not name.strip():
            return []

        if not 0 <= threshold <= 1:
            raise ValueError("O threshold deve estar entre 0 e 1.")

        # Consulta todas as categorias do proprietário,
        # incluindo as inativas.
        categories = self.category_repository.list_by_owner(
            owner_id=owner_id,
            active_only=False,
        )

        matches = []

        for category in categories:

            # Calcula a similaridade apenas uma vez.
            similarity = calculate_name_similarity(
                name,
                category.name,
            )

            # Utiliza o resultado calculado para verificar
            # se a categoria deve ser apresentada como sugestão.
            if similarity >= threshold:
                matches.append(
                    PossibleCategoryDuplicate(
                        id=category.id,
                        name=category.name,
                        similarity=round(similarity, 2),
                    )
                )

        # Apresenta primeiro as categorias mais semelhantes.
        return sorted(
            matches,
            key=lambda item: item.similarity,
            reverse=True,
        )