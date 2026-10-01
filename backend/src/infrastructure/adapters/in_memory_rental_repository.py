# backend/src/infrastructure/adapters/in_memory_rental_repository.py

from datetime import date
from typing import Dict, List, Optional
import uuid
from src.domain.entities.rental import Rental
from src.domain.ports.rental_repository import RentalRepositoryPort

class InMemoryRentalRepository(RentalRepositoryPort):
    def __init__(self) -> None:
        self._rentals: Dict[uuid.UUID, Rental] = {}

    def save(self, rental: Rental) -> Rental:
        self._rentals[rental.id] = rental
        return rental

    def get_by_id(self, rental_id: uuid.UUID) -> Optional[Rental]:
        return self._rentals.get(rental_id)

    def list_by_client(self, client_id: uuid.UUID) -> List[Rental]:
        return [r for r in self._rentals.values() if r.client_id == client_id]

    def list_expiring_on(self, target_date: date) -> List[Rental]:
        return [r for r in self._rentals.values() if r.is_expiring_on(target_date)]

    def update(self, rental: Rental) -> Rental:
        self._rentals[rental.id] = rental
        return rental