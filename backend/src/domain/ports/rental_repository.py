# backend/src/domain/ports/rental_repository.py

from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional
import uuid
from src.domain.entities.rental import Rental, RentalStatus


class RentalRepositoryPort(ABC):
    @abstractmethod
    def save(self, rental: Rental) -> Rental:
        """Salva um novo contrato de locação vinculado ao seu owner_id."""
        pass

    @abstractmethod
    def get_by_id(self, rental_id: uuid.UUID, owner_id: uuid.UUID) -> Optional[Rental]:
        """Busca uma locação garantindo que ela pertence estritamente ao tenant (owner_id)."""
        pass

    @abstractmethod
    def list_by_client(self, client_id: uuid.UUID, owner_id: uuid.UUID) -> List[Rental]:
        """Lista todas as locações de um cliente, isoladas pelo owner_id."""
        pass

    @abstractmethod
    def list_expiring_on(self, target_date: date, owner_id: uuid.UUID) -> List[Rental]:
        """Lista locações vencendo em uma data alvo, filtradas por tenant."""
        pass

    @abstractmethod
    def update(self, rental: Rental) -> Rental:
        """Atualiza os dados de uma locação existente."""
        pass

    @abstractmethod
    def list_all(self, owner_id: uuid.UUID, status: Optional[RentalStatus] = None) -> List[Rental]:
        """Lista todas as locações do tenant, opcionalmente filtrando por status."""
        pass