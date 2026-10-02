# backend/src/infrastructure/config/settings.py

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Tipados sem valor padrão: o Pydantic lança erro se não encontrar no .env ou no sistema
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    # Valores de infraestrutura com fallback seguro apenas para execução local
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()