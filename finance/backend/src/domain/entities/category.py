# finance/backend/src/domain/entities/category.py

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid

from src.domain.exceptions.domain_exceptions import BusinessRuleException


@dataclass
class Category:
    """
    Entidade de domínio que representa uma categoria de despesas.

    Esta classe contém as regras de negócio da categoria,
    independentemente da tecnologia utilizada na base de dados.
    """

    # Identificador do proprietário da categoria.
    owner_id: uuid.UUID

    # Nome obrigatório da categoria.
    name: str

    # Identificador único da categoria.
    id: uuid.UUID = field(default_factory=uuid.uuid4)

    # Descrição opcional.
    description: Optional[str] = None

    # Permite desativar categorias sem as eliminar.
    is_active: bool = True

    # Datas de controlo.
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    def __post_init__(self):
        """
        Executado automaticamente após a criação da entidade.
        """

        self.name = self.name.strip()

        if not self.name:
            raise BusinessRuleException(
                "O nome da categoria é obrigatório."
            )

        if len(self.name) > 100:
            raise BusinessRuleException(
                "O nome da categoria não pode ultrapassar 100 caracteres."
            )

        if self.description is not None:
            self.description = self.description.strip() or None

            if self.description and len(self.description) > 500:
                raise BusinessRuleException(
                    "A descrição não pode ultrapassar 500 caracteres."
                )

    def rename(self, new_name: str) -> None:
        """
        Altera o nome da categoria após validar o novo valor.
        """

        new_name = new_name.strip()

        if not new_name:
            raise BusinessRuleException(
                "O nome da categoria é obrigatório."
            )

        if len(new_name) > 100:
            raise BusinessRuleException(
                "O nome da categoria não pode ultrapassar 100 caracteres."
            )

        self.name = new_name
        self.updated_at = datetime.now(timezone.utc)

    def deactivate(self) -> None:
        """
        Desativa a categoria sem eliminar o respetivo histórico.
        """

        self.is_active = False
        self.updated_at = datetime.now(timezone.utc)

    def activate(self) -> None:
        """
        Reativa uma categoria anteriormente desativada.
        """

        self.is_active = True
        self.updated_at = datetime.now(timezone.utc)


    def update_description(self, new_description: Optional[str]) -> None:
        """
        Atualiza a descrição da categoria.

        Permite remover a descrição enviando None ou texto vazio.
        """

        if new_description is not None:
            new_description = new_description.strip() or None

            if new_description and len(new_description) > 500:
                raise BusinessRuleException(
                    "A descrição não pode ultrapassar 500 caracteres."
                )

        self.description = new_description
        self.updated_at = datetime.now(timezone.utc)

