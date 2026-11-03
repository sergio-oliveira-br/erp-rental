# finance/backend/src/domain/use_cases/list_categories.py

import uuid

from src.domain.entities.category import Category
from src.domain.ports.category_repository import CategoryRepository


class ListCategoriesUseCase:
    """
    Caso de uso responsável pela listagem de categorias
    pertencentes ao proprietário autenticado.
    """

    def __init__(self, category_repository: CategoryRepository):
        # Recebe o repositório através de injeção de dependência.
        self.category_repository = category_repository

    def execute(
        self,
        owner_id: uuid.UUID,
        active_only: bool = True,
    ) -> list[Category]:
        """
        Lista as categorias de um proprietário.

        Args:
            owner_id: Identificador do proprietário autenticado.
            active_only: Quando True, devolve apenas categorias ativas.

        Returns:
            list[Category]: Lista de categorias encontradas.
        """

        # Delega a consulta ao repositório,
        # garantindo que a pesquisa é limitada ao proprietário.
        return self.category_repository.list_by_owner(
            owner_id=owner_id,
            active_only=active_only,
        )
