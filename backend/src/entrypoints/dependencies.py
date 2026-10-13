# backend/src/entrypoints/dependencies.py

from fastapi import Depends
from sqlalchemy import select
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
from src.domain.use_cases.rental.finish_rental import FinishRentalUseCase
from src.domain.use_cases.rental.list_filtered_rentals import ListFilteredRentalsUseCase
from src.domain.use_cases.rental.list_rentals import ListRentalsUseCase
from src.domain.use_cases.rental.reactivate_rental import ReactivateRentalUseCase
from src.domain.use_cases.rental.update_payment_status import UpdatePaymentStatusUseCase
from src.domain.use_cases.rental.update_rental import UpdateRentalUseCase
from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository
from src.infrastructure.db.session import get_session
from src.infrastructure.db.repositories.postgres_material_repository import PostgresMaterialRepository
from src.infrastructure.db.repositories.postgres_rental_repository import PostgresRentalRepository
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, status
from src.domain.entities.users import User
from src.core.security import decode_access_token

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

def get_create_rental_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),
                               client_repo: PostgresClientRepository = Depends(get_client_repository),
                                material_repo: PostgresMaterialRepository = Depends(get_material_repository),) -> CreateRentalUseCase:
    return CreateRentalUseCase(rental_repo=rental_repo, client_repo=client_repo, material_repo=material_repo,)

def get_list_rentals_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),) -> ListRentalsUseCase:
    return ListRentalsUseCase(rental_repo=rental_repo)

def get_finish_rental_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository)) -> FinishRentalUseCase:
    return FinishRentalUseCase(rental_repo=rental_repo)

def get_reactivate_rental_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),) -> ReactivateRentalUseCase:
    return ReactivateRentalUseCase(rental_repo=rental_repo)

def get_update_payment_status_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),) -> UpdatePaymentStatusUseCase:
    return UpdatePaymentStatusUseCase(rental_repo=rental_repo)

def get_update_rental_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),) -> UpdateRentalUseCase:
    return UpdateRentalUseCase(rental_repo=rental_repo)

def get_list_filtered_rentals_use_case(rental_repo: PostgresRentalRepository = Depends(get_rental_repository),) -> ListFilteredRentalsUseCase:
    return ListFilteredRentalsUseCase(rental_repo=rental_repo)


# -----------------
# Auth / Users

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais de autenticação inválidas ou expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception

    user = session.exec(select(User).where(User.username == username)).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores possuem privilégio para esta operação."
        )
    return current_user