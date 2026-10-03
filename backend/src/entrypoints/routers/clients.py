# backend/src/entrypoints/routers/clients.py

from fastapi import APIRouter, Depends, status
from src.entrypoints.dependencies import get_create_client_use_case
from src.entrypoints.schemas import ClientCreateSchema, ClientResponseSchema
from src.domain.use_cases.create_client import CreateClientUseCase

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=ClientResponseSchema, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreateSchema,
    use_case: CreateClientUseCase = Depends(get_create_client_use_case)
):
    return use_case.execute(
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
    )