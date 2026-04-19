"""
Base repository for database operations.
"""
from typing import Any, Dict, List, Optional, TypeVar, Generic
import asyncpg
from app.db.database import Database, db

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Base repository with common CRUD."""
    
    def __init__(self, database: Database = None):
        self.db = database or db
    
    @staticmethod
    def row_to_dict(row: Optional[asyncpg.Record]) -> Optional[Dict[str, Any]]:
        if row is None:
            return None
        return dict(row)
    
    def convert_ids(self, data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Convert integer IDs to strings for JSON."""
        if not data:
            return None
        
        # ID fields to convert
        id_fields = ["id", "dealer_id", "category_id", "sender_id", "receiver_id", 
                     "material_id", "worker_id", "order_id", "payment_id"]
        
        for field in id_fields:
            if field in data and data[field] is not None:
                data[field] = str(data[field])
        
        # Remove sensitive data
        data.pop("password_hash", None)
        
        return data
    
    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Fetch single record."""
        async with self.db.acquire() as conn:
            row = await conn.fetchrow(query, *args)
            return self.convert_ids(self.row_to_dict(row))
    
    async def fetch_many(self, query: str, *args) -> List[Dict[str, Any]]:
        """Fetch multiple records."""
        async with self.db.acquire() as conn:
            rows = await conn.fetch(query, *args)
            return [self.convert_ids(self.row_to_dict(r)) for r in rows]
    
    async def execute(self, query: str, *args) -> str:
        """Execute query."""
        async with self.db.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetchval(self, query: str, *args) -> Any:
        """Fetch single value."""
        async with self.db.acquire() as conn:
            return await conn.fetchval(query, *args)
