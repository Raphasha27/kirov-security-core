from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Kirov Security Core"
    app_version: str = "1.0.0"
    debug: bool = False
    database_url: str = Field(default="sqlite+aiosqlite:///./kirov_core.db")
    jwt_secret: str = Field(
        default="",
        description="JWT signing secret. Must be set in production via env var KC_JWT_SECRET.",
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["http://localhost:3000"]
    openai_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    rate_limit_per_minute: int = 60
    log_level: str = "INFO"
    model_config = {"env_prefix": "KC_", "env_file": ".env"}

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        stripped = v.strip() if v else ""
        if (
            not stripped
            or "placeholder" in stripped.lower()
            or "change" in stripped.lower()
        ):
            raise ValueError(
                "JWT_SECRET must be set and must not be a placeholder. "
                "Set the KC_JWT_SECRET environment variable or add it to your .env file."
            )
        return stripped


settings = Settings()
