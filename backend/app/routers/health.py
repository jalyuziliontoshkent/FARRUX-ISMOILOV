"""
Health check router - /api/health
"""
from datetime import datetime, timezone
from fastapi import APIRouter
from app.db.database import db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        is_healthy = await db.health_check()
        return {
            "status": "ok" if is_healthy else "error",
            "database": "connected" if is_healthy else "disconnected",
            "time": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "database": str(e),
            "time": datetime.now(timezone.utc).isoformat()
        }
