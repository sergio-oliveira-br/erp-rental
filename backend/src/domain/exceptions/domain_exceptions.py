# backend/src/domain/exceptions/domain_exceptions.py

class DomainException(Exception):
    """Exceção base para todas as regras de negócio da aplicação."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class EntityNotFoundException(DomainException):
    """Lançada quando um recurso solicitado (Cliente, Material, Aluguel) não existe."""
    pass


class BusinessRuleException(DomainException):
    """Lançada quando uma regra de negócio é violada (ex: material indisponível)."""
    pass


class MaterialUnavailableException(BusinessRuleException):
    """Lançada especificamente quando o material já está alocado."""
    pass