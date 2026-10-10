# backend/src/domain/use_cases/create_rental.py

from datetime import date
from typing import Optional
import uuid
from src.domain.entities.rental import Rental
from src.domain.exceptions.domain_exceptions import (EntityNotFoundException,MaterialUnavailableException,)
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
        # 1. Validar cliente
        client = self.client_repo.get_by_id(client_id)
        if not client or not client.is_active:
            raise EntityNotFoundException(f"Cliente {client_id} nao encontrado ou inativo.")

        # 2. Validar material e disponibilidade
        material = self.material_repo.get_by_id(material_id)
        if not material or not material.is_active:
            raise EntityNotFoundException(f"Material {material_id} nao encontrado ou inativo.")

        if not material.is_available:
            raise MaterialUnavailableException(f"Material '{material.name}' ja esta alocado.")

        # 3. Fallback do endereço de entrega
        final_delivery_address = delivery_address if delivery_address else client.address

        # 4. Criar transação
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

        saved_rental = self.rental_repo.save(rental)
        # Não irei definir availability neste momento
        # material.set_availability(False)
        # self.material_repo.update(material)

        return saved_rental