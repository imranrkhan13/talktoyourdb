"""
Query History Service
- Persists queries, results, and metadata to PostgreSQL
- Provides paginated history retrieval
- Stores execution stats for analytics
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.database import db_service

logger = logging.getLogger(__name__)


class HistoryService:
    """Manages query history persistence and retrieval."""

    async def ensure_table(self) -> None:
        """Create the query_history table if it doesn't exist."""
        async with db_service.pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS query_history (
                    id          SERIAL PRIMARY KEY,
                    question    TEXT NOT NULL,
                    sql         TEXT NOT NULL,
                    explanation TEXT,
                    row_count   INTEGER,
                    exec_ms     FLOAT,
                    status      VARCHAR(16) NOT NULL DEFAULT 'success',
                    error_msg   TEXT,
                    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_qh_created
                    ON query_history (created_at DESC);
            """)

    async def save(
        self,
        question: str,
        sql: str,
        explanation: Optional[str],
        row_count: Optional[int],
        exec_ms: Optional[float],
        status: str = "success",
        error_msg: Optional[str] = None,
    ) -> int:
        """Persist a query execution record. Returns the new record id."""
        async with db_service.pool.acquire() as conn:
            row_id = await conn.fetchval(
                """
                INSERT INTO query_history
                    (question, sql, explanation, row_count, exec_ms, status, error_msg)
                VALUES ($1,$2,$3,$4,$5,$6,$7)
                RETURNING id
                """,
                question, sql, explanation, row_count, exec_ms, status, error_msg,
            )
        return row_id

    async def list(
        self, limit: int = 20, offset: int = 0
    ) -> Dict[str, Any]:
        """Return paginated history records, newest first."""
        async with db_service.pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, question, sql, explanation, row_count,
                       exec_ms, status, error_msg, created_at
                FROM query_history
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                """,
                limit, offset,
            )
            total = await conn.fetchval("SELECT COUNT(*) FROM query_history")

        return {
            "items": [dict(r) for r in rows],
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get(self, history_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a single history record by id."""
        async with db_service.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM query_history WHERE id = $1", history_id
            )
        return dict(row) if row else None

    async def delete(self, history_id: int) -> bool:
        async with db_service.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM query_history WHERE id = $1", history_id
            )
        return result == "DELETE 1"


history_service = HistoryService()
