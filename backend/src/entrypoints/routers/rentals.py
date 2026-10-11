# backend/src/entrypoints/routers/rentals.py
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, status, HTTPException, Query

from src.domain.entities.rental import RentalStatus
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, DomainException
from src.domain.use_cases.rental.finish_rental import FinishRentalUseCase
from src.domain.use_cases.rental.list_rentals import ListRentalsUseCase
from src.domain.use_cases.rental.reactivate_rental import ReactivateRentalUseCase
from src.domain.use_cases.rental.update_payment_status import UpdatePaymentStatusUseCase
from src.domain.use_cases.rental.update_rental import UpdateRentalUseCase
from src.entrypoints.dependencies import get_create_rental_use_case, get_list_rentals_use_case, \
    get_finish_rental_use_case, get_reactivate_rental_use_case, get_update_payment_status_use_case, \
    get_update_rental_use_case
from src.entrypoints.schemas import RentalCreateSchema, RentalResponseSchema, PaginatedResponse, \
    RentalPaymentUpdateSchema, RentalUpdateSchema
from src.domain.use_cases.rental.create_rental import CreateRentalUseCase

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.post("/", response_model=RentalResponseSchema, status_code=status.HTTP_201_CREATED)
def create_rental(payload: RentalCreateSchema, use_case: CreateRentalUseCase = Depends(get_create_rental_use_case)):
    try:
        return use_case.execute(
            client_id=payload.client_id,
            material_id=payload.material_id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            delivery_address=payload.delivery_address,
            notes=payload.notes,
            enable_sms_notification=payload.enable_sms_notification
        )
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=PaginatedResponse[RentalResponseSchema])
def list_rentals(page: int = Query(1, ge=1),
                 limit: int = Query(10, ge=1),
                 rental_status: Optional[RentalStatus] = Query(None, alias="status"),
                 use_case: ListRentalsUseCase = Depends(get_list_rentals_use_case),):

    rentals = use_case.execute(status=rental_status)

    total = len(rentals)
    start_offset = (page - 1) * limit
    paginated_items = rentals[start_offset : start_offset + limit]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.patch("/{rental_id}/finish", response_model=RentalResponseSchema)
def finish_rental(rental_id: uuid.UUID, use_case: FinishRentalUseCase = Depends(get_finish_rental_use_case),):
    try:
        return use_case.execute(rental_id=rental_id)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.patch("/{rental_id}/reactivate", response_model=RentalResponseSchema)
def reactivate_rental(rental_id: uuid.UUID, use_case: ReactivateRentalUseCase = Depends(get_reactivate_rental_use_case), get_reactivate_rental_use_case=None):
    try:
        return use_case.execute(rental_id=rental_id)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{rental_id}/payment", response_model=RentalResponseSchema)
def update_payment_status(rental_id: uuid.UUID, payload: RentalPaymentUpdateSchema, use_case: UpdatePaymentStatusUseCase = Depends(get_update_payment_status_use_case),):
    try:
        return use_case.execute(rental_id=rental_id, payment_status=payload.payment_status)
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.patch("/{rental_id}", response_model=RentalResponseSchema)
def update_rental(rental_id: uuid.UUID, payload: RentalUpdateSchema,
                  use_case: UpdateRentalUseCase = Depends(get_update_rental_use_case),):
    try:
        return use_case.execute(
            rental_id=rental_id,
            delivery_address=payload.delivery_address,
            notes=payload.notes,
            end_date=payload.end_date,
        )
    except (EntityNotFoundException, DomainException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))