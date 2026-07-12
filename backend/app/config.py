from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"

    DATABASE_URL: str = Field(
        default="postgresql://postgres:password@localhost:5432/sql_builder",
        validation_alias="DATABASE_URL",
    )

    DB_POOL_SIZE: int = 5
    DB_POOL_TIMEOUT: int = 30

    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    COHERE_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    AI_RETRY_ATTEMPTS: int = 3

    QUERY_TIMEOUT_SECONDS: int = 10
    MAX_RESULT_ROWS: int = 500
    MAX_INPUT_LENGTH: int = 2000

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://talktoyourdb.vercel.app",
    ]


@lru_cache
def get_settings():
    return Settings()