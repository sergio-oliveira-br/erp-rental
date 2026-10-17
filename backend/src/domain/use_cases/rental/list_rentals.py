# backend/src/domain/use_cases/rental/list_rentals.py

from typing import List, Optional
import uuid
from src.domain.entities.rental import Rental, RentalStatus
from src.domain.ports.rental_repository import RentalRepositoryPort


class ListRentalsUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort) -> None:
        self.rental_repo = rental_repo

    def execute(self, owner_id: uuid.UUID, status: Optional[RentalStatus] = None) -> List[Rental]:
        # Lista estritamente as locações pertencentes ao tenant logado
        return self.rental_repo.list_all(owner_id=owner_id, status=status)