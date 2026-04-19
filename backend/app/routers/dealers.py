"""
Dealers router - /api/dealers/*
"""
from typing import List
from fastapi import APIRouter, Depends
from app.schemas.users import DealerCreate, DealerUpdate, PaymentCreate
from app.services.dealer_service import DealerService
from app.deps import require_admin

router = APIRouter(prefix="/dealers", tags=["dealers"])
dealer_service = DealerService()


@router.post("")
async def create_dealer(data: DealerCreate, admin: dict = Depends(require_admin)):
    """Create dealer."""
    return await dealer_service.create(data)


@router.get("")
async def list_dealers(admin: dict = Depends(require_admin)) -> List[dict]:
    """List all dealers."""
    return await dealer_service.list_all()


@router.put("/{dealer_id}")
async def update_dealer(
    dealer_id: str,
    data: DealerUpdate,
    admin: dict = Depends(require_admin)
):
    """Update dealer."""
    return await dealer_service.update(int(dealer_id), data)


@router.delete("/{dealer_id}")
async def delete_dealer(dealer_id: str, admin: dict = Depends(require_admin)):
    """Delete dealer."""
    await dealer_service.delete(int(dealer_id))
    return {"message": "Deleted"}


@router.post("/{dealer_id}/payment")
async def add_payment(
    dealer_id: str,
    data: PaymentCreate,
    admin: dict = Depends(require_admin)
):
    """Add payment."""
    return await dealer_service.add_payment(int(dealer_id), data)


@router.get("/{dealer_id}/payments")
async def get_payments(dealer_id: str, admin: dict = Depends(require_admin)):
    """Get dealer payments."""
    return await dealer_service.get_payments(int(dealer_id))
