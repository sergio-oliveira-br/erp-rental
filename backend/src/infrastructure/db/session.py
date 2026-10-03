# backend/src/infrastructure/db/session.py

from typing import Generator
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlmodel import Session, SQLModel, create_engine

from src.infrastructure.config.settings import settings

engine = create_engine(settings.database_url, echo=True, pool_pre_ping=True)


def ensure_database_exists() -> None:
    """Conecta ao banco padrao 'postgres' e cria o banco do .env caso nao exista."""
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s",
            (settings.POSTGRES_DB,),
        )
        exists = cursor.fetchone()

        if not exists:
            print(f"Criando banco de dados '{settings.POSTGRES_DB}'...")
            cursor.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
            print(
                f"Banco de dados '{settings.POSTGRES_DB}' criado com sucesso!"
            )

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Erro ao verificar/criar banco de dados: {e}")
        raise e


def init_db() -> None:
    """Garante a existência do banco e cria as tabelas."""
    ensure_database_exists()
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Injeta a sessão do banco por requisição no FastAPI."""
    with Session(engine) as session:
        yield session