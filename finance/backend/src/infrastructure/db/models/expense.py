# finance/backend/src/infrastructure/db/models/expense.py

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel


class ExpenseTable(SQLModel, table=True):
    """
    Representa uma despesa efetivamente realizada.

    Cada registo corresponde a uma única linha de despesa.
    """

    __tablename__ = "expenses"

    # Identificador único da despesa.
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )

    # Identificador do proprietário, obtido através
    # da identidade autenticada pelo ERP.
    owner_id: uuid.UUID = Field(
        index=True,
    )

    # Descrição obrigatória da despesa.
    description: str = Field(
        min_length=1,
        max_length=200,
    )

    # Valor monetário. Decimal evita imprecisões
    # associadas à utilização de float.
    amount: Decimal = Field(
        max_digits=12,
        decimal_places=2,
        gt=0,
    )

    # Categoria obrigatória, relacionada com categories.id.
    category_id: uuid.UUID = Field(
        foreign_key="categories.id",
        index=True,
    )

    # Data efetiva em que a despesa ocorreu.
    # Por defeito, assume a data atual.
    expense_date: date = Field(
        default_factory=date.today,
        index=True,
    )

    # Identificador opcional de um equipamento do ERP.
    # Não existe FK porque o equipamento pertence
    # à base de dados independente do ERP.
    equipment_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
    )

    # Observações adicionais, não obrigatórias.
    notes: Optional[str] = Field(
        default=None,
        max_length=1000,
    )

    # Datas de controlo do registo.
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
