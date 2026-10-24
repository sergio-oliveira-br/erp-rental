# backend/src/entrypoints/routers/clients.py
import uuid
from fastapi import APIRouter, Depends, status, Query, HTTPException

from src.domain.exceptions.domain_exceptions import EntityNotFoundException
from src.domain.use_cases.client.activate_client import ActivateClientUseCase
from src.domain.use_cases.client.delete_client import DeleteClientUseCase
from src.domain.use_cases.client.create_client import CreateClientUseCase
from src.domain.use_cases.client.find_possible_duplicates import FindPossibleDuplicatesUseCase
from src.entrypoints.dependencies import (
    get_create_client_use_case,
    get_list_clients_use_case,
    get_update_client_use_case,
    get_delete_client_use_case,
    get_activate_client_use_case,
    get_current_user, get_find_possible_duplicates_use_case  # <-- Dependência que extrai o usuário logado via JWT
)
from src.entrypoints.schemas import ClientCreateSchema, ClientResponseSchema, PaginatedResponse, ClientUpdateSchema, \
    ClientDuplicateCheckResponseSchema, ClientDuplicateCheckSchema
from src.infrastructure.db.models import UserTable

router = APIRouter(prefix="/clients", tags=["Clients"])

# Rota de Listagem (GET)
@router.get("/", response_model=PaginatedResponse[ClientResponseSchema])
def list_clients(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str = Query("", description="Termo de busca por nome, telefone ou endereço"),
    is_active: bool = Query(True, description="Filtra por clientes ativos (True) ou inativados (False)"),
    use_case = Depends(get_list_clients_use_case),
    current_user: UserTable = Depends(get_current_user) # <-- Identifica quem está logado
):
    # Passamos o owner_id do usuário logado para o caso de uso filtrar os dados do tenant
    clients = use_case.execute(owner_id=current_user.owner_id, is_active=is_active)

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


# Rota de Reativação
@router.patch("/{client_id}/activate", response_model=ClientResponseSchema)
def activate_client(
    client_id: uuid.UUID,
    use_case: ActivateClientUseCase = Depends(get_activate_client_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        # O caso de uso validará se o cliente pertence ao owner_id do usuário
        updated_client = use_case.execute(client_id=client_id, owner_id=current_user.owner_id)
        return updated_client
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# Rota de Criação (POST)
@router.post("/", response_model=ClientResponseSchema, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreateSchema,
    use_case: CreateClientUseCase = Depends(get_create_client_use_case),
    current_user: UserTable = Depends(get_current_user) # <-- Extrai o owner_id da sessão
):
    return use_case.execute(
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
        owner_id=current_user.owner_id, # <-- Associa o novo cliente ao tenant logado (Real ou Demo)
    )


# Rota de Edição (PUT / PATCH)
@router.put("/{client_id}", response_model=ClientResponseSchema)
def update_client(
    client_id: uuid.UUID,
    payload: ClientUpdateSchema,
    use_case = Depends(get_update_client_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        updated_client = use_case.execute(
            client_id=client_id,
            owner_id=current_user.owner_id,
            name=payload.name,
            phone=payload.phone,
            address=payload.address,
        )
        return updated_client
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# Rota de Remoção Segura
@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: uuid.UUID,
    use_case: DeleteClientUseCase = Depends(get_delete_client_use_case),
    current_user: UserTable = Depends(get_current_user)
):
    try:
        use_case.execute(client_id=client_id, owner_id=current_user.owner_id)
        return None
    except EntityNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/check-duplicates", response_model=ClientDuplicateCheckResponseSchema)
def check_client_duplicates(payload: ClientDuplicateCheckSchema,
                            use_case: FindPossibleDuplicatesUseCase = Depends(
                            get_find_possible_duplicates_use_case),
                            current_user: UserTable = Depends(get_current_user)):

    matches = use_case.execute(
        name=payload.name,
        owner_id=current_user.owner_id,
    )

    return {
        "has_duplicates": bool(matches),
        "matches": matches,
    }