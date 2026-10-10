# backend/src/domain/use_cases/rental/reactivate_rental.py

import uuid
from src.domain.entities.rental import Rental, RentalStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.ports.rental_repository import RentalRepositoryPort


class ReactivateRentalUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort):
        self.rental_repo = rental_repo

    def execute(self, rental_id: uuid.UUID) -> Rental:
        rental = self.rental_repo.get_by_id(rental_id)
        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        if rental.status == RentalStatus.ACTIVE:
            raise DomainException("Esta locação já está ativa.")

        rental.reactivate()
        return self.rental_repo.update(rental)