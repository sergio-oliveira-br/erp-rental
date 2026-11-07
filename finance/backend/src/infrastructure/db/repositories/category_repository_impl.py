# finance/backend/src/infrastructure/db/repositories/category_repository_impl.py

import uuid
from typing import Optional

from sqlmodel import Session, select

from src.domain.entities.category import Category
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.category_repository import CategoryRepository
from src.domain.services.name_normalizer import normalize_name
from src.infrastructure.db.models import CategoryTable


class CategoryRepositoryImpl(CategoryRepository):
    """
    Implementação PostgreSQL do repositório de categorias.
    """

    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: CategoryTable) -> Category:
        """
        Converte um modelo de persistência em entidade de domínio.
        """

        return Category(
            id=model.id,
            owner_id=model.owner_id,
            name=model.name,
            description=model.description,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Category) -> CategoryTable:
        """
        Converte uma entidade de domínio em modelo de persistência.
        """

        return CategoryTable(
            id=entity.id,
            owner_id=entity.owner_id,
            name=entity.name,
            description=entity.description,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def save(self, category: Category) -> Category:
        """
        Persiste uma nova categoria.
        """

        model = self._to_model(category)

        self.session.add(model)

        try:
            self.session.commit()
            self.session.refresh(model)
        except Exception:
            self.session.rollback()
            raise

        return self._to_entity(model)

    def update(self, category: Category) -> Category:
        """
        Atualiza uma categoria existente.

        A consulta exige o ID e o proprietário para impedir
        alterações em categorias de outros usuários.
        """

        statement = select(CategoryTable).where(
            CategoryTable.id == category.id,
            CategoryTable.owner_id == category.owner_id,
        )

        model = self.session.exec(statement).first()

        if model is None:
            raise EntityNotFoundException("Categoria não encontrada.")

        # Atualiza o registro já associado à sessão.
        model.name = category.name
        model.description = category.description
        model.is_active = category.is_active
        model.updated_at = category.updated_at

        try:
            self.session.commit()
            self.session.refresh(model)
        except Exception:
            self.session.rollback()
            raise

        return self._to_entity(model)

    def get_by_id(
        self,
        category_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Optional[Category]:
        """
        Busca uma categoria pelo ID e proprietário.
        """

        statement = select(CategoryTable).where(
            CategoryTable.id == category_id,
            CategoryTable.owner_id == owner_id,
        )

        model = self.session.exec(statement).first()

        return self._to_entity(model) if model else None

    def get_by_name(
        self,
        name: str,
        owner_id: uuid.UUID,
    ) -> Optional[Category]:
        """
        Busca uma categoria pelo nome exato.

        O nome informado é normalizado antes da consulta,
        seguindo o padrão de armazenamento das categorias.
        """

        normalized_name = normalize_name(name)

        statement = select(CategoryTable).where(
            CategoryTable.owner_id == owner_id,
            CategoryTable.name == normalized_name,
        )

        model = self.session.exec(statement).first()

        return self._to_entity(model) if model else None

    def list_by_owner(
        self,
        owner_id: uuid.UUID,
        active_only: bool = True,
        search_term: Optional[str] = None,
    ) -> list[Category]:
        """
        Lista categorias de um proprietário.

        Permite filtrar por situação e pesquisar parte do nome
        diretamente no PostgreSQL.
        """

        statement = select(CategoryTable).where(
            CategoryTable.owner_id == owner_id
        )

        if active_only:
            statement = statement.where(
                CategoryTable.is_active.is_(True)
            )

        if search_term and search_term.strip():
            search = search_term.strip()

            statement = statement.where(
                CategoryTable.name.ilike(f"%{search}%")
            )

        statement = statement.order_by(CategoryTable.name)

        results = self.session.exec(statement).all()

        return [
            self._to_entity(model)
            for model in results
        ]
