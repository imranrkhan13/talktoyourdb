"""
Queries API Router
Endpoints:
  POST /api/queries/generate     — NL → SQL + explanation (no execution)
  POST /api/queries/execute      — Execute a provided SQL query
  POST /api/queries/run          — Full pipeline: NL → SQL → execute (with auto-correct)
  POST /api/queries/validate     — Validate SQL safety without executing
  GET  /api/queries/history      — Paginated query history
  GET  /api/queries/history/{id} — Single history record
  DELETE /api/queries/history/{id}
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import get_settings
from app.database import db_service, QueryTimeoutError
from app.models.schemas import (
    ExecuteQueryRequest,
    ExecuteQueryResponse,
    FullPipelineRequest,
    FullPipelineResponse,
    GenerateQueryRequest,
    GenerateQueryResponse,
    HistoryItem,
    HistoryListResponse,
    QueryResult,
    ValidationResponse,
)
from app.services.ai_service import ai_service
from app.services.history_service import history_service
from app.services.validation import sql_validator

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter()


# ── Helper ─────────────────────────────────────────────────────────────────────

async def _get_schema() -> Dict[str, Any]:
    """Fetch current DB schema; raises 503 on failure."""
    try:
        return await db_service.get_schema()
    except Exception as e:
        logger.error(f"Schema fetch failed: {e}")
        raise HTTPException(503, "Database schema unavailable")


def _build_query_result(
    rows: List[Dict], row_count: int, exec_ms: float
) -> QueryResult:
    columns = list(rows[0].keys()) if rows else []
    return QueryResult(
        columns=columns,
        rows=rows,
        row_count=row_count,
        exec_ms=exec_ms,
        truncated=row_count >= settings.MAX_RESULT_ROWS,
    )


# ── POST /generate ─────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateQueryResponse)
async def generate_query(body: GenerateQueryRequest):
    """
    Convert natural language to SQL and generate an explanation.
    Does NOT execute the query — safe to call for preview.
    """
    schema = await _get_schema()

    try:
        sql = await ai_service.generate_sql(body.question, schema)
    except RuntimeError as e:
        raise HTTPException(502, f"AI service error: {e}")

    # Validate before returning (warn but don't block — UI shows the SQL)
    validation = sql_validator.validate(sql)
    if not validation.is_valid:
        logger.warning(f"AI generated invalid SQL: {validation.errors}")
        raise HTTPException(
            422,
            detail={
                "message": "AI generated an unsafe query. Please rephrase your question.",
                "errors": validation.errors,
                "sql": sql,
            },
        )

    try:
        explanation = await ai_service.explain_sql(sql)
    except Exception as e:
        logger.warning(f"Explanation failed (non-fatal): {e}")
        explanation = "Query generated successfully."

    return GenerateQueryResponse(sql=sql, explanation=explanation)


# ── POST /execute ──────────────────────────────────────────────────────────────

@router.post("/execute", response_model=ExecuteQueryResponse)
async def execute_query(body: ExecuteQueryRequest):
    """
    Validate and execute a provided SQL query.
    Only SELECT queries are allowed.
    """
    validation = sql_validator.validate(body.sql)
    if not validation.is_valid:
        raise HTTPException(
            400,
            detail={
                "message": "Query failed safety validation.",
                "errors": validation.errors,
            },
        )

    try:
        rows, row_count, exec_ms = await db_service.execute_query(validation.cleaned_sql)
    except QueryTimeoutError as e:
        raise HTTPException(408, f"Query timed out: {e}")
    except Exception as e:
        error_str = str(e)
        logger.error(f"Query execution error: {error_str}")
        # Save failed attempt to history
        if body.save_to_history and body.question:
            await history_service.save(
                question=body.question or "",
                sql=body.sql,
                explanation=None,
                row_count=None,
                exec_ms=None,
                status="error",
                error_msg=error_str[:500],
            )
        raise HTTPException(
            400,
            detail={
                "message": "Query execution failed.",
                "error": error_str,
                "sql": body.sql,
            },
        )

    try:
        explanation = await ai_service.explain_sql(body.sql)
    except Exception:
        explanation = None

    history_id = None
    if body.save_to_history:
        history_id = await history_service.save(
            question=body.question or body.sql,
            sql=body.sql,
            explanation=explanation,
            row_count=row_count,
            exec_ms=exec_ms,
        )

    result = _build_query_result(rows, row_count, exec_ms)
    return ExecuteQueryResponse(
        sql=body.sql,
        explanation=explanation,
        result=result,
        history_id=history_id,
        warnings=validation.warnings,
    )


# ── POST /run (full pipeline) ──────────────────────────────────────────────────

@router.post("/run", response_model=FullPipelineResponse)
async def run_pipeline(body: FullPipelineRequest):
    """
    Full pipeline: Natural language → SQL → validate → execute → explain.
    Includes auto-correction loop on execution failure.
    """
    schema = await _get_schema()
    auto_corrected = False

    # Step 1: Generate SQL
    try:
        sql = await ai_service.generate_sql(body.question, schema)
    except RuntimeError as e:
        raise HTTPException(502, f"AI service error: {e}")

    # Step 2: Validate
    validation = sql_validator.validate(sql)
    if not validation.is_valid:
        raise HTTPException(
            422,
            detail={
                "message": "AI generated an unsafe query. Try rephrasing.",
                "errors": validation.errors,
                "sql": sql,
            },
        )

    # Step 3: Generate explanation (parallel-ish — don't block on it)
    try:
        explanation = await ai_service.explain_sql(sql)
    except Exception:
        explanation = "Query generated successfully."

    # Step 4 (optional): Execute
    result = None
    if body.auto_execute:
        rows, row_count, exec_ms = None, None, None
        last_error = None

        for attempt in range(1, settings.AI_RETRY_ATTEMPTS + 1):
            try:
                rows, row_count, exec_ms = await db_service.execute_query(
                    validation.cleaned_sql
                )
                break  # success
            except QueryTimeoutError as e:
                raise HTTPException(408, f"Query timed out: {e}")
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Execution attempt {attempt} failed: {last_error}")

                if attempt < settings.AI_RETRY_ATTEMPTS:
                    # Auto-correction loop
                    try:
                        corrected_sql = await ai_service.correct_sql(
                            sql, last_error, schema
                        )
                        correction_validation = sql_validator.validate(corrected_sql)
                        if correction_validation.is_valid:
                            sql = corrected_sql
                            validation = correction_validation
                            explanation = await ai_service.explain_sql(sql)
                            auto_corrected = True
                            logger.info(f"Auto-corrected SQL on attempt {attempt}")
                    except Exception as ce:
                        logger.warning(f"Auto-correction failed: {ce}")

        if rows is None:
            # All attempts exhausted
            await history_service.save(
                question=body.question,
                sql=sql,
                explanation=explanation,
                row_count=None,
                exec_ms=None,
                status="error",
                error_msg=str(last_error)[:500],
            )
            raise HTTPException(
                400,
                detail={
                    "message": "Query could not be executed after auto-correction.",
                    "error": last_error,
                    "sql": sql,
                    "explanation": explanation,
                },
            )

        result = _build_query_result(rows, row_count, exec_ms)

    history_id = await history_service.save(
        question=body.question,
        sql=sql,
        explanation=explanation,
        row_count=result.row_count if result else None,
        exec_ms=result.exec_ms if result else None,
        status="success",
    )

    return FullPipelineResponse(
        question=body.question,
        sql=sql,
        explanation=explanation,
        result=result,
        history_id=history_id,
        warnings=validation.warnings,
        auto_corrected=auto_corrected,
    )


# ── POST /validate ─────────────────────────────────────────────────────────────

@router.post("/validate", response_model=ValidationResponse)
async def validate_query(body: ExecuteQueryRequest):
    """Validate a SQL query for safety without executing it."""
    result = sql_validator.validate(body.sql)
    return ValidationResponse(
        is_valid=result.is_valid,
        errors=result.errors,
        warnings=result.warnings,
    )


# ── GET /history ───────────────────────────────────────────────────────────────

@router.get("/history", response_model=HistoryListResponse)
async def list_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Return paginated query history, newest first."""
    data = await history_service.list(limit=limit, offset=offset)
    return HistoryListResponse(**data)


@router.get("/history/{history_id}", response_model=HistoryItem)
async def get_history_item(history_id: int):
    item = await history_service.get(history_id)
    if not item:
        raise HTTPException(404, "History record not found")
    return HistoryItem(**item)


@router.delete("/history/{history_id}", status_code=204)
async def delete_history_item(history_id: int):
    deleted = await history_service.delete(history_id)
    if not deleted:
        raise HTTPException(404, "History record not found")
