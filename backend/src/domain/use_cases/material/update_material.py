# backend/src/domain/use_cases/material/update_material.py

from decimal import Decimal
from typing import Optional
import uuid
from src.domain.entities.material import Material
from src.domain.exceptions.domain_exceptions import EntityNotFoundException, BusinessRuleException
from src.domain.ports.material_repository import MaterialRepositoryPort

class UpdateMaterialUseCase:
    def __init__(self, material_repo: MaterialRepositoryPort) -> None:
        self.material_repo = material_repo

    def execute(
        self,
        material_id: uuid.UUID,
        owner_id: uuid.UUID,
        name: str,
        daily_rate: Decimal,
        description: Optional[str] = None,
        is_available: bool = True,
    ) -> Material:
        # 1. Busca o material validando o ID e o Tenant simultaneamente
        material = self.material_repo.get_by_id(material_id, owner_id=owner_id)
        if not material:
            raise EntityNotFoundException("Material não encontrado.")

        # 2. Validação de Regra de Negócio para o valor da diária
        if daily_rate <= Decimal("0.00"):
            raise BusinessRuleException("O valor da diária do material deve ser maior que zero.")

        # 3. Atualiza os dados da entidade
        material.name = name
        material.daily_rate = daily_rate
        material.description = description
        material.is_available = is_available

        return self.material_repo.update(material)