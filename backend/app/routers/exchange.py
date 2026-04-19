"""
Exchange rate router - /api/exchange-rate
"""
from fastapi import APIRouter
from app.services.exchange_service import ExchangeService

router = APIRouter(tags=["exchange"])


@router.get("/exchange-rate")
async def get_exchange_rate():
    """Get USD/UZS exchange rate."""
    return await ExchangeService.get_rate()
