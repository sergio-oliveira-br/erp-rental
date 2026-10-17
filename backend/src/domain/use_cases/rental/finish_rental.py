# backend/src/domain/use_cases/rental/finish_rental.py

import uuid
from src.domain.entities.rental import Rental, RentalStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.ports.rental_repository import RentalRepositoryPort


class FinishRentalUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort) -> None:
        self.rental_repo = rental_repo

    def execute(self, rental_id: uuid.UUID, owner_id: uuid.UUID) -> Rental:
        # Busca a locação validando o ID e o Tenant simultaneamente
        rental = self.rental_repo.get_by_id(rental_id, owner_id=owner_id)
        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        if rental.status != RentalStatus.ACTIVE:
            raise DomainException("Apenas locações ativas podem ser finalizadas.")

        # Apenas altera o status para concluído, preservando datas e valores originais do contrato
        rental.status = RentalStatus.FINISHED

        # Garante segurança caso o repositório suporte auditoria
        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(rental.id, "FINALIZADO", "Locação concluída com sucesso.")

        return self.rental_repo.update(rental)