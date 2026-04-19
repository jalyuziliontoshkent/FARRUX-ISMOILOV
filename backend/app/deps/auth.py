"""
Auth dependencies.
"""
from fastapi import HTTPException, status, Request, Depends
from app.core.security import verify_token
from app.core.logging import get_logger
from app.db.database import db

logger = get_logger(__name__)


async def get_current_user(request: Request) -> dict:
    """Get current user from JWT."""
    auth = request.headers.get("Authorization", "")
    
    if not auth.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = auth[7:]
    
    try:
        user_id, email, role = verify_token(token)
        
        # Get fresh user data
        async with db.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1",
                int(user_id)
            )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_dict = dict(user)
        user_dict["id"] = str(user_dict["id"])
        user_dict.pop("password_hash", None)
        
        return user_dict
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Require admin role."""
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


async def require_worker(user: dict = Depends(get_current_user)) -> dict:
    """Require worker role."""
    if user.get("role") != "worker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker access required"
        )
    return user
