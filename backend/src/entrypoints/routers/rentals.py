# backend/src/entrypoints/routers/rentals.py

import uuid
from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, status, HTTPException, Query

from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.use_cases.rental.cancel_rental import CancelRentalUseCase
from src.domain.use_cases.rental.finish_rental import FinishRentalUseCase
from src.domain.use_cases.rental.list_filtered_rentals import ListFilteredRentalsUseCase
from src.domain.use_cases.rental.reactivate_rental import ReactivateRentalUseCase
from src.domain.use_cases.rental.update_payment_status import UpdatePaymentStatusUseCase
from src.domain.use_cases.rental.update_rental import UpdateRentalUseCase
from src.entrypoints.dependencies import (
    get_create_rental_use_case,
    get_finish_rental_use_case,
    get_reactivate_rental_use_case,
    get_update_payment_status_use_case,
    get_update_rental_use_case,
    get_rental_repository,
    get_list_filtered_rentals_use_case,
    get_current_user, get_cancel_rental_use_case  # <-- Injeta o usuário logado via JWT
)
from src.entrypoints.schemas import (
    RentalCreateSchema,
    RentalResponseSchema,
    PaginatedResponse,
    RentalPaymentUpdateSchema,
    RentalUpdateSchema,
    RentalAuditLogResponse
)
from src.domain.use_cases.rental.create_rental import CreateRentalUseCase
from src.infrastructure.db.repositories.postgres_rental_repository import PostgresRentalRepository
from src.infrastructure.db.models import UserTable

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.post("/", response_model=RentalResponseSchema, status_code=status.HTTP_201_CREATED)
def create_rental(
    payload: RentalCreateSchema,
    use_case: CreateRentalUseCase = Depends(get_create_rental_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(
            client_id=payload.client_id,
            material_id=payload.material_id,
            quantity=payload.quantity,
            start_date=payload.start_date,
            end_date=payload.end_date,
            owner_id=current_user.owner_id, 
            delivery_address=payload.delivery_address,
            notes=payload.notes,
            enable_sms_notification=payload.enable_sms_notification,
            daily_rate=payload.daily_rate
        )
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=PaginatedResponse[RentalResponseSchema])
def list_rentals(
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(10, ge=1, description="Itens por página"),
    search: Optional[str] = Query(None, description="Busca por nome de cliente ou material"),
    status: Optional[str] = Query(None, description="Filtrar por status do contrato (ACTIVE, FINISHED, CANCELLED)"),
    payment_status: Optional[str] = Query(None, description="Filtrar por status de pagamento (PENDING, PAID)"),
    start_date_from: Optional[date] = Query(None, description="Data de início (de)"),
    start_date_to: Optional[date] = Query(None, description="Data de início (até)"),
    use_case: ListFilteredRentalsUseCase = Depends(get_list_filtered_rentals_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        result = use_case.execute(
            owner_id=current_user.owner_id,
            page=page,
            limit=limit,
            search=search,
            status=status,
            payment_status=payment_status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar locações: {str(e)}"
        )


@router.patch("/{rental_id}/finish", response_model=RentalResponseSchema)
def finish_rental(
    rental_id: uuid.UUID,
    use_case: FinishRentalUseCase = Depends(get_finish_rental_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(rental_id=rental_id, owner_id=current_user.owner_id)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{rental_id}/reactivate", response_model=RentalResponseSchema)
def reactivate_rental(
    rental_id: uuid.UUID,
    use_case: ReactivateRentalUseCase = Depends(get_reactivate_rental_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(rental_id=rental_id, owner_id=current_user.owner_id)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{rental_id}/payment", response_model=RentalResponseSchema)
def update_payment_status(
    rental_id: uuid.UUID,
    payload: RentalPaymentUpdateSchema,
    use_case: UpdatePaymentStatusUseCase = Depends(get_update_payment_status_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(
            rental_id=rental_id,
            owner_id=current_user.owner_id,
            payment_status=payload.payment_status
        )
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{rental_id}", response_model=RentalResponseSchema)
def update_rental(
    rental_id: uuid.UUID,
    payload: RentalUpdateSchema,
    use_case: UpdateRentalUseCase = Depends(get_update_rental_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(
            rental_id=rental_id,
            owner_id=current_user.owner_id,
            delivery_address=payload.delivery_address,
            notes=payload.notes,
            end_date=payload.end_date,
            quantity=payload.quantity,
        )
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{rental_id}/logs", response_model=List[RentalAuditLogResponse])
def get_rental_logs(
    rental_id: uuid.UUID,
    repo: PostgresRentalRepository = Depends(get_rental_repository),
    current_user: UserTable = Depends(get_current_user)
):
    # Opcional: Validar se o contrato pertence ao tenant antes de buscar os logs de auditoria
    rental = repo.get_by_id(rental_id, owner_id=current_user.owner_id)
    if not rental:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locação não encontrada.")
    return repo.get_audit_logs(rental_id)


@router.post("/{rental_id}/cancel", response_model=RentalResponseSchema)
def cancel_rental(
    rental_id: uuid.UUID,
    use_case: CancelRentalUseCase = Depends(get_cancel_rental_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        return use_case.execute(rental_id=rental_id, owner_id=current_user.owner_id)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))