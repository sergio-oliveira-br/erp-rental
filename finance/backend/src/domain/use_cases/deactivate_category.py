# finance/backend/src/domain/use_cases/deactivate_category.py

import uuid

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.category_repository import CategoryRepository


class DeactivateCategoryUseCase:
    """
    Caso de uso responsável por desativar uma categoria.

    A categoria permanece armazenada no banco de dados,
    preservando o histórico de despesas associado a ela.
    """

    def __init__(self, category_repository: CategoryRepository):
        self.category_repository = category_repository

    def execute(
            self,
            category_id: uuid.UUID,
            owner_id: uuid.UUID,
    ):
        """
        Desativa uma categoria pertencente ao proprietário.

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

        # A regra de atualização do estado fica na entidade.
        category.deactivate()

        # Persiste a alteração.
        return self.category_repository.save(category)
