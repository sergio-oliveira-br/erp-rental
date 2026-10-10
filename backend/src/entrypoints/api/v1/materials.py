# backend/src/entrypoints/api/v1/materials.py

from fastapi import APIRouter, Depends, status
from src.domain.ports.material_repository import MaterialRepositoryPort
from src.domain.use_cases.material.create_material import CreateMaterialUseCase
from src.entrypoints.dependencies import get_material_repository
from src.entrypoints.schemas import MaterialResponseSchema, MaterialCreateSchema

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post("/", response_model=MaterialResponseSchema, status_code=status.HTTP_201_CREATED)
def create_material(
    payload: MaterialCreateSchema,
    repo: MaterialRepositoryPort = Depends(get_material_repository)
):
    use_case = CreateMaterialUseCase(material_repo=repo)
    material = use_case.execute(
        name=payload.name,
        daily_rate=payload.daily_rate,
        description=payload.description
    )
    return material