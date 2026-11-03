# finance/backend/src/domain/services/name_similarity.py

from difflib import SequenceMatcher

from src.domain.services.name_normalizer import (
    normalize_name_for_comparison,
)


def calculate_name_similarity(first_name: str, second_name: str) -> float:
    """
    Calcula a similaridade entre dois nomes normalizados.
    """

    first = normalize_name_for_comparison(first_name)
    second = normalize_name_for_comparison(second_name)

    if not first or not second:
        return 0.0

    return SequenceMatcher(None, first, second).ratio()


def are_names_similar(
    first_name: str,
    second_name: str,
    threshold: float = 0.85,
) -> bool:
    """
    Verifica se dois nomes atingem o nível de similaridade definido.
    """

    if not 0 <= threshold <= 1:
        raise ValueError("O threshold deve estar entre 0 e 1.")

    similarity = calculate_name_similarity(first_name, second_name)

    return similarity >= threshold
