# backend/src/domain/services/client/client_name_normalizer.py

import re


def normalize_client_name(name: str) -> str:
    """
    Padroniza o nome do cliente:
    - remove espaços excedentes;
    - converte o texto para maiúsculas;
    - preserva acentos e caracteres válidos.
    """
    return re.sub(r"\s+", " ", name).strip().upper()