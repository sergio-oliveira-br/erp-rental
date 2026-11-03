# finance/backend/src/domain/entities/expense.py

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
import uuid

from src.domain.exceptions.domain_exceptions import BusinessRuleException


@dataclass
class Expense:
    """
    Entidade de domínio que representa uma despesa efetivamente realizada.

    Cada instância corresponde a uma única despesa.
    Não depende do SQLModel nem da base de dados.
    """

    # Identificador do proprietário da despesa.
    owner_id: uuid.UUID

    # Descrição obrigatória.
    description: str

    # Valor monetário da despesa.
    amount: Decimal

    # Categoria à qual a despesa pertence.
    category_id: uuid.UUID

    # Data efetiva da despesa.
    expense_date: date = field(default_factory=date.today)

    # Identificador opcional de equipamento pertencente ao ERP.
    equipment_id: Optional[uuid.UUID] = None

    # Observações adicionais.
    notes: Optional[str] = None

    # Identificador único da despesa.
    id: uuid.UUID = field(default_factory=uuid.uuid4)

    # Datas de controle.
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def __post_init__(self):
        """
        Valida os dados essenciais após a criação da entidade.
        """

        self.description = self.description.strip()

        if not self.description:
            raise BusinessRuleException(
                "A descrição da despesa é obrigatória."
            )

        if len(self.description) > 200:
            raise BusinessRuleException(
                "A descrição não pode ultrapassar 200 caracteres."
            )

        # Normaliza o valor para Decimal.
        if not isinstance(self.amount, Decimal):
            raise BusinessRuleException(
                "O valor da despesa deve ser informado como Decimal."
            )

        if not self.amount.is_finite():
            raise BusinessRuleException(
                "O valor da despesa deve ser um número válido."
            )

        if self.amount <= 0:
            raise BusinessRuleException(
                "O valor da despesa deve ser superior a zero."
            )

        # O modelo da base de dados suporta duas casas decimais.
        if self.amount.as_tuple().exponent < -2:
            raise BusinessRuleException(
                "O valor da despesa não pode ter mais de duas casas decimais."
            )

        # Limite correspondente ao NUMERIC(12, 2) da PostgreSQL.
        if self.amount >= Decimal("10000000000"):
            raise BusinessRuleException(
                "O valor da despesa ultrapassa o limite permitido."
            )

        if self.notes is not None:
            self.notes = self.notes.strip() or None

            if self.notes and len(self.notes) > 1000:
                raise BusinessRuleException(
                    "As observações não podem ultrapassar 1000 caracteres."
                )

    def update_description(self, new_description: str) -> None:
        """
        Atualiza a descrição da despesa.
        """

        new_description = new_description.strip()

        if not new_description:
            raise BusinessRuleException(
                "A descrição da despesa é obrigatória."
            )

        if len(new_description) > 200:
            raise BusinessRuleException(
                "A descrição não pode ultrapassar 200 caracteres."
            )

        self.description = new_description
        self.updated_at = datetime.now(timezone.utc)

    def update_amount(self, new_amount: Decimal) -> None:
        """
        Atualiza o valor da despesa respeitando as regras monetárias.
        """

        if not isinstance(new_amount, Decimal):
            raise BusinessRuleException(
                "O valor da despesa deve ser informado como Decimal."
            )

        if not new_amount.is_finite() or new_amount <= 0:
            raise BusinessRuleException(
                "O valor da despesa deve ser um número válido e superior a zero."
            )

        if new_amount.as_tuple().exponent < -2:
            raise BusinessRuleException(
                "O valor da despesa não pode ter mais de duas casas decimais."
            )

        if new_amount >= Decimal("10000000000"):
            raise BusinessRuleException(
                "O valor da despesa ultrapassa o limite permitido."
            )

        self.amount = new_amount
        self.updated_at = datetime.now(timezone.utc)
