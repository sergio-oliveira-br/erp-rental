# backend/src/domain/use_cases/rental/update_rental.py


import uuid
from datetime import date
from typing import Optional

from src.domain.entities.rental import Rental
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.ports.rental_repository import RentalRepositoryPort


class UpdateRentalUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort):
        self.rental_repo = rental_repo

    def execute(
        self,
        rental_id: uuid.UUID,
        owner_id: uuid.UUID,
        delivery_address: Optional[str] = None,
        notes: Optional[str] = None,
        end_date: Optional[date] = None,
        quantity: Optional[int] = None,
    ) -> Rental:
        # Busca a locação validando o ID e o proprietário.
        rental = self.rental_repo.get_by_id(
            rental_id,
            owner_id=owner_id,
        )

        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        if delivery_address is not None:
            rental.delivery_address = delivery_address

        if notes is not None:
            rental.notes = notes

        if end_date is not None:
            if end_date < rental.start_date:
                raise DomainException(
                    "A data final não pode ser anterior à data inicial."
                )
            rental.end_date = end_date

        if quantity is not None:
            if quantity < 1:
                raise DomainException(
                    "A quantidade deve ser maior ou igual a 1."
                )
            rental.quantity = quantity

        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(
                rental.id,
                "ATUALIZADO",
                (
                    "Dados operacionais (endereço/notas/prazo/quantidade) "
                    "atualizados."
                ),
            )

        return self.rental_repo.update(rental)