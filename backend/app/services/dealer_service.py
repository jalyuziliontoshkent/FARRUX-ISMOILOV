"""
Dealer service.
"""
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.core.security import hash_password
from app.db.base import BaseRepository
from app.schemas.users import DealerCreate, DealerUpdate, PaymentCreate
from app.utils.cache import cache


class DealerService:
    """Dealer operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def create(self, data: DealerCreate) -> dict:
        """Create dealer."""
        existing = await self.repo.fetch_one(
            "SELECT id FROM users WHERE email = $1",
            data.email.lower()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email mavjud")
        
        now = datetime.now(timezone.utc).isoformat()
        
        dealer = await self.repo.fetch_one(
            """
            INSERT INTO users (name, email, password_hash, role, phone, address, credit_limit, debt, specialty, created_at)
            VALUES ($1, $2, $3, 'dealer', $4, $5, $6, 0, '', $7)
            RETURNING *
            """,
            data.name,
            data.email.lower(),
            hash_password(data.password),
            data.phone,
            data.address,
            data.credit_limit,
            now
        )
        
        cache.invalidate("dealers")
        return dealer
    
    async def list_all(self) -> List[dict]:
        """List all dealers."""
        cached = cache.get("dealers_list")
        if cached:
            return cached
        
        dealers = await self.repo.fetch_many(
            "SELECT * FROM users WHERE role = 'dealer' ORDER BY created_at DESC"
        )
        cache.set("dealers_list", dealers, 30)
        return dealers
    
    async def update(self, dealer_id: int, data: DealerUpdate) -> dict:
        """Update dealer."""
        updates = []
        params = []
        idx = 1
        
        for field in ["name", "phone", "address", "credit_limit"]:
            val = getattr(data, field)
            if val is not None:
                updates.append(f"{field} = ${idx}")
                params.append(val)
                idx += 1
        
        if not updates:
            raise HTTPException(status_code=400, detail="No data")
        
        params.append(dealer_id)
        await self.repo.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE id = ${idx}",
            *params
        )
        
        cache.invalidate("dealers")
        return await self.repo.fetch_one("SELECT * FROM users WHERE id = $1", dealer_id)
    
    async def delete(self, dealer_id: int) -> bool:
        """Delete dealer."""
        result = await self.repo.execute(
            "DELETE FROM users WHERE id = $1 AND role = 'dealer'",
            dealer_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Not found")
        cache.invalidate("dealers", "chat", "stats")
        return True
    
    async def add_payment(self, dealer_id: int, data: PaymentCreate) -> dict:
        """Add payment."""
        if data.amount <= 0:
            raise HTTPException(status_code=400, detail="Summa 0 dan katta bo'lishi kerak")
        
        dealer = await self.repo.fetch_one(
            "SELECT * FROM users WHERE id = $1 AND role = 'dealer'",
            dealer_id
        )
        if not dealer:
            raise HTTPException(status_code=404, detail="Diler topilmadi")
        
        now = datetime.now(timezone.utc).isoformat()
        
        await self.repo.execute(
            "INSERT INTO payments (dealer_id, amount, note, created_at) VALUES ($1, $2, $3, $4)",
            dealer_id,
            data.amount,
            data.note,
            now
        )
        
        new_debt = max(0, (dealer.get("debt") or 0) - data.amount)
        await self.repo.execute(
            "UPDATE users SET debt = $1 WHERE id = $2",
            new_debt,
            dealer_id
        )
        
        cache.invalidate("dealers", "stats")
        return {"message": "To'lov qabul qilindi", "new_debt": round(new_debt, 2), "paid": data.amount}
    
    async def get_payments(self, dealer_id: int) -> List[dict]:
        """Get dealer payments."""
        return await self.repo.fetch_many(
            "SELECT * FROM payments WHERE dealer_id = $1 ORDER BY created_at DESC",
            dealer_id
        )
