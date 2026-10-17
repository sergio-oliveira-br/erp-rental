# backend/src/domain/use_cases/rental/update_payment_status.py

import uuid
from src.domain.entities.rental import Rental, PaymentStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.ports.rental_repository import RentalRepositoryPort


class UpdatePaymentStatusUseCase:
    def __init__(self, rental_repo: RentalRepositoryPort):
        self.rental_repo = rental_repo

    def execute(self, rental_id: uuid.UUID, owner_id: uuid.UUID, payment_status: PaymentStatus) -> Rental:
        # Busca a locação validando o ID e o Tenant simultaneamente
        rental = self.rental_repo.get_by_id(rental_id, owner_id=owner_id)
        if not rental:
            raise EntityNotFoundException("Locação não encontrada.")

        rental.payment_status = payment_status

        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(rental.id, "PAGAMENTO ATUALIZADO",
                                           f"Status de pagamento alterado para {payment_status}.")

        return self.rental_repo.update(rental)