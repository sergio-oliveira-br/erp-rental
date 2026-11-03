# finance/backend/src/domain/use_cases/get_category.py

import uuid

from src.domain.entities.category import Category
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.category_repository import CategoryRepository


class GetCategoryUseCase:
    """
    Caso de uso responsável por buscar uma categoria específica
    pertencente ao proprietário informado.
    """

    def __init__(self, category_repository: CategoryRepository):
        # Recebe o repositório por injeção de dependência.
        self.category_repository = category_repository

    def execute(
        self,
        category_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Category:
        """
        Busca uma categoria pelo ID, respeitando a propriedade.

        Args:
            category_id: Identificador da categoria.
            owner_id: Identificador do proprietário autenticado.

        Returns:
            Category: Categoria encontrada.

        Raises:
            EntityNotFoundException: Se a categoria não existir
            ou não pertencer ao proprietário informado.
        """

        category = self.category_repository.get_by_id(
            category_id=category_id,
            owner_id=owner_id,
        )

        # Não diferenciamos categoria inexistente de categoria
        # pertencente a outro usuário, evitando expor informações.
        if category is None:
            raise EntityNotFoundException("Categoria não encontrada.")

        return category
