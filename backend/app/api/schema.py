"""Schema API router."""
from fastapi import APIRouter, HTTPException
from app.database import db_service

router = APIRouter()

@router.get("")
async def get_schema():
    """Return the current database schema for display in the UI."""
    try:
        schema = await db_service.get_schema()
        return {"schema": schema, "table_count": len(schema)}
    except Exception as e:
        raise HTTPException(503, f"Could not fetch schema: {e}")
