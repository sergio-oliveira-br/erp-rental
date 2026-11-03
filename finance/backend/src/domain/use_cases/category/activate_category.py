# finance/backend/src/domain/use_cases/activate_category.py

import uuid

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.category_repository import CategoryRepository


class ActivateCategoryUseCase:
    """
    Caso de uso responsável por reativar uma categoria.
    """

    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    def execute(
        self,
        category_id: uuid.UUID,
        owner_id: uuid.UUID,
    ):
        """
        Reativa uma categoria pertencente ao proprietário.

        Raises:
            EntityNotFoundException: Se a categoria não existir
            ou não pertencer ao proprietário.
        """

        category = self.category_repository.get_by_id(
            category_id=category_id,
            owner_id=owner_id,
        )

        if category is None:
            raise EntityNotFoundException("Categoria não encontrada.")

        # A entidade controla a alteração do estado.
        category.activate()

        # Persiste a categoria reativada.
        return self.category_repository.save(category)
