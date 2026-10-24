
from difflib import SequenceMatcher

from src.domain.services.client.client_name_normalizer import normalize_client_name


def _comparison_name(name: str) -> str:
    """Normaliza o nome e remove acentos para comparação."""
    normalized = normalize_client_name(name)

    return (
        normalized
        .replace("Á", "A")
        .replace("À", "A")
        .replace("Â", "A")
        .replace("Ã", "A")
        .replace("É", "E")
        .replace("Ê", "E")
        .replace("Í", "I")
        .replace("Ó", "O")
        .replace("Ô", "O")
        .replace("Õ", "O")
        .replace("Ú", "U")
        .replace("Ü", "U")
        .replace("Ç", "C")
    )


def calculate_name_similarity(
    first_name: str,
    second_name: str,
) -> float:
    """Calcula a similaridade textual entre dois nomes."""
    first = _comparison_name(first_name)
    second = _comparison_name(second_name)

    if not first or not second:
        return 0.0

    return SequenceMatcher(None, first, second).ratio()


def are_names_similar(
    first_name: str,
    second_name: str,
    threshold: float = 0.85,
) -> bool:
    """Identifica possíveis duplicidades por nome ou similaridade."""
    first = _comparison_name(first_name)
    second = _comparison_name(second_name)

    if not first or not second:
        return False

    # Nomes iguais após normalização.
    if first == second:
        return True

    # Nova regra: mesmas três primeiras letras.
    if len(first) >= 3 and len(second) >= 3:
        if first[:3] == second[:3]:
            return True

    # Comparação aproximada para nomes suficientemente longos.
    if min(len(first), len(second)) < 8:
        return False

    return calculate_name_similarity(first, second) >= threshold
