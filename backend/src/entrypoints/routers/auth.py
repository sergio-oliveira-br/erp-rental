# backend/src/entrypoints/routers/auth.py

import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.infrastructure.db.session import get_session
from src.domain.entities.users import User
from src.core.security import verify_password, get_password_hash, create_access_token
from src.entrypoints.schemas import LoginRequest, Verify2FARequest, CreateUserRequest
from src.entrypoints.dependencies import get_current_admin_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Armazenamento em memória volátil de curto prazo para os códigos OTP do 2FA
otp_storage = {}

@router.post("/login")
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    """Passo 1: Valida usuário e senha, gerando o OTP 2FA para o telefone."""
    user = session.exec(select(User).where(User.username == payload.username)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos."
        )

    # Gera código OTP de 6 dígitos
    otp_code = str(random.randint(100000, 999999))
    otp_storage[user.username] = otp_code

    # Simulação de envio gratuito via canal de mensageria / log de terminal seguro
    print(f"\n[SECURITY 2FA] Código OTP para {user.username} (Tel: {user.phone_number}): {otp_code}\n")

    return {
        "message": "Credenciais válidas. Insira o código de 2FA enviado para o seu telefone.",
        "requires_2fa": True,
        "phone_hint": f"***-****-{user.phone_number[-4:]}",
        "debug_otp_code": otp_code  # Facilita testes em desenvolvimento
    }


@router.post("/verify-2fa")
def verify_2fa(payload: Verify2FARequest, session: Session = Depends(get_session)):
    """Passo 2: Valida o código 2FA e emite o Token JWT definitivo."""
    stored_code = otp_storage.get(payload.username)

    if not stored_code or stored_code != payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificação 2FA inválido ou expirado."
        )

    # Consome o código OTP
    del otp_storage[payload.username]

    user = session.exec(select(User).where(User.username == payload.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    access_token = create_access_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
        "username": user.username
    }


@router.post("/register")
def register_user(
        payload: CreateUserRequest,
        current_admin: User = Depends(get_current_admin_user),
        session: Session = Depends(get_session)
):
    """Rota protegida: Exclusiva para administradores cadastrarem novos usuários."""
    existing_user = session.exec(select(User).where(User.username == payload.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome de usuário já cadastrado."
        )

    new_user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        phone_number=payload.phone_number,
        is_admin=payload.is_admin
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "message": f"Usuário '{new_user.username}' criado com sucesso.",
        "id": new_user.id,
        "is_admin": new_user.is_admin
    }