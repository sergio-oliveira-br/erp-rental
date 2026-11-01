# finance/backend/src/infrastructure/db/models/__init__.py

from src.infrastructure.db.models.category import CategoryTable
from src.infrastructure.db.models.expense import ExpenseTable

__all__ = ["CategoryTable",
           "ExpenseTable"]