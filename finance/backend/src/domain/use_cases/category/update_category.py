# finance/backend/src/domain/use_cases/update_category.py

from typing import Optional
import uuid

from src.domain.entities.category import Category
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.category_repository import CategoryRepository


class UpdateCategoryUseCase:
    """
    Caso de uso responsável por atualizar uma categoria.
    """

    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    def execute(
        self,
        category_id: uuid.UUID,
        owner_id: uuid.UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Category:
        """
        Atualiza o nome e/ou a descrição de uma categoria.

        Campos não informados permanecem inalterados.
        """

        category = self.category_repository.get_by_id(
            category_id=category_id,
            owner_id=owner_id,
        )

        if category is None:
            raise EntityNotFoundException("Categoria não encontrada.")

        if name is not None:
            category.rename(name)

        if description is not None:
            category.update_description(description)

        return self.category_repository.save(category)
