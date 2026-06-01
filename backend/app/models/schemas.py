"""
Pydantic models for request validation and response serialization.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ── Request models ─────────────────────────────────────────────────────────────

class GenerateQueryRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Natural language question to convert to SQL",
        examples=["Show top 5 users by revenue last month"],
    )

    @field_validator("question")
    @classmethod
    def sanitize_question(cls, v: str) -> str:
        # Strip control characters; collapse excessive whitespace
        import re
        v = re.sub(r"[\x00-\x1f\x7f]", "", v)
        v = re.sub(r"\s+", " ", v).strip()
        return v


class ExecuteQueryRequest(BaseModel):
    sql: str = Field(
        ...,
        min_length=7,
        max_length=10000,
        description="SQL query to execute (must be SELECT)",
    )
    question: Optional[str] = Field(
        None, description="Original natural language question for history"
    )
    save_to_history: bool = Field(True, description="Persist this execution")


class FullPipelineRequest(BaseModel):
    """Single-step: NL → SQL → execute → explain."""
    question: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        examples=["Which products had the most orders this week?"],
    )
    auto_execute: bool = Field(
        True, description="Execute the generated SQL immediately"
    )

    @field_validator("question")
    @classmethod
    def sanitize_question(cls, v: str) -> str:
        import re
        v = re.sub(r"[\x00-\x1f\x7f]", "", v)
        return re.sub(r"\s+", " ", v).strip()


# ── Response models ────────────────────────────────────────────────────────────

class ColumnMeta(BaseModel):
    name: str
    type: str
    nullable: bool
    is_primary_key: bool


class TableSchema(BaseModel):
    columns: List[ColumnMeta]
    foreign_keys: List[Dict[str, str]] = []


class QueryResult(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    exec_ms: float
    truncated: bool = False


class GenerateQueryResponse(BaseModel):
    sql: str
    explanation: str


class ExecuteQueryResponse(BaseModel):
    sql: str
    explanation: Optional[str]
    result: QueryResult
    history_id: Optional[int] = None
    warnings: List[str] = []


class FullPipelineResponse(BaseModel):
    question: str
    sql: str
    explanation: str
    result: Optional[QueryResult] = None
    history_id: Optional[int] = None
    warnings: List[str] = []
    auto_corrected: bool = False


class HistoryItem(BaseModel):
    id: int
    question: str
    sql: str
    explanation: Optional[str]
    row_count: Optional[int]
    exec_ms: Optional[float]
    status: str
    error_msg: Optional[str]
    created_at: datetime


class HistoryListResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    limit: int
    offset: int


class ValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]


class HealthResponse(BaseModel):
    status: str
    database: bool
    version: str = "1.0.0"
