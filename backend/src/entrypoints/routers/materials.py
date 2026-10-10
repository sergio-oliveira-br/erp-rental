# backend/src/entrypoints/routers/materials.py

from fastapi import APIRouter, Depends, status
from src.entrypoints.dependencies import get_create_material_use_case
from src.entrypoints.schemas import MaterialCreateSchema, MaterialResponseSchema
from src.domain.use_cases.material.create_material import CreateMaterialUseCase

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.post("/", response_model=MaterialResponseSchema, status_code=status.HTTP_201_CREATED)
def create_material(
    payload: MaterialCreateSchema,
    use_case: CreateMaterialUseCase = Depends(get_create_material_use_case)
):
    return use_case.execute(
        name=payload.name,
        daily_rate=payload.daily_rate,
        description=payload.description
    )