# finance/backend/src/domain/use_cases/create_category.py

from typing import Optional
import uuid

from src.domain.entities.category import Category
from src.domain.ports.category_repository import CategoryRepository
from src.domain.services.name_normalizer import normalize_name


class CreateCategoryUseCase:
    """
    Caso de uso responsável pela criação de categorias.

    Normaliza o nome, cria a entidade e solicita
    ao repositório que a persista.
    """

    def __init__(self, category_repository: CategoryRepository):
        # Recebe o repositório através de injeção de dependência.
        self.category_repository = category_repository

    def execute(
        self,
        owner_id: uuid.UUID,
        name: str,
        description: Optional[str] = None,
    ) -> Category:
        """
        Cria uma categoria para o proprietário indicado.

        Args:
            owner_id: Identificador do proprietário autenticado.
            name: Nome da categoria.
            description: Descrição opcional.

        Returns:
            Category: Categoria criada e persistida.
        """

        # Normaliza o nome para armazenamento e apresentação.
        normalized_name = normalize_name(name)

        # Cria a entidade e aplica as validações do domínio.
        category = Category(
            owner_id=owner_id,
            name=normalized_name,
            description=description,
        )

        # Solicita ao repositório que persista a categoria.
        return self.category_repository.save(category)