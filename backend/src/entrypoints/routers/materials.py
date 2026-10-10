# backend/src/entrypoints/routers/materials.py
import uuid

from fastapi import APIRouter, Depends, status, HTTPException, Query

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.use_cases.material.activate_material import ActivateMaterialUseCase
from src.domain.use_cases.material.delete_material import DeleteMaterialUseCase
from src.domain.use_cases.material.list_materials import ListMaterialsUseCase
from src.domain.use_cases.material.update_material import UpdateMaterialUseCase
from src.entrypoints.dependencies import get_create_material_use_case, get_update_material_use_case, \
    get_delete_material_use_case, get_activate_material_use_case, get_list_materials_use_case
from src.entrypoints.schemas import MaterialCreateSchema, MaterialResponseSchema, MaterialUpdateSchema, \
    PaginatedResponse
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

@router.get("/", response_model=PaginatedResponse[MaterialResponseSchema])
def list_materials(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str = Query("", description="Busca por nome ou descrição"),
    is_active: bool = Query(True, description="Filtra por materiais ativos (True) ou inativados (False)"),
    use_case: ListMaterialsUseCase = Depends(get_list_materials_use_case),
):
    materials = use_case.execute(is_active=is_active)

    if search:
        search_lower = search.lower()
        materials = [
            m for m in materials
            if search_lower in m.name.lower() or search_lower in (m.description or "").lower()
        ]

    total = len(materials)
    start_offset = (page - 1) * limit
    paginated_items = materials[start_offset : start_offset + limit]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
    }

@router.put("/{material_id}", response_model=MaterialResponseSchema)
def update_material(
    material_id: uuid.UUID,
    payload: MaterialUpdateSchema,
    use_case: UpdateMaterialUseCase = Depends(get_update_material_use_case),
):
    try:
        return use_case.execute(
            material_id=material_id,
            name=payload.name,
            daily_rate=payload.daily_rate,
            description=payload.description,
            is_available=payload.is_available,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: uuid.UUID,
    use_case: DeleteMaterialUseCase = Depends(get_delete_material_use_case),
):
    try:
        use_case.execute(material_id=material_id)
        return None
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.patch("/{material_id}/activate", response_model=MaterialResponseSchema)
def activate_material(
    material_id: uuid.UUID,
    use_case: ActivateMaterialUseCase = Depends(get_activate_material_use_case),
):
    try:
        return use_case.execute(material_id=material_id)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))