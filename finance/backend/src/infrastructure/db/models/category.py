# finance/backend/src/infrastructure/db/models/category.py

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel


class CategoryTable(SQLModel, table=True):
    """
    Representa uma categoria de despesas do Finance.

    Cada categoria pertence a um proprietário (owner_id),
    cuja identidade será obtida através da integração com o ERP.
    """

    __tablename__ = "categories"

    # Identificador único da categoria.
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    # Identificador do proprietário no ERP.
    # Não existe FK porque o ERP e o Finance possuem bancos separados.
    owner_id: uuid.UUID = Field(index=True)

    # Nome da categoria.
    name: str = Field(index=True, max_length=100)

    # Descrição opcional.
    description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    # Categorias utilizadas não serão excluídas;
    # poderão ser desativadas.
    is_active: bool = Field(default=True)

    # Data de criação em UTC.
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    # Data da última atualização.
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )