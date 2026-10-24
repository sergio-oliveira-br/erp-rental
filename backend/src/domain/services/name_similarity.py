# backend/src/domain/services/name_similarity.py

from difflib import SequenceMatcher

from src.domain.services.name_normalizer import normalize_name_for_comparison


def calculate_name_similarity(first_name: str, second_name: str) -> float:
    """Calcula a similaridade entre dois nomes normalizados."""
    first = normalize_name_for_comparison(first_name)
    second = normalize_name_for_comparison(second_name)

    if not first or not second:
        return 0.0

    return SequenceMatcher(None, first, second).ratio()


def are_names_similar(first_name: str, second_name: str, threshold: float = 0.85) -> bool:
    """Identifica nomes iguais ou potencialmente duplicados."""
    first = normalize_name_for_comparison(first_name)
    second = normalize_name_for_comparison(second_name)

    if not first or not second:
        return False

    if first == second:
        return True

    # Mantém a regra atual do domínio de clientes.
    if len(first) >= 3 and len(second) >= 3:
        if first[:3] == second[:3]:
            return True

    # Evita comparações aproximadas entre nomes muito curtos.
    if min(len(first), len(second)) < 8:
        return False

    return calculate_name_similarity(first, second) >= threshold