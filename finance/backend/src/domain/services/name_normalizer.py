# finance/backend/src/domain/services/name_normalizer.py

import re
import unicodedata


def normalize_name(name: str) -> str:
    """
    Normaliza um nome para apresentação e armazenamento.

    - Remove espaços no início e no fim.
    - Substitui sequências de espaços por um único espaço.
    - Converte o nome para maiúsculas.
    - Mantém os acentos.
    """

    return re.sub(r"\s+", " ", name).strip().upper()


def normalize_name_for_comparison(name: str) -> str:
    """
    Gera uma versão do nome para comparação.

    Além da normalização habitual, remove os acentos.
    Não altera o nome original que será apresentado ao utilizador.
    """

    normalized = normalize_name(name)

    decomposed = unicodedata.normalize("NFKD", normalized)

    return "".join(
        char
        for char in decomposed
        if not unicodedata.combining(char)
    )
