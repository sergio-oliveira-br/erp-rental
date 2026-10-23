# backend/src/domain/use_cases/rental/list_filtered_rentals.py

from datetime import date
from typing import Dict, Any, Optional
import uuid
from src.domain.ports.rental_repository import RentalRepositoryPort

class ListFilteredRentalsUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort):
        self.rental_repo = rental_repo

    def execute(
        self,
        owner_id: uuid.UUID,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        payment_status: Optional[str] = None,
        start_date_from: Optional[date] = None,
        start_date_to: Optional[date] = None,
    ) -> Dict[str, Any]:

        page = max(1, page)
        limit = max(1, min(limit, 100000))

        items = self.rental_repo.get_filtered_rentals(
            owner_id=owner_id,
            page=page,
            limit=limit,
            search=search,
            status=status,
            payment_status=payment_status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
        )

        total = self.rental_repo.count_filtered_rentals(
            owner_id=owner_id,
            search=search,
            status=status,
            payment_status=payment_status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit
        }