# backend/src/domain/use_cases/material/create_material.py

from decimal import Decimal
from typing import Optional
import uuid

from src.domain.entities.material import Material
from src.domain.exceptions.domain_exceptions import BusinessRuleException
from src.domain.ports.material_repository import MaterialRepositoryPort


class CreateMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort):
        self.material_repo = material_repo

    def execute(
        self,
        name: str,
        daily_rate: Decimal,
        owner_id: uuid.UUID,
        description: Optional[str] = None
    ) -> Material:
        # 1. Validação de Regra de Negócio
        if daily_rate <= Decimal("0.00"):
            raise BusinessRuleException("O valor da diária do material deve ser maior que zero.")

        # 2. Instanciação da Entidade vinculada ao Tenant
        material = Material(
            name=name,
            daily_rate=daily_rate,
            owner_id=owner_id,
            description=description
        )

        # 3. Persistência através da Porta
        return self.material_repo.save(material)