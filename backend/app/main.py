"""
Jalyuzi LionToshkent API - Production Entry Point
FastAPI + Supabase PostgreSQL
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.db.database import init_db, close_db
from app.core.exceptions import global_exception_handler

# Import routers
from app.routers import auth, dealers, workers, categories, materials, orders, messages, exchange, reports, upload, health
from app.routers.messages import router_partners as chat_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    configure_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    try:
        await init_db()
        logger.info("Connected to Supabase PostgreSQL")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
    
    yield
    
    # Shutdown
    await close_db()
    logger.info("Database disconnected")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production API for Jalyuzi LionToshkent mobile app",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (for backward compatibility with existing uploads)
uploads_dir = Path(__file__).parent.parent / "uploads"
if uploads_dir.exists():
    app.mount("/api/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include all routers under /api prefix
api_prefix = "/api"

app.include_router(auth.router, prefix=api_prefix)
app.include_router(dealers.router, prefix=api_prefix)
app.include_router(workers.router, prefix=api_prefix)
app.include_router(categories.router, prefix=api_prefix)
app.include_router(materials.router, prefix=api_prefix)
app.include_router(orders.router, prefix=api_prefix)
app.include_router(messages.router, prefix=api_prefix)
app.include_router(chat_router, prefix=api_prefix)  # /api/chat/partners
app.include_router(exchange.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(upload.router, prefix=api_prefix)
app.include_router(health.router, prefix=api_prefix)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }
