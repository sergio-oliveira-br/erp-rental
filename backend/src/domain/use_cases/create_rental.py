# backend/src/domain/use_cases/create_rental.py

from datetime import date
from typing import Optional
import uuid
from src.domain.entities.rental import Rental
from src.domain.ports.client_repository import ClientRepositoryPort
from src.domain.ports.material_repository import MaterialRepositoryPort
from src.domain.ports.rental_repository import RentalRepositoryPort

class CreateRentalUseCase:
    def __init__(
        self,
        rental_repo: RentalRepositoryPort,
        client_repo: ClientRepositoryPort,
        material_repo: MaterialRepositoryPort
    ):
        self.rental_repo = rental_repo
        self.client_repo = client_repo
        self.material_repo = material_repo

    def execute(
        self,
        client_id: uuid.UUID,
        material_id: uuid.UUID,
        start_date: date,
        end_date: date,
        delivery_address: Optional[str] = None,
        notes: Optional[str] = None,
        enable_sms_notification: bool = False
    ) -> Rental:
        # 1. Validar existencia do cliente
        client = self.client_repo.get_by_id(client_id)
        if not client or not client.is_active:
            raise ValueError("Cliente nao encontrado ou inativo.")

        # 2. Validar existencia e disponibilidade do material
        material = self.material_repo.get_by_id(material_id)
        if not material or not material.is_active:
            raise ValueError("Material nao encontrado ou inativo.")
        if not material.is_available:
            raise ValueError("Material nao esta disponivel para locacao no momento.")

        # 3. Fallback do endereco de entrega para o endereco principal do cliente se nao informado
        final_delivery_address = delivery_address if delivery_address else client.address

        # 4. Instanciar o contrato de aluguel usando a taxa diaria atual do material
        rental = Rental(
            client_id=client_id,
            material_id=material_id,
            start_date=start_date,
            end_date=end_date,
            daily_rate=material.daily_rate,
            delivery_address=final_delivery_address,
            notes=notes,
            enable_sms_notification=enable_sms_notification
        )

        # 5. Salvar o aluguel e marcar o material como indisponivel no inventario
        saved_rental = self.rental_repo.save(rental)
        material.set_availability(False)
        self.material_repo.update(material)

        return saved_rental