"""
Category service.
"""
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from app.db.base import BaseRepository
from app.schemas.categories import CategoryCreate, CategoryUpdate
from app.utils.cache import cache


class CategoryService:
    """Category operations."""
    
    def __init__(self):
        self.repo = BaseRepository()
    
    async def create(self, data: CategoryCreate) -> dict:
        """Create category."""
        now = datetime.now(timezone.utc).isoformat()
        
        category = await self.repo.fetch_one(
            """
            INSERT INTO categories (name, description, image_url, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            data.name,
            data.description,
            data.image_url,
            now
        )
        
        cache.invalidate("categories", "materials")
        return category
    
    async def list_all(self) -> List[dict]:
        """List all categories with material count."""
        cached = cache.get("categories_list")
        if cached:
            return cached
        
        rows = await self.repo.fetch_many(
            "SELECT * FROM categories ORDER BY name ASC"
        )
        
        for cat in rows:
            count = await self.repo.fetchval(
                "SELECT COUNT(*) FROM materials WHERE category_id = $1",
                int(cat["id"])
            )
            cat["material_count"] = count
        
        cache.set("categories_list", rows, 60)
        return rows
    
    async def update(self, category_id: int, data: CategoryUpdate) -> dict:
        """Update category."""
        updates = []
        params = []
        idx = 1
        
        for field in ["name", "description", "image_url"]:
            val = getattr(data, field)
            if val is not None:
                updates.append(f"{field} = ${idx}")
                params.append(val)
                idx += 1
        
        if not updates:
            raise HTTPException(status_code=400, detail="No data")
        
        params.append(category_id)
        await self.repo.execute(
            f"UPDATE categories SET {', '.join(updates)} WHERE id = ${idx}",
            *params
        )
        
        cache.invalidate("categories", "materials")
        return await self.repo.fetch_one("SELECT * FROM categories WHERE id = $1", category_id)
    
    async def delete(self, category_id: int) -> bool:
        """Delete category."""
        count = await self.repo.fetchval(
            "SELECT COUNT(*) FROM materials WHERE category_id = $1",
            category_id
        )
        
        if count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Bu kategoriyada {count} ta mahsulot bor"
            )
        
        result = await self.repo.execute(
            "DELETE FROM categories WHERE id = $1",
            category_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Not found")
        
        cache.invalidate("categories", "materials")
        return True
