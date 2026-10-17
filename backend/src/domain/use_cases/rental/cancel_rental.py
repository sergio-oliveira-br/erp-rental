# backend/src/domain/use_cases/rental/cancel_rental.py

import uuid
from src.domain.entities.rental import Rental, RentalStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.ports.rental_repository import RentalRepositoryPort

class CancelRentalUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort) -> None:
        self.rental_repo = rental_repo

    def execute(self, rental_id: uuid.UUID, owner_id: uuid.UUID) -> Rental:
        rental = self.rental_repo.get_by_id(rental_id, owner_id=owner_id)
        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        if rental.status == RentalStatus.CANCELLED:
            raise DomainException("Esta locação já está cancelada.")

        rental.cancel()

        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(rental.id, "CANCELADO", "Contrato de locação cancelado.")

        return self.rental_repo.update(rental)