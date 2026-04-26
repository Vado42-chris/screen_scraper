from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the local backend.

    Only safe defaults live in Git. Machine-specific values belong in ignored
    config/local.yaml or environment variables later.
    """

    app_name: str = "screen_scraper"
    environment: str = Field(default="development")
    ollama_base_url: str = Field(default="http://localhost:11434")
    runtime_root: Path = Field(default=Path("_runtime"))
    sqlite_path: Path = Field(default=Path("_runtime/events.sqlite3"))

    model_config = SettingsConfigDict(env_prefix="SCREEN_SCRAPER_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.runtime_root.mkdir(parents=True, exist_ok=True)
    settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    return settings
