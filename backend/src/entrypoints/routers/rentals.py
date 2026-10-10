# backend/src/entrypoints/routers/rentals.py

from fastapi import APIRouter, Depends, status
from src.entrypoints.dependencies import get_create_rental_use_case
from src.entrypoints.schemas import RentalCreateSchema, RentalResponseSchema
from src.domain.use_cases.rental.create_rental import CreateRentalUseCase

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.post("/", response_model=RentalResponseSchema, status_code=status.HTTP_201_CREATED)
def create_rental(
    payload: RentalCreateSchema,
    use_case: CreateRentalUseCase = Depends(get_create_rental_use_case)
):
    return use_case.execute(
        client_id=payload.client_id,
        material_id=payload.material_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        delivery_address=payload.delivery_address,
        notes=payload.notes,
        enable_sms_notification=payload.enable_sms_notification
    )