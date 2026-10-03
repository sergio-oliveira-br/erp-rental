# backend/src/infrastructure/db/init_db.py

from sqlmodel import SQLModel
from src.infrastructure.db.session import engine
# Importar os modelos garante que o SQLModel os registre
from src.infrastructure.db.models import MaterialTable, ClientTable, RentalTable


def init_db():
    SQLModel.metadata.create_all(engine)


if __name__ == "__main__":
    init_db()