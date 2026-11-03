# finance/backend/src/domain/ports/category_repository.py

from abc import ABC, abstractmethod
from typing import Optional
import uuid

from src.domain.entities.category import Category


class CategoryRepository(ABC):
    """
    Contrato para operações de persistência de categorias.

    Define o que a infraestrutura deve implementar,
    sem depender de SQLModel ou PostgreSQL.
    """

    @abstractmethod
    def save(self, category: Category) -> Category:
        """
        Guarda uma nova categoria ou atualiza uma existente.

        Returns:
            Category: Categoria persistida.
        """
        pass

    @abstractmethod
    def get_by_id(
        self,
        category_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Optional[Category]:
        """
        Obtém uma categoria pelo identificador,
        garantindo que pertence ao proprietário indicado.
        """
        pass

    @abstractmethod
    def get_by_name(
        self,
        comparison_name: str,
        owner_id: uuid.UUID,
    ) -> Optional[Category]:
        """
        Procura uma categoria pela chave normalizada de comparação,
        dentro do proprietário indicado.
        """
        pass

    @abstractmethod
    def list_by_owner(
        self,
        owner_id: uuid.UUID,
        active_only: bool = True,
    ) -> list[Category]:
        """
        Lista as categorias de um proprietário.

        Por defeito, apresenta apenas categorias ativas.
        """
        pass
