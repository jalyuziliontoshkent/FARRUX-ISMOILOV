"""
In-memory caching with Redis-compatible interface.
Ready for Redis migration when needed.
"""
import time
from typing import Any, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


class Cache:
    """Simple in-memory cache with TTL."""
    
    def __init__(self):
        self._store: dict = {}
        self._ttl: dict = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get value if not expired."""
        if key in self._store and time.time() < self._ttl.get(key, 0):
            return self._store[key]
        
        # Clean up expired
        self._store.pop(key, None)
        self._ttl.pop(key, None)
        return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value with TTL."""
        self._store[key] = value
        self._ttl[key] = time.time() + ttl_seconds
    
    def delete(self, key: str) -> None:
        """Delete key."""
        self._store.pop(key, None)
        self._ttl.pop(key, None)
    
    def invalidate(self, *prefixes: str) -> None:
        """Delete keys starting with prefixes."""
        keys_to_del = [
            k for k in self._store 
            if any(k.startswith(p) for p in prefixes)
        ]
        for k in keys_to_del:
            self._store.pop(k, None)
            self._ttl.pop(k, None)
    
    def clear(self) -> None:
        """Clear all."""
        self._store.clear()
        self._ttl.clear()


# Global cache instance
cache = Cache()
