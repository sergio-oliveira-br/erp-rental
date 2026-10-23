# backend/src/domain/use_cases/rental/create_rental.py

from datetime import date
from decimal import Decimal
from typing import Optional
import uuid
from src.domain.entities.rental import Rental
from src.domain.exceptions.domain_exceptions import (
    EntityNotFoundException,
    MaterialUnavailableException,
)
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
            owner_id: uuid.UUID,
            delivery_address: Optional[str] = None,
            notes: Optional[str] = None,
            enable_sms_notification: bool = False,
            daily_rate: Optional[Decimal] = None,
            quantity: int = 1,
    ) -> Rental:
        # 1. Validar cliente vinculado ao owner_id do tenant logado
        client = self.client_repo.get_by_id(client_id, owner_id=owner_id)
        if not client or not client.is_active:
            raise EntityNotFoundException(f"Cliente {client_id} nao encontrado ou inativo.")

        # 2. Validar material e disponibilidade garantindo o isolamento do tenant
        material = self.material_repo.get_by_id(material_id, owner_id=owner_id)
        if not material or not material.is_active:
            raise EntityNotFoundException(f"Material {material_id} nao encontrado ou inativo.")

        if not material.is_available:
            raise MaterialUnavailableException(f"Material '{material.name}' ja esta alocado.")

        # 3. Fallback do endereço de entrega
        final_delivery_address = delivery_address if delivery_address else client.address

        # Lógica de preço: Se enviado pelo operador, usa o customizado; senão, usa o padrão do material
        final_daily_rate = daily_rate if daily_rate is not None else material.daily_rate

        # 4. Criar transação vinculando o owner_id
        rental = Rental(
            client_id=client_id,
            material_id=material_id,
            owner_id=owner_id,
            start_date=start_date,
            end_date=end_date,
            daily_rate=final_daily_rate,
            delivery_address=final_delivery_address,
            notes=notes,
            enable_sms_notification=enable_sms_notification,
            quantity=quantity,
        )

        saved_rental = self.rental_repo.save(rental)

        if hasattr(self.rental_repo, "add_audit_log"):
            self.rental_repo.add_audit_log(saved_rental.id, "CRIADO", "Contrato de locação criado para o material.")

        return saved_rental