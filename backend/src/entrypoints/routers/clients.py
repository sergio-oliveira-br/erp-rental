# backend/src/entrypoints/routers/clients.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, status, Query

from src.entrypoints.dependencies import get_create_client_use_case, get_list_clients_use_case, \
    get_update_client_use_case
from src.entrypoints.schemas import ClientCreateSchema, ClientResponseSchema, PaginatedResponse, ClientUpdateSchema
from src.domain.use_cases.create_client import CreateClientUseCase

router = APIRouter(prefix="/clients", tags=["Clients"])

# Rota de Listagem (GET)
@router.get("/", response_model=PaginatedResponse[ClientResponseSchema])
def list_clients(page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str = Query("", description="Termo de busca por nome, telefone ou endereço"),
    use_case=Depends(get_list_clients_use_case)
 ):
    # Executa o caso de uso (passe os parâmetros caso seu use_case/repositório já os trate)
    clients = use_case.execute()

    # Se a filtragem/paginação ainda não for feita na query do banco SQLModel,
    # você pode fazer um fatiamento em memória temporário:
    if search:
        search_lower = search.lower()
        clients = [
            c for c in clients
            if search_lower in c.name.lower() or search_lower in (c.address or "").lower()
        ]

    total = len(clients)
    start_offset = (page - 1) * limit
    paginated_items = clients[start_offset: start_offset + limit]

    return {
        "items": paginated_items,
        "total": total,
        "page": page,
        "limit": limit,
    }

# Rota de Criação (POST)
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


# Rota de Edição (PUT / PATCH)
@router.put("/{client_id}", response_model=ClientResponseSchema)
def update_client(
    client_id: uuid.UUID,
    payload: ClientUpdateSchema,
    use_case = Depends(get_update_client_use_case),
):
    updated_client = use_case.execute(
        client_id=client_id,
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
    )
    return updated_client