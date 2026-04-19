"""
Structured logging configuration.
"""
import logging
import sys
from app.core.config import settings


def configure_logging() -> None:
    """Configure application logging."""
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    
    # Third-party log levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
