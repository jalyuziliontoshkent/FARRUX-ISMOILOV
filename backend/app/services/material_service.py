"""
Material service.
"""
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.db.base import BaseRepository
from app.schemas.materials import MaterialCreate, MaterialUpdate
from app.utils.cache import cache


class MaterialService:
    """Material operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def create(self, data: MaterialCreate) -> dict:
        """Create material."""
        now = datetime.now(timezone.utc).isoformat()
        
        material = await self.repo.fetch_one(
            """
            INSERT INTO materials (name, category, category_id, price_per_sqm, stock_quantity, unit, description, image_url, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            """,
            data.name,
            data.category,
            data.category_id,
            data.price_per_sqm,
            data.stock_quantity,
            data.unit,
            data.description,
            data.image_url,
            now
        )
        
        cache.invalidate("materials", "categories", "stats", "alerts")
        return material
    
    async def list_all(self) -> List[dict]:
        """List all materials."""
        cached = cache.get("materials_list")
        if cached:
            return cached
        
        rows = await self.repo.fetch_many(
            """
            SELECT m.*, c.name as category_name 
            FROM materials m 
            LEFT JOIN categories c ON m.category_id = c.id 
            ORDER BY c.name ASC, m.name ASC
            """
        )
        cache.set("materials_list", rows, 60)
        return rows
    
    async def list_by_category(self, category_id: int) -> List[dict]:
        """List by category."""
        cache_key = f"materials_cat_{category_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        rows = await self.repo.fetch_many(
            "SELECT * FROM materials WHERE category_id = $1 ORDER BY name ASC",
            category_id
        )
        cache.set(cache_key, rows, 60)
        return rows
    
    async def update(self, material_id: int, data: MaterialUpdate) -> dict:
        """Update material."""
        updates = []
        params = []
        idx = 1
        
        for field in ["name", "category", "price_per_sqm", "stock_quantity", "description", "image_url", "category_id"]:
            val = getattr(data, field)
            if val is not None:
                updates.append(f"{field} = ${idx}")
                params.append(val)
                idx += 1
        
        if not updates:
            raise HTTPException(status_code=400, detail="No data")
        
        params.append(material_id)
        await self.repo.execute(
            f"UPDATE materials SET {', '.join(updates)} WHERE id = ${idx}",
            *params
        )
        
        cache.invalidate("materials", "categories", "alerts")
        return await self.repo.fetch_one("SELECT * FROM materials WHERE id = $1", material_id)
    
    async def delete(self, material_id: int) -> bool:
        """Delete material."""
        result = await self.repo.execute(
            "DELETE FROM materials WHERE id = $1",
            material_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Not found")
        cache.invalidate("materials", "categories", "stats", "alerts")
        return True
    
    async def get_low_stock(self, threshold: int = 10) -> List[dict]:
        """Get low stock materials."""
        cached = cache.get("alerts_low_stock")
        if cached:
            return cached
        
        rows = await self.repo.fetch_many(
            "SELECT * FROM materials WHERE stock_quantity < $1 ORDER BY stock_quantity ASC",
            threshold
        )
        cache.set("alerts_low_stock", rows, 60)
        return rows
