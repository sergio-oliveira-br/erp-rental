# finance/backend/src/infrastructure/config/settings.py

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Localiza a raiz do backend do Finance.
# Assim, o arquivo .env será encontrado independentemente
# do diretório de onde a aplicação for executada.
BACKEND_DIR = Path(__file__).resolve().parents[3]

ENV_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """
    Centraliza as configurações da aplicação Finance.

    O Pydantic valida automaticamente os valores carregados
    do arquivo .env ou das variáveis de ambiente do sistema.
    """

    # URL de conexão exclusiva com o banco Neon do Finance.
    DATABASE_URL: str

    # Endereço base da API do ERP.
    # Será utilizado para consultar a identidade do usuário.
    ERP_API_BASE_URL: str

    # Exibe os comandos SQL no terminal quando habilitado.
    DB_ECHO: bool = False

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        """Retorna a URL de conexão com o banco."""
        return self.DATABASE_URL


# Instância única das configurações da aplicação.
settings = Settings()

