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
from typing import Any, Dict, List, Optional, Tuple

import asyncpg

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DatabaseService:
    """Manages the asyncpg connection pool and all DB interactions."""

    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def connect(self) -> None:
        """Create the asyncpg connection pool."""

        logger.info("=" * 80)
        logger.info("Connecting to PostgreSQL...")
        logger.info("DATABASE_URL = %s", settings.DATABASE_URL)
        logger.info("=" * 80)

        try:
            self._pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=2,
                max_size=settings.DB_POOL_SIZE,
                max_inactive_connection_lifetime=300,
                command_timeout=settings.QUERY_TIMEOUT_SECONDS,
            )

            logger.info("✅ Database pool created successfully")

        except Exception:
            logger.exception("❌ Failed to create database pool")
            raise

    async def disconnect(self) -> None:
        """Close the connection pool."""

        if self._pool:
            await self._pool.close()
            logger.info("Database pool closed")

    @property
    def pool(self) -> asyncpg.Pool:
        if self._pool is None:
            raise RuntimeError("Database pool was never initialized")
        return self._pool

    # ------------------------------------------------------------------
    # Schema Introspection
    # ------------------------------------------------------------------

    async def get_schema(self) -> Dict[str, Any]:
        """
        Returns

        {
            table_name: {
                columns: [],
                foreign_keys: []
            }
        }
        """

        async with self.pool.acquire() as conn:

            columns_query = """
                SELECT
                    c.table_name,
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    CASE
                        WHEN pk.column_name IS NOT NULL THEN TRUE
                        ELSE FALSE
                    END AS is_primary_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT
                        kcu.table_name,
                        kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                      ON tc.constraint_name = kcu.constraint_name
                     AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type='PRIMARY KEY'
                      AND tc.table_schema='public'
                ) pk
                  ON c.table_name=pk.table_name
                 AND c.column_name=pk.column_name
                WHERE c.table_schema='public'
                ORDER BY c.table_name,c.ordinal_position;
            """

            fk_query = """
                SELECT
                    kcu.table_name AS from_table,
                    kcu.column_name AS from_column,
                    ccu.table_name AS to_table,
                    ccu.column_name AS to_column
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name=kcu.constraint_name
                   AND tc.table_schema=kcu.table_schema
                JOIN information_schema.constraint_column_usage ccu
                    ON tc.constraint_name=ccu.constraint_name
                   AND tc.table_schema=ccu.table_schema
                WHERE tc.constraint_type='FOREIGN KEY'
                  AND tc.table_schema='public';
            """

            rows = await conn.fetch(columns_query)
            fk_rows = await conn.fetch(fk_query)

        schema: Dict[str, Any] = {}

        for row in rows:

            table = row["table_name"]

            if table not in schema:
                schema[table] = {
                    "columns": [],
                    "foreign_keys": [],
                }

            schema[table]["columns"].append(
                {
                    "name": row["column_name"],
                    "type": row["data_type"],
                    "nullable": row["is_nullable"] == "YES",
                    "is_primary_key": row["is_primary_key"],
                }
            )

        for fk in fk_rows:

            table = fk["from_table"]

            if table in schema:
                schema[table]["foreign_keys"].append(
                    {
                        "from_column": fk["from_column"],
                        "to_table": fk["to_table"],
                        "to_column": fk["to_column"],
                    }
                )

        return schema

    # ------------------------------------------------------------------
    # Query Execution
    # ------------------------------------------------------------------

    async def execute_query(
        self,
        sql: str,
    ) -> Tuple[List[Dict[str, Any]], int, float]:

        async with self.pool.acquire() as conn:

            start = asyncio.get_running_loop().time()

            try:

                async with conn.transaction(readonly=True):

                    rows = await asyncio.wait_for(
                        conn.fetch(
                            f"""
                            SELECT *
                            FROM ({sql}) AS __q
                            LIMIT {settings.MAX_RESULT_ROWS + 1}
                            """
                        ),
                        timeout=settings.QUERY_TIMEOUT_SECONDS,
                    )

            except asyncio.TimeoutError:
                raise QueryTimeoutError(
                    f"Query exceeded {settings.QUERY_TIMEOUT_SECONDS} seconds"
                )

            elapsed = (
                asyncio.get_running_loop().time() - start
            ) * 1000

            rows = rows[: settings.MAX_RESULT_ROWS]

            serialized = [
                self._serialize_row(dict(r))
                for r in rows
            ]

            return (
                serialized,
                len(serialized),
                round(elapsed, 2),
            )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _serialize_row(
        row: Dict[str, Any],
    ) -> Dict[str, Any]:

        result = {}

        for key, value in row.items():

            if isinstance(value, (datetime, date)):
                result[key] = value.isoformat()

            elif isinstance(value, Decimal):
                result[key] = float(value)

            elif isinstance(value, bytes):
                result[key] = value.hex()

            else:
                result[key] = value

        return result

    async def health_check(self) -> bool:

        try:
            async with self.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return True

        except Exception:
            logger.exception("Health check failed")
            return False


class QueryTimeoutError(Exception):
    """Raised when a SQL query exceeds the configured timeout."""

    pass


db_service = DatabaseService()