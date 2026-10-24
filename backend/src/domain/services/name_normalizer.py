# backend/src/domain/services/name_normalizer.py

import re
import unicodedata


def normalize_name(name: str) -> str:
    """Padroniza espaços e converte o nome para maiúsculas."""
    return re.sub(r"\s+", " ", name).strip().upper()


def normalize_name_for_comparison(name: str) -> str:
    """Normaliza o nome e remove acentos apenas para comparação."""
    normalized = normalize_name(name)
    decomposed = unicodedata.normalize("NFKD", normalized)

    return "".join(
        char
        for char in decomposed
        if not unicodedata.combining(char)
    )