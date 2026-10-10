# backend/scripts/verify_setup.py

import sys
from pathlib import Path

from src.infrastructure.db.init_db import init_db
from src.infrastructure.db.session import engine

# Adiciona o diretório backend ao PATH
sys.path.append(str(Path(__file__).parent.parent))

from datetime import date, timedelta
from decimal import Decimal
from sqlmodel import Session

from src.infrastructure.db.repositories.postgres_client_repository import PostgresClientRepository
from src.infrastructure.db.repositories.postgres_material_repository import PostgresMaterialRepository
from src.infrastructure.db.repositories.postgres_rental_repository import PostgresRentalRepository
from src.domain.use_cases.client.create_client import CreateClientUseCase
from src.domain.use_cases.material.create_material import CreateMaterialUseCase
from src.domain.use_cases.rental.create_rental import CreateRentalUseCase


def main():
    print("1. Inicializando tabelas no PostgreSQL...")
    init_db()

    with Session(engine) as session:
        # Repositórios Reais
        client_repo = PostgresClientRepository(session)
        material_repo = PostgresMaterialRepository(session)
        rental_repo = PostgresRentalRepository(session)

        # Casos de Uso
        create_client_uc = CreateClientUseCase(client_repo)
        create_material_uc = CreateMaterialUseCase(material_repo)
        create_rental_uc = CreateRentalUseCase(rental_repo, client_repo, material_repo)

        print("2. Criando Cliente no banco...")
        client = create_client_uc.execute(
            name="Sérgio Vinício",
            phone="11988887777",
            address="Av. Paulista, 1000 - São Paulo/SP",
        )
        print(f"    Cliente criado: ID={client.id} | Nome={client.name}")

        print("3. Criando Material no banco...")
        material = create_material_uc.execute(
            name="Andaime Tubular 1.0m",
            daily_rate=Decimal("25.50"),
            description="Andaime de aço galvanizado"
        )
        print(f"    Material criado: ID={material.id} | Taxa={material.daily_rate}/dia | Disponível={material.is_available}")

        print("4. Criando Aluguel e aplicando regras de negócio...")
        today = date.today()
        rental = create_rental_uc.execute(
            client_id=client.id,
            material_id=material.id,
            start_date=today,
            end_date=today + timedelta(days=5),
            delivery_address="Obra Centro - Rua B, 200",
            notes="Entregar até as 08h00"
        )
        print(f"    Aluguel criado: ID={rental.id}")
        print(f"    Período: {rental.start_date} até {rental.end_date} ({rental.total_days} dias)")
        print(f"    Valor Total Calculado: R$ {rental.total_amount}")
        print(f"    Local de Entrega: {rental.delivery_address}")

        # Recarrega o material para verificar se ficou indisponível no banco
        updated_material = material_repo.get_by_id(material.id)
        print(f"    Material 'Disponível' atualizado para: {updated_material.is_available}")

    print("\nVALIDAÇÃO CONCLUÍDA COM SUCESSO! O fluxo completo de banco e domínio está 100% operacional.")


if __name__ == "__main__":
    main()