# backend/src/infrastructure/config/settings.py

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Localiza dinamicamente a pasta raiz do backend/ onde o arquivo .env deve estar
ROOT_DIR = Path(__file__).resolve().parents[4]
ENV_PATH = ROOT_DIR / ".env"

class Settings(BaseSettings):
    # Tipados sem valor padrão: o Pydantic lança erro se não encontrar no .env ou no sistema
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    model_config = SettingsConfigDict(env_file=ENV_PATH, env_file_encoding="utf-8", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()