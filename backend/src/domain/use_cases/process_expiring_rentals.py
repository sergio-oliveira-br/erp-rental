# backend/src/domain/use_cases/process_expiring_rentals.py

from datetime import date
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

    def execute(self, target_date: date) -> int:
        expiring_rentals = self.rental_repo.list_expiring_on(target_date)
        notifications_sent = 0

        for rental in expiring_rentals:
            # Notifica apenas se a flag pontual do contrato de aluguel estiver ativa
            if not rental.enable_sms_notification:
                continue

            client = self.client_repo.get_by_id(rental.client_id)
            material = self.material_repo.get_by_id(rental.material_id)

            if client and material:
                message = (
                    f"Ola {client.name}, lembramos que o aluguel do equipamento "
                    f"'{material.name}' encerra em {rental.end_date.strftime('%d/%m/%Y')}."
                )
                success = self.notifier.send_sms(client.phone, message)
                if success:
                    notifications_sent += 1

        return notifications_sent