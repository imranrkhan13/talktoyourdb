"""
AI SQL Query Builder - FastAPI Backend
Production-ready application with security, logging, and clean architecture.
"""

import logging
import time
from contextlib import asynccontextmanager
from app.services.history_service import history_service


from backend.app.services import history_service
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api import queries, health, schema
from app.utils.logger import setup_logger
from app.database import db_service

# ── Logging ────────────────────────────────────────────────────────────────────
setup_logger()
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI SQL Query Builder...")
    await db_service.connect()
    await history_service.ensure_table()
    yield
    logger.info("Shutting down...")
    await db_service.disconnect()


# ── App factory ────────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="AI SQL Query Builder",
        description="Convert natural language to SQL with safety guarantees",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ──────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173", "https://talktoyourdb.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Request timing middleware ───────────────────────────────────────────────
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start
        response.headers["X-Process-Time"] = f"{duration:.4f}"
        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} [{duration:.3f}s]"
        )
        return response

    # ── Global exception handler ────────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please try again."},
        )

    # ── Routers ────────────────────────────────────────────────────────────────
    app.include_router(health.router, prefix="/api", tags=["Health"])
    app.include_router(queries.router, prefix="/api/queries", tags=["Queries"])
    app.include_router(schema.router, prefix="/api/schema", tags=["Schema"])

    return app


app = create_app()
