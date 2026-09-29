# backend/src/domain/ports/rental_repository.py

from abc import ABC, abstractmethod
from datetime import date
from typing import List, Optional
import uuid
from src.domain.entities.rental import Rental

class RentalRepositoryPort(ABC):
    @abstractmethod
    def save(self, rental: Rental) -> Rental:
        pass

    @abstractmethod
    def get_by_id(self, rental_id: uuid.UUID) -> Optional[Rental]:
        pass

    @abstractmethod
    def list_by_client(self, client_id: uuid.UUID) -> List[Rental]:
        pass

    @abstractmethod
    def list_expiring_on(self, target_date: date) -> List[Rental]:
        pass

    @abstractmethod
    def update(self, rental: Rental) -> Rental:
        pass