# finance/backend/src/infrastructure/db/session.py

from collections.abc import Generator
from sqlmodel import Session, create_engine

from src.infrastructure.config.settings import settings


# Cria o mecanismo responsável por administrar as conexões
# entre a aplicação Finance e o PostgreSQL do Neon.
engine = create_engine(
    settings.database_url,

    # Exibe comandos SQL somente quando DB_ECHO=true.
    echo=settings.DB_ECHO,

    # Verifica se a conexão está ativa antes de utilizá-la.
    pool_pre_ping=True,

    # Mantém no máximo uma conexão disponível por instância
    # da aplicação. É um ponto de partida conservador para Lambda.
    pool_size=1,

    # Não permite conexões extras além do limite definido.
    max_overflow=0,

    # Recicla conexões após cinco minutos.
    pool_recycle=300,
)


def get_session() -> Generator[Session, None, None]:
    """
    Disponibiliza uma sessão do banco para cada requisição.

    O FastAPI controla o ciclo de vida dessa sessão através
    da injeção de dependências.
    """

    with Session(engine) as session:
        yield session