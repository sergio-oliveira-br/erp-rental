# finance/backend/src/infrastructure/db/migrations/env.py

from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool
from sqlmodel import SQLModel

from src.infrastructure.config.settings import settings

# Importa os modelos para registrá-los nos metadados do SQLModel.
from src.infrastructure.db import models


# Objeto de configuração disponibilizado pelo Alembic.
config = context.config


# Configura os logs do Alembic usando o alembic.ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Metadados do SQLModel.
# O Alembic utilizará essas informações para identificar
# as tabelas e comparar os modelos com o banco de dados.
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """
    Executa migrations sem abrir uma conexão com o banco.

    O Alembic gera os comandos SQL utilizando apenas
    a URL de conexão e os metadados dos modelos.
    """

    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Executa migrations com conexão real ao banco.

    Utiliza a mesma URL configurada no settings.py.
    O NullPool evita manter conexões abertas após
    a execução das migrations.
    """

    connectable = create_engine(
        settings.database_url,
        poolclass=pool.NullPool,
    )

    try:
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                compare_type=True,
            )

            with context.begin_transaction():
                context.run_migrations()

    finally:
        connectable.dispose()


# Define qual modo de execução será utilizado.
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()