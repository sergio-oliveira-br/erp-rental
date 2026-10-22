# backend/src/infrastructure/db/session.py

from typing import Generator
from sqlmodel import Session, SQLModel, create_engine

from src.infrastructure.config.settings import settings
from src.infrastructure.db import models

engine = create_engine(settings.database_url, echo=True, pool_pre_ping=True)


def init_db() -> None:
    """Garante a existência do banco e cria as tabelas."""
    # ensure_database_exists()
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Injeta a sessão do banco por requisição no FastAPI."""
    with Session(engine) as session:
        yield session