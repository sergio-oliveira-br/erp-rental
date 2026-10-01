# backend/tests/unit/test_create_rental.py

from datetime import date, timedelta
from decimal import Decimal
import pytest

from src.domain.entities.client import Client
from src.domain.entities.material import Material
from src.domain.exceptions.domain_exceptions import (
    EntityNotFoundException,
    MaterialUnavailableException,
)
from src.domain.use_cases.create_rental import CreateRentalUseCase
from src.infrastructure.adapters.in_memory_client_repository import InMemoryClientRepository
from src.infrastructure.adapters.in_memory_material_repository import InMemoryMaterialRepository
from src.infrastructure.adapters.in_memory_rental_repository import InMemoryRentalRepository


def test_should_create_rental_successfully():
    client_repo = InMemoryClientRepository()
    material_repo = InMemoryMaterialRepository()
    rental_repo = InMemoryRentalRepository()

    use_case = CreateRentalUseCase(rental_repo, client_repo, material_repo)

    # 1. Setup inicial
    client = client_repo.save(Client(name="João Silva", phone="11999998888", address="Rua A, 123"))
    material = material_repo.save(Material(name="Betoneira 400L", daily_rate=Decimal("80.00")))

    today = date.today()
    next_week = today + timedelta(days=7)

    # 2. Execução
    rental = use_case.execute(
        client_id=client.id,
        material_id=material.id,
        start_date=today,
        end_date=next_week,
        delivery_address="Obra B - Av Central 500"  # Endereço específico
    )

    # 3. Asserções
    assert rental.id is not None
    assert rental.delivery_address == "Obra B - Av Central 500"
    assert material_repo.get_by_id(material.id).is_available is False


def test_should_raise_exception_when_material_is_already_rented():
    client_repo = InMemoryClientRepository()
    material_repo = InMemoryMaterialRepository()
    rental_repo = InMemoryRentalRepository()

    use_case = CreateRentalUseCase(rental_repo, client_repo, material_repo)

    client = client_repo.save(Client(name="Maria Souza", phone="11977776666", address="Rua B, 456"))
    material = material_repo.save(Material(name="Andaime Tubular", daily_rate=Decimal("30.00")))
    material.set_availability(False)  # Material ocupado
    material_repo.update(material)

    today = date.today()

    # Tenta alugar um item indisponível
    with pytest.raises(MaterialUnavailableException):
        use_case.execute(
            client_id=client.id,
            material_id=material.id,
            start_date=today,
            end_date=today + timedelta(days=3)
        )