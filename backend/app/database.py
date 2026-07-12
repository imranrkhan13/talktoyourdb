"""
Database Service
- Async connection pooling via asyncpg
- Schema introspection
- Safe query execution with timeout + row limits
- Query result serialization
"""

import asyncio
import logging
from datetime import date, datetime
from decimal import Decimal
import os
from typing import Any, Dict, List, Optional, Tuple

import asyncpg

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DatabaseService:
    """Manages the asyncpg connection pool and all DB interactions."""

    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None

    # ──────────────────────────────────────────────────────────────
    # Lifecycle
    # ──────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """Create the asyncpg connection pool."""

        print("=" * 80)
        print("DATABASE_URL env exists:", "DATABASE_URL" in os.environ)
        print("DATABASE_URL env value :", repr(os.environ.get("DATABASE_URL")))
        print("Settings value         :", repr(settings.DATABASE_URL))
        print("All env vars containing DATABASE:")
        for k, v in os.environ.items():
            if "DATABASE" in k:
                print(k, "=", repr(v))
        print("=" * 80)

        try:
            self._pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=2,
                max_size=settings.DB_POOL_SIZE,
                max_inactive_connection_lifetime=300,
                command_timeout=settings.QUERY_TIMEOUT_SECONDS,
            )

            logger.info("Database pool created successfully")

        except Exception as e:
            logger.exception("Failed to create DB pool")
            raise

    async def disconnect(self) -> None:
        if self._pool:
            await self._pool.close()
            logger.info("Database pool closed")

    @property
    def pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database pool not initialised. Call connect() first.")
        return self._pool