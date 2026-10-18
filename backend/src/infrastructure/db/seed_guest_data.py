# backend/src/infrastructure/db/seed_guest_data.py

import csv
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlmodel import Session, select

from src.infrastructure.db.session import engine
from src.infrastructure.db.models import UserTable, ClientTable, MaterialTable, RentalTable
from src.core.security import get_password_hash
from src.domain.entities.rental import RentalStatus, PaymentStatus


def seed_guest_account():
    with Session(engine) as session:
        # 1. Garante a existência do usuário 'guest'
        guest_user = session.exec(select(UserTable).where(UserTable.username == "guest")).first()

        if not guest_user:
            guest_user = UserTable(
                id=uuid.uuid4(),
                owner_id=uuid.uuid4(),  # Tenant exclusivo de demonstração
                username="guest",
                hashed_password=get_password_hash("guest_demo_pass_123"),
                phone_number="+5534999990000",
                is_admin=False,
                is_active=True
            )
            session.add(guest_user)
            session.commit()
            session.refresh(guest_user)
            print("Usuário 'guest' criado com sucesso.")

        owner_id = guest_user.owner_id

        # Se já existirem clientes para o guest, ignora para não duplicar
        existing_clients = session.exec(select(ClientTable).where(ClientTable.owner_id == owner_id)).all()
        if existing_clients:
            print("Banco de demonstração já povoado.")
            return

        # 2. Carrega e insere Clientes do CSV do Mockaroo
        inserted_clients = []
        with open("/Users/serginho_viniciohotmail.com/PycharmProjects/WelcomeScreen/erp-rental/backend/src/infrastructure/db/data/MOCK_DATA_CLIENTS.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for c in reader:
                client = ClientTable(
                    id=uuid.uuid4(),
                    owner_id=owner_id,
                    name=c["name"],
                    phone=c.get("phone", "+553499999999"),
                    is_active=True
                )
                session.add(client)
                inserted_clients.append(client)

        # 3. Carrega e insere Materiais do CSV do Mockaroo
        inserted_materials = []
        with open("/Users/serginho_viniciohotmail.com/PycharmProjects/WelcomeScreen/erp-rental/backend/src/infrastructure/db/data/MOCK_DATA_MATERIALS.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for m in reader:
                material = MaterialTable(
                    id=uuid.uuid4(),
                    owner_id=owner_id,
                    name=m["name"],
                    daily_rate=Decimal(str(m["daily_rate"])),
                    is_active=True
                )
                session.add(material)
                inserted_materials.append(material)

        session.commit()

        # 4. Carrega e insere Locações do CSV do Mockaroo associando aos registros criados
        with open("/Users/serginho_viniciohotmail.com/PycharmProjects/WelcomeScreen/erp-rental/backend/src/infrastructure/db/data/MOCK_DATA_RENTALS.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, r in enumerate(reader):
                # Associa de forma cíclica ou randômica caso o CSV traga índices genéricos
                client = inserted_clients[idx % len(inserted_clients)]
                material = inserted_materials[idx % len(inserted_materials)]

                # Converte strings de data do CSV (ex: '2026-10-01') para objetos date
                start_date = datetime.strptime(r["start_date"], "%Y-%m-%d").date() if r.get("start_date") else date.today()
                end_date = datetime.strptime(r["end_date"], "%Y-%m-%d").date() if r.get("end_date") else date.today()

                rental = RentalTable(
                    id=uuid.uuid4(),
                    owner_id=owner_id,
                    client_id=client.id,
                    material_id=material.id,
                    start_date=start_date,
                    end_date=end_date,
                    daily_rate=material.daily_rate,
                    status=RentalStatus(r.get("status", "ACTIVE")),
                    payment_status=PaymentStatus(r.get("payment_status", "PENDING")),
                    delivery_address=r.get("delivery_address") or f"Obra {idx + 1}"
                )
                session.add(rental)

        session.commit()
        print("Banco de dados de demonstração povoado com sucesso via CSV!")


if __name__ == "__main__":
    seed_guest_account()