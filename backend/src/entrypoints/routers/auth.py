# backend/src/entrypoints/routers/auth.py

import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.infrastructure.db.session import get_session
from src.infrastructure.db.models import UserTable
from src.core.security import verify_password, get_password_hash, create_access_token
from src.entrypoints.schemas import LoginRequest, Verify2FARequest, CreateUserRequest
from src.entrypoints.dependencies import get_current_admin_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

otp_storage = {}

@router.post("/login")
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    """Login temporariamente sem verificação 2FA."""

    user = session.exec(
        select(UserTable).where(UserTable.username == payload.username)
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )

    # Emite o JWT imediatamente após validar as credenciais
    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
        "username": user.username
    }


# @router.post("/login")
# def login(payload: LoginRequest, session: Session = Depends(get_session)):
#     """Passo 1: Valida usuário e senha, gerando o OTP 2FA para o telefone."""
#     user = session.exec(select(UserTable).where(UserTable.username == payload.username)).first()
#
#     if not user or not verify_password(payload.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Usuário ou senha incorretos."
#         )
#
#     # Gera código OTP de 6 dígitos
#     otp_code = str(random.randint(100000, 999999))
#     otp_storage[user.username] = otp_code
#
#     print(f"\n[SECURITY 2FA] Código OTP para {user.username} (Tel: {user.phone_number}): {otp_code}\n")
#
#     return {
#         "message": "Credenciais válidas. Insira o código de 2FA enviado para o seu telefone.",
#         "requires_2fa": True,
#         "phone_hint": f"***-****-{user.phone_number[-4:]}",
#         "debug_otp_code": otp_code
#     }

#
# @router.post("/verify-2fa")
# def verify_2fa(payload: Verify2FARequest, session: Session = Depends(get_session)):
#     """Passo 2: Valida o código 2FA e emite o Token JWT definitivo."""
#     stored_code = otp_storage.get(payload.username)
#
#     if not stored_code or stored_code != payload.code:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Código de verificação 2FA inválido ou expirado."
#         )
#
#     del otp_storage[payload.username]
#
#     user = session.exec(select(UserTable).where(UserTable.username == payload.username)).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="Usuário não encontrado.")
#
#     access_token = create_access_token(data={"sub": user.username})
#
#     return {
#         "access_token": access_token,
#         "token_type": "bearer",
#         "is_admin": user.is_admin,
#         "username": user.username
#     }


@router.post("/register")
def register_user(
        payload: CreateUserRequest,
        current_admin: UserTable = Depends(get_current_admin_user),
        session: Session = Depends(get_session)
):
    """Rota protegida: Exclusiva para administradores cadastrarem novos usuários."""
    existing_user = session.exec(select(UserTable).where(UserTable.username == payload.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já cadastrado."
        )

    new_user = UserTable(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        phone_number=payload.phone_number,
        is_admin=payload.is_admin,
        owner_id=current_admin.owner_id
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "message": f"Usuário '{new_user.username}' criado com sucesso.",
        "id": str(new_user.id),
        "is_admin": new_user.is_admin
    }



@router.post("/guest")
def guest_login(session: Session = Depends(get_session)):
    """Acesso direto para visitantes/recrutadores explorarem o portfólio sem 2FA."""
    guest_user = session.exec(select(UserTable).where(UserTable.username == "guest")).first()

    if not guest_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conta de demonstração não configurada no banco de dados."
        )

    # Emite o token JWT diretamente sem passar por verificação 2FA
    access_token = create_access_token(data={"sub": guest_user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": guest_user.is_admin,
        "username": guest_user.username
    }