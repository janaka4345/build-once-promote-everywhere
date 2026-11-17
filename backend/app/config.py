from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    """Host-run API settings. DATABASE_URL is required; missing/empty fails fast."""

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE if _ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str
    APP_ENV: str = ""

    @field_validator("DATABASE_URL")
    @classmethod
    def database_url_must_be_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("DATABASE_URL is missing or empty")
        return value.strip()


@lru_cache
def get_settings() -> Settings:
    return Settings()
