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

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def connect(self) -> None:
        """Create the connection pool on startup."""
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
            logger.error(f"Failed to create DB pool: {e}")
            raise

    async def disconnect(self) -> None:
        if self._pool:
            await self._pool.close()
            logger.info("Database pool closed")

    @property
    def pool(self) -> asyncpg.Pool:
        if not self._pool:
            raise RuntimeError("Database pool not initialised. Call connect() first.")
        return self._pool

    # ── Schema introspection ───────────────────────────────────────────────────

    async def get_schema(self) -> Dict[str, Any]:
        """
        Returns a structured schema dict:
        { table_name: { columns: [{name, type, nullable, is_pk}], foreign_keys: [...] } }
        """
        async with self.pool.acquire() as conn:
            # Columns
            columns_query = """
                SELECT
                    c.table_name,
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END AS is_primary_key
                FROM information_schema.columns c
                LEFT JOIN (
                    SELECT kcu.table_name, kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                        AND tc.table_schema = kcu.table_schema
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                      AND tc.table_schema = 'public'
                ) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
                WHERE c.table_schema = 'public'
                  AND c.table_name NOT LIKE 'pg_%'
                ORDER BY c.table_name, c.ordinal_position;
            """

            # Foreign keys
            fk_query = """
                SELECT
                    kcu.table_name AS from_table,
                    kcu.column_name AS from_column,
                    ccu.table_name AS to_table,
                    ccu.column_name AS to_column
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_schema = 'public';
            """

            rows = await conn.fetch(columns_query)
            fk_rows = await conn.fetch(fk_query)

            schema: Dict[str, Any] = {}
            for row in rows:
                t = row["table_name"]
                if t not in schema:
                    schema[t] = {"columns": [], "foreign_keys": []}
                schema[t]["columns"].append(
                    {
                        "name": row["column_name"],
                        "type": row["data_type"],
                        "nullable": row["is_nullable"] == "YES",
                        "is_primary_key": row["is_primary_key"],
                    }
                )

            for fk in fk_rows:
                t = fk["from_table"]
                if t in schema:
                    schema[t]["foreign_keys"].append(
                        {
                            "from_column": fk["from_column"],
                            "to_table": fk["to_table"],
                            "to_column": fk["to_column"],
                        }
                    )

            return schema

    # ── Query execution ────────────────────────────────────────────────────────

    async def execute_query(
        self, sql: str
    ) -> Tuple[List[Dict[str, Any]], int, float]:
        """
        Execute a validated SELECT query.
        Returns (rows, total_count, execution_time_ms).
        Enforces timeout and row limit.
        """
        async with self.pool.acquire() as conn:
            start = asyncio.get_event_loop().time()

            try:
                # Wrap in a read-only transaction for extra safety
                async with conn.transaction(readonly=True):
                    rows = await asyncio.wait_for(
                        conn.fetch(
                            f"SELECT * FROM ({sql}) AS __q LIMIT {settings.MAX_RESULT_ROWS + 1}"
                        ),
                        timeout=settings.QUERY_TIMEOUT_SECONDS,
                    )
            except asyncio.TimeoutError:
                raise QueryTimeoutError(
                    f"Query exceeded {settings.QUERY_TIMEOUT_SECONDS}s timeout"
                )

            elapsed = (asyncio.get_event_loop().time() - start) * 1000
            truncated = len(rows) > settings.MAX_RESULT_ROWS
            rows = rows[: settings.MAX_RESULT_ROWS]

            serialized = [self._serialize_row(dict(r)) for r in rows]
            return serialized, len(serialized), round(elapsed, 2)

    # ── Helpers ────────────────────────────────────────────────────────────────

    @staticmethod
    def _serialize_row(row: Dict[str, Any]) -> Dict[str, Any]:
        """Convert non-JSON-serializable types to strings."""
        result = {}
        for k, v in row.items():
            if isinstance(v, (datetime, date)):
                result[k] = v.isoformat()
            elif isinstance(v, Decimal):
                result[k] = float(v)
            elif isinstance(v, bytes):
                result[k] = v.hex()
            else:
                result[k] = v
        return result

    async def health_check(self) -> bool:
        try:
            async with self.pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return True
        except Exception:
            return False


# ── Custom exceptions ──────────────────────────────────────────────────────────

class QueryTimeoutError(Exception):
    pass


# ── Singleton ──────────────────────────────────────────────────────────────────
db_service = DatabaseService()
