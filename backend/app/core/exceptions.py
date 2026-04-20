"""
Centralized exception handling.
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from app.core.logging import get_logger

logger = get_logger(__name__)


class AppException(HTTPException):
    """Base application exception."""
    pass


class NotFoundException(AppException):
    """Resource not found."""
    def __init__(self, detail: str = "Not found"):
        super().__init__(status_code=404, detail=detail)


class ValidationException(AppException):
    """Validation error."""
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=400, detail=detail)


class PermissionException(AppException):
    """Permission denied."""
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=403, detail=detail)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )
