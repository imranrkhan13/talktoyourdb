"""Health check router."""
from fastapi import APIRouter
from app.database import db_service
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health():
    db_ok = await db_service.health_check()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        database=db_ok,
    )
