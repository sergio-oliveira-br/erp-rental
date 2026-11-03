# finance/backend/src/domain/ports/expense_repository.py

from abc import ABC, abstractmethod
from datetime import date
from typing import Optional
import uuid

from src.domain.entities.expense import Expense


class ExpenseRepository(ABC):
    """
    Contrato para operações de persistência de despesas.

    Define as operações disponíveis para a aplicação,
    sem depender da implementação da base de dados.
    """

    @abstractmethod
    def save(self, expense: Expense) -> Expense:
        """
        Guarda uma nova despesa ou atualiza uma existente.

        Returns:
            Expense: Despesa persistida.
        """
        pass

    @abstractmethod
    def get_by_id(
        self,
        expense_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Optional[Expense]:
        """
        Obtém uma despesa pelo identificador,
        garantindo que pertence ao proprietário indicado.
        """
        pass

    @abstractmethod
    def list_by_owner(
        self,
        owner_id: uuid.UUID,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        category_id: Optional[uuid.UUID] = None,
        equipment_id: Optional[uuid.UUID] = None,
    ) -> list[Expense]:
        """
        Lista as despesas de um proprietário.

        Permite aplicar filtros opcionais por:
        - Data inicial;
        - Data final;
        - Categoria;
        - Equipamento.

        Sem filtros, devolve todas as despesas do proprietário.
        """
        pass