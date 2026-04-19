"""
Worker service.
"""
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.core.security import hash_password
from app.db.base import BaseRepository
from app.schemas.users import WorkerCreate
from app.utils.cache import cache


class WorkerService:
    """Worker operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def create(self, data: WorkerCreate) -> dict:
        """Create worker."""
        existing = await self.repo.fetch_one(
            "SELECT id FROM users WHERE email = $1",
            data.email.lower()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email mavjud")
        
        now = datetime.now(timezone.utc).isoformat()
        
        worker = await self.repo.fetch_one(
            """
            INSERT INTO users (name, email, password_hash, role, phone, address, credit_limit, debt, specialty, created_at)
            VALUES ($1, $2, $3, 'worker', $4, '', 0, 0, $5, $6)
            RETURNING *
            """,
            data.name,
            data.email.lower(),
            hash_password(data.password),
            data.phone,
            data.specialty,
            now
        )
        
        cache.invalidate("workers")
        return worker
    
    async def list_all(self) -> List[dict]:
        """List all workers."""
        cached = cache.get("workers_list")
        if cached:
            return cached
        
        workers = await self.repo.fetch_many(
            "SELECT * FROM users WHERE role = 'worker' ORDER BY created_at DESC"
        )
        cache.set("workers_list", workers, 30)
        return workers
    
    async def delete(self, worker_id: int) -> bool:
        """Delete worker."""
        result = await self.repo.execute(
            "DELETE FROM users WHERE id = $1 AND role = 'worker'",
            worker_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Not found")
        cache.invalidate("workers", "stats")
        return True
