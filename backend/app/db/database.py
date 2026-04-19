"""
Supabase PostgreSQL connection pooling.
Optimized for Supabase pooler (port 6543) with SSL.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
import asyncpg
from asyncpg import Pool, Connection
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class Database:
    """Manages Supabase PostgreSQL connection pool."""
    
    _instance: Optional["Database"] = None
    _pool: Optional[Pool] = None
    
    def __new__(cls) -> "Database":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self) -> None:
        """Initialize connection pool for Supabase."""
        if self._pool is not None:
            return
        
        try:
            # Parse DATABASE_URL for Supabase
            # Format: postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
            db_url = settings.DATABASE_URL
            
            # Ensure SSL mode for Supabase
            if "sslmode" not in db_url:
                db_url += "?sslmode=require"
            
            self._pool = await asyncpg.create_pool(
                db_url,
                min_size=settings.DB_POOL_MIN_SIZE,
                max_size=settings.DB_POOL_MAX_SIZE,
                command_timeout=settings.DB_COMMAND_TIMEOUT,
                init=self._init_connection,
            )
            logger.info(f"Connected to Supabase PostgreSQL")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    async def _init_connection(self, conn: Connection) -> None:
        """Initialize connection settings."""
        await conn.execute("SET TIMEZONE TO 'UTC'")
    
    async def disconnect(self) -> None:
        """Close pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Database disconnected")
    
    async def health_check(self) -> bool:
        """Check connectivity."""
        try:
            async with self._pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    @asynccontextmanager
    async def acquire(self) -> AsyncGenerator[Connection, None]:
        """Acquire connection."""
        if not self._pool:
            raise RuntimeError("Database not connected")
        async with self._pool.acquire() as conn:
            yield conn
    
    @asynccontextmanager
    async def transaction(self) -> AsyncGenerator[Connection, None]:
        """Acquire connection with transaction."""
        if not self._pool:
            raise RuntimeError("Database not connected")
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                yield conn
    
    @property
    def pool(self) -> Optional[Pool]:
        return self._pool


db = Database()


async def init_db() -> None:
    """Initialize on startup."""
    await db.connect()


async def close_db() -> None:
    """Close on shutdown."""
    await db.disconnect()
