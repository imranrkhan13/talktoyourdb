"""
Application configuration — reads from environment variables.
Never hardcode secrets; use .env files locally or secrets managers in production.
"""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ────────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/sql_builder"
    DB_POOL_SIZE: int = 5
    DB_POOL_TIMEOUT: int = 30

    # ── AI providers — set whichever you have; first available wins ────────────
    GEMINI_API_KEY:     str = ""   # Google Gemini (free tier available)
    GROQ_API_KEY:       str = ""   # Groq / Llama (free tier available)
    COHERE_API_KEY:     str = ""   # Cohere (free tier available)
    MISTRAL_API_KEY:    str = ""   # Mistral (paid)
    OPENROUTER_API_KEY: str = ""   # OpenRouter (has free models)
    OPENAI_API_KEY:     str = ""   # OpenAI (optional fallback)
    AI_RETRY_ATTEMPTS:  int = 3

    # ── Query safety ───────────────────────────────────────────────────────────
    QUERY_TIMEOUT_SECONDS: int = 10
    MAX_RESULT_ROWS: int = 500
    MAX_INPUT_LENGTH: int = 2000

    # ── Allowed origins (CORS) ─────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
