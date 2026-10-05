# backend/src/entrypoints/dependencies.py

from fastapi import Depends
from sqlmodel import Session

from src.domain.use_cases.create_client import CreateClientUseCase
from src.domain.use_cases.create_material import CreateMaterialUseCase
from src.domain.use_cases.create_rental import CreateRentalUseCase
from src.domain.use_cases.list_clients import ListClientsUseCase
from src.domain.use_cases.update_client import UpdateClientUseCase
from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository
from src.infrastructure.db.session import get_session
from src.infrastructure.db.repositories.postgres_material_repository import PostgresMaterialRepository
from src.infrastructure.db.repositories.postgres_rental_repository import PostgresRentalRepository


def get_material_repository(session: Session = Depends(get_session)) -> PostgresMaterialRepository:
    return PostgresMaterialRepository(session=session)


def get_rental_repository(session: Session = Depends(get_session)) -> PostgresRentalRepository:
    return PostgresRentalRepository(session=session)

def get_client_repository(session: Session = Depends(get_session)) -> PostgresClientRepository:
    return PostgresClientRepository(session=session)

def get_list_clients_use_case(
    client_repo: PostgresClientRepository = Depends(get_client_repository),
) -> ListClientsUseCase:
    return ListClientsUseCase(client_repo=client_repo)


def get_create_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> CreateClientUseCase:
    return CreateClientUseCase(client_repo=client_repo)

def get_update_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> UpdateClientUseCase:
    return UpdateClientUseCase(client_repo=client_repo)


def get_create_material_use_case(
    material_repo: PostgresMaterialRepository = Depends(get_material_repository),
) -> CreateMaterialUseCase:
    return CreateMaterialUseCase(material_repo=material_repo)


def get_create_rental_use_case(
    rental_repo: PostgresRentalRepository = Depends(get_rental_repository),
    client_repo: PostgresClientRepository = Depends(get_client_repository),
    material_repo: PostgresMaterialRepository = Depends(get_material_repository),
) -> CreateRentalUseCase:
    return CreateRentalUseCase(
        rental_repo=rental_repo,
        client_repo=client_repo,
        material_repo=material_repo,
    )