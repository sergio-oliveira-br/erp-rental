# finance/backend/src/domain/exceptions/domain_exceptions.py

class DomainException(Exception):
    """Exceção base para erros relacionados às regras do domínio."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class EntityNotFoundException(DomainException):
    """Utilizada quando uma entidade solicitada não é encontrada."""
    pass


class BusinessRuleException(DomainException):
    """Utilizada quando uma regra de negócio é violada."""
    pass