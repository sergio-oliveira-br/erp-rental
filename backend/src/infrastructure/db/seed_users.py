# backend/src/infrastructure/db/seed_users.py

import os

from dotenv import load_dotenv
from sqlmodel import Session, select

from src.infrastructure.db.models import UserTable
from src.infrastructure.db.session import engine
from src.core.security import get_password_hash

load_dotenv()

def init_users():
    with Session(engine) as session:
        # Verifica se já existe algum usuário cadastrado
        existing = session.exec(select(UserTable)).first()
        if existing:
            print("Usuários já inicializados.")
            return

        # Carrega as credenciais iniciais de forma segura via variáveis de ambiente
        admin_username = os.getenv("ADMIN_USERNAME",)
        admin_password = os.getenv("ADMIN_PASSWORD",)
        admin_phone = os.getenv("ADMIN_PHONE")

        operator_username = os.getenv("OPERATOR_USERNAME")
        operator_password = os.getenv("OPERATOR_PASSWORD")
        operator_phone = os.getenv("OPERATOR_PHONE")

        users_data = [
            {
                "username": admin_username,
                "password": admin_password,
                "phone_number": admin_phone,
                "is_admin": True  # Possui permissão para criar novos usuários
            },
            {
                "username": operator_username,
                "password": operator_password,
                "phone_number": operator_phone,
                "is_admin": False  # Acesso restrito às operações do ERP
            }
        ]

        for data in users_data:
            user = UserTable(
                username=data["username"],
                hashed_password=get_password_hash(data["password"]),
                phone_number=data["phone_number"],
                is_admin=data["is_admin"]
            )
            session.add(user)

        session.commit()
        print("Usuários inicializados com sucesso (1 Admin, 1 Operador)!")

if __name__ == "__main__":
    init_users()