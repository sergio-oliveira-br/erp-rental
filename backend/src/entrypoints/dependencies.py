# backend/src/entrypoints/dependencies.py

from fastapi import Depends
from sqlmodel import Session

from src.domain.use_cases.client.activate_client import ActivateClientUseCase
from src.domain.use_cases.client.create_client import CreateClientUseCase
from src.domain.use_cases.material.activate_material import ActivateMaterialUseCase
from src.domain.use_cases.material.create_material import CreateMaterialUseCase
from src.domain.use_cases.material.delete_material import DeleteMaterialUseCase
from src.domain.use_cases.material.list_materials import ListMaterialsUseCase
from src.domain.use_cases.material.update_material import UpdateMaterialUseCase
from src.domain.use_cases.rental.create_rental import CreateRentalUseCase
from src.domain.use_cases.client.delete_client import DeleteClientUseCase
from src.domain.use_cases.client.list_clients import ListClientsUseCase
from src.domain.use_cases.client.update_client import UpdateClientUseCase
from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository
from src.infrastructure.db.session import get_session
from src.infrastructure.db.repositories.postgres_material_repository import PostgresMaterialRepository
from src.infrastructure.db.repositories.postgres_rental_repository import PostgresRentalRepository

# -----------------
# Material
def get_material_repository(session: Session = Depends(get_session)) -> PostgresMaterialRepository:
    return PostgresMaterialRepository(session=session)

def get_create_material_use_case(material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> CreateMaterialUseCase:
    return CreateMaterialUseCase(material_repo=material_repo)

def get_list_materials_use_case(material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> ListMaterialsUseCase:
    return ListMaterialsUseCase(material_repo=material_repo)

def get_update_material_use_case(material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> UpdateMaterialUseCase:
    return UpdateMaterialUseCase(material_repo=material_repo)

def get_delete_material_use_case(material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> DeleteMaterialUseCase:
    return DeleteMaterialUseCase(material_repo=material_repo)

def get_activate_material_use_case(material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> ActivateMaterialUseCase:
    return ActivateMaterialUseCase(material_repo=material_repo)


# -----------------
# Client
def get_client_repository(session: Session = Depends(get_session)) -> PostgresClientRepository:
    return PostgresClientRepository(session=session)

def get_list_clients_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> ListClientsUseCase:
    return ListClientsUseCase(client_repo=client_repo)

def get_create_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> CreateClientUseCase:
    return CreateClientUseCase(client_repo=client_repo)

def get_update_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> UpdateClientUseCase:
    return UpdateClientUseCase(client_repo=client_repo)

def get_delete_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> DeleteClientUseCase:
    return DeleteClientUseCase(client_repo=client_repo)

def get_activate_client_use_case(client_repo: PostgresClientRepository = Depends(get_client_repository),) -> ActivateClientUseCase:
    return ActivateClientUseCase(client_repo=client_repo)


# -----------------
# Rent
def get_rental_repository(session: Session = Depends(get_session)) -> PostgresRentalRepository:
    return PostgresRentalRepository(session=session)

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