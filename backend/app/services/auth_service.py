"""
Authentication service.
"""
from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password, create_access_token
from app.db.base import BaseRepository
from app.schemas.auth import LoginRequest, ProfileUpdateRequest


class AuthService:
    """Auth operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def login(self, request: LoginRequest) -> dict:
        """Authenticate user."""
        user = await self.repo.fetch_one(
            "SELECT * FROM users WHERE email = $1",
            request.email
        )
        
        if not user or not verify_password(request.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email yoki parol noto'g'ri"
            )
        
        token = create_access_token(user["id"], user["email"], user["role"])
        user.pop("password_hash", None)
        
        return {"token": token, "user": user}
    
    async def update_profile(self, user_id: str, request: ProfileUpdateRequest) -> dict:
        """Update user profile."""
        # Verify current password
        current = await self.repo.fetch_one(
            "SELECT * FROM users WHERE id = $1",
            int(user_id)
        )
        
        if not current or not verify_password(request.current_password, current.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Joriy parol noto'g'ri"
            )
        
        updates = []
        params = []
        idx = 1
        
        if request.email and request.email != current["email"]:
            existing = await self.repo.fetch_one(
                "SELECT id FROM users WHERE email = $1 AND id != $2",
                request.email,
                int(user_id)
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Bu email allaqachon mavjud"
                )
            updates.append(f"email = ${idx}")
            params.append(request.email)
            idx += 1
        
        if request.password:
            if len(request.password) < 4:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parol kamida 4 ta belgi"
                )
            updates.append(f"password_hash = ${idx}")
            params.append(hash_password(request.password))
            idx += 1
        
        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O'zgartirish yo'q"
            )
        
        params.append(int(user_id))
        await self.repo.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = ${idx}",
            *params
        )
        
        updated = await self.repo.fetch_one(
            "SELECT * FROM users WHERE id = $1",
            int(user_id)
        )
        
        token = create_access_token(updated["id"], updated["email"], updated["role"])
        updated.pop("password_hash", None)
        
        return {"user": updated, "token": token, "message": "Profil yangilandi"}
    
    async def get_me(self, user_id: str) -> dict:
        """Get current user."""
        user = await self.repo.fetch_one(
            "SELECT * FROM users WHERE id = $1",
            int(user_id)
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"user": user}
