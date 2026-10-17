# backend/src/domain/use_cases/rental/process_expiring_rentals.py

from datetime import date
import uuid
from src.domain.ports.rental_repository import RentalRepositoryPort
from src.domain.ports.client_repository import ClientRepositoryPort
from src.domain.ports.material_repository import MaterialRepositoryPort
from src.domain.ports.notifier import NotifierPort

class ProcessExpiringRentalsUseCase:
    def __init__(
        self,
        rental_repo: RentalRepositoryPort,
        client_repo: ClientRepositoryPort,
        material_repo: MaterialRepositoryPort,
        notifier: NotifierPort
    ):
        self.rental_repo = rental_repo
        self.client_repo = client_repo
        self.material_repo = material_repo
        self.notifier = notifier

    def execute(self, target_date: date, owner_id: uuid.UUID) -> int:
        # 1. Lista locações vencendo estritamente para o tenant informado
        expiring_rentals = self.rental_repo.list_expiring_on(target_date, owner_id=owner_id)
        notifications_sent = 0

        for rental in expiring_rentals:
            # Notifica apenas se a flag pontual do contrato de aluguel estiver ativa
            if not rental.enable_sms_notification:
                continue

            # 2. Busca cliente e material validados pelo mesmo owner_id
            client = self.client_repo.get_by_id(rental.client_id, owner_id=owner_id)
            material = self.material_repo.get_by_id(rental.material_id, owner_id=owner_id)

            if client and material and client.phone:
                message = (
                    f"Ola {client.name}, lembramos que o aluguel do equipamento "
                    f"'{material.name}' encerra em {rental.end_date.strftime('%d/%m/%Y')}."
                )
                success = self.notifier.send_sms(client.phone, message)
                if success:
                    notifications_sent += 1

        return notifications_sent