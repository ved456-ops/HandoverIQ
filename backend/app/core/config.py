"""
Application settings loaded from environment variables.
Uses pydantic-settings so every value is type-checked and documented.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # GitHub
    github_token: str = ""

    # AI Providers
    ai_provider: str = "auto"              # "auto", "gemini", or "claude"
    gemini_api_key: str = ""
    anthropic_api_key: str = ""

    # CORS — parsed as a list by splitting on commas
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
