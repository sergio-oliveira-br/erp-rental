
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
        end_date_from: Optional[date] = None,
        end_date_to: Optional[date] = None,
        order_by_end_date: bool = False,
    ) -> Dict[str, Any]:

        page = max(1, page)
        limit = max(1, min(limit, 100))

        filters = {
            "owner_id": owner_id,
            "search": search,
            "status": status,
            "payment_status": payment_status,
            "start_date_from": start_date_from,
            "start_date_to": start_date_to,
            "end_date_from": end_date_from,
            "end_date_to": end_date_to,
        }

        items = self.rental_repo.get_filtered_rentals(
            **filters,
            page=page,
            limit=limit,
            order_by_end_date=order_by_end_date,
        )

        total = self.rental_repo.count_filtered_rentals(**filters)

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }