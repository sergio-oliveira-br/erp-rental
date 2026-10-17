# backend/src/domain/use_cases/rental/finish_rental.py

from datetime import date
from typing import Optional
import uuid
from src.domain.entities.rental import Rental, RentalStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.ports.rental_repository import RentalRepositoryPort


class FinishRentalUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort) -> None:
        self.rental_repo = rental_repo

    def execute(self, rental_id: uuid.UUID, owner_id: uuid.UUID, return_date: Optional[date] = None) -> Rental:
        # Busca a locação validando o ID e o Tenant simultaneamente
        rental = self.rental_repo.get_by_id(rental_id, owner_id=owner_id)
        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        if rental.status != RentalStatus.ACTIVE:
            raise DomainException("Apenas locações ativas podem ser finalizadas.")

        effective_return_date = return_date or date.today()
        rental.finish(return_date=effective_return_date)

        # Garante segurança caso o repositório suporte auditoria
        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(rental.id, "FINALIZADO", "Locação finalizada/equipamento devolvido.")

        return self.rental_repo.update(rental)