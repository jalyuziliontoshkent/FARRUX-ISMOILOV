"""
Exchange rate service - CBU.uz integration.
"""
import httpx
from app.core.config import settings
from app.core.logging import get_logger
from app.utils.cache import cache

logger = get_logger(__name__)


class ExchangeService:
    """Exchange rate operations."""
    
    CACHE_KEY = "exchange_rate"
    CACHE_TTL = 3600
    FALLBACK_RATE = 12800.0
    
    @classmethod
    async def get_rate(cls) -> dict:
        """Get USD/UZS rate."""
        cached = cache.get(cls.CACHE_KEY)
        if cached:
            return cached
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(settings.CBU_API_URL)
                data = resp.json()
                
                if data and len(data) > 0:
                    rate = float(data[0]["Rate"])
                    result = {
                        "rate": rate,
                        "currency": "UZS",
                        "date": data[0].get("Date", ""),
                        "source": "CBU.uz"
                    }
                    cache.set(cls.CACHE_KEY, result, cls.CACHE_TTL)
                    return result
                    
        except Exception as e:
            logger.warning(f"CBU API error: {e}")
        
        # Fallback
        fallback = {
            "rate": cls.FALLBACK_RATE,
            "currency": "UZS",
            "date": "",
            "source": "fallback"
        }
        cache.set(cls.CACHE_KEY, fallback, 300)
        return fallback
    
    @classmethod
    def invalidate(cls) -> None:
        """Clear cache."""
        cache.delete(cls.CACHE_KEY)
