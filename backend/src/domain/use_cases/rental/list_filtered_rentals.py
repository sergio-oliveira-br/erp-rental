# backend/src/domain/use_cases/rental/list_filtered_rentals.py

from datetime import date
from typing import List, Optional
from src.domain.entities.rental import Rental
from src.domain.ports.rental_repository import RentalRepositoryPort

class ListFilteredRentalsUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort):
        self.rental_repo = rental_repo

    def execute(self, page: int = 1, limit: int = 10, search: Optional[str] = None, status: Optional[str] = None,
                payment_status: Optional[str] = None, start_date_from: Optional[date] = None,
                start_date_to: Optional[date] = None,) -> List[Rental]:

        # Garante limites válidos de paginação
        page = max(1, page)
        limit = max(1, min(limit, 100)) # Limite máximo de 100 por página para segurança

        return self.rental_repo.get_filtered_rentals(
            page=page,
            limit=limit,
            search=search,
            status=status,
            payment_status=payment_status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
        )