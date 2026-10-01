# backend/src/entrypoints/dependencies.py

from src.domain.use_cases.create_client import CreateClientUseCase
from src.domain.use_cases.create_material import CreateMaterialUseCase
from src.domain.use_cases.create_rental import CreateRentalUseCase
from src.infrastructure.adapters.in_memory_client_repository import InMemoryClientRepository
from src.infrastructure.adapters.in_memory_material_repository import InMemoryMaterialRepository
from src.infrastructure.adapters.in_memory_rental_repository import InMemoryRentalRepository

# Instâncias únicas dos repositórios
# (In-Memory temporário, facilmente substituível por DynamoDB/SQLAlchemy)
client_repository = InMemoryClientRepository()
material_repository = InMemoryMaterialRepository()
rental_repository = InMemoryRentalRepository()


def get_create_client_use_case() -> CreateClientUseCase:
    return CreateClientUseCase(client_repo=client_repository)


def get_create_material_use_case() -> CreateMaterialUseCase:
    return CreateMaterialUseCase(material_repo=material_repository)


def get_create_rental_use_case() -> CreateRentalUseCase:
    return CreateRentalUseCase(
        rental_repo=rental_repository,
        client_repo=client_repository,
        material_repo=material_repository,
    )